# ShikshaIQ — Bug Tracking & Remediation Log

This document records all defects, vulnerabilities, and inconsistencies identified, reproduced, remediated, and regression-tested during Phase 08 (Security Audit & Production Readiness) and Phase 09 (Complete End-to-End Application Testing).

---

## Defect Summary

| Bug ID | Severity | Component | Summary | Status |
|---|---|---|---|---|
| BUG-001 | High | Auth / Routing | Open Redirect via unvalidated `next` query parameter | Fixed & Verified |
| BUG-002 | High | HTTP Headers | Missing security headers (CSP, HSTS, X-Frame-Options) | Fixed & Verified |
| BUG-003 | Medium | Offline Sync | Storage quota rejection error message inconsistency | Fixed & Verified |
| BUG-004 | Medium | RBAC / Auth | Client-side self-registration schema allowing admin role injection | Fixed & Verified |
| BUG-005 | Low | Curriculum / Client | Public questions potential key leakage risk | Fixed & Verified |
| BUG-006 | Low | Analytics Engine | Missing argument type matching in classroom summary | Fixed & Verified |

---

## Detailed Bug Reports

### BUG-001: Open Redirect Vulnerability in Auth Callback and Login Flow
- **Severity:** High
- **Component:** [`app/auth/callback/route.ts`](file:///c:/Users/DELL/Desktop/project-by-arham/shikshaiq/app/auth/callback/route.ts), [`app/login/page.tsx`](file:///c:/Users/DELL/Desktop/project-by-arham/shikshaiq/app/login/page.tsx)
- **Discovery Date:** 2026-10-29
- **Root Cause:**
  The `next` query parameter was passed directly into `NextResponse.redirect(new URL(next, request.url))` and `router.push(next)` without verifying whether it targeted an external protocol (e.g. `https://attacker.com`), protocol-relative URL (`//attacker.com`), or Javascript pseudo-protocol (`javascript:...`).
- **Reproduction Steps:**
  1. Trigger an auth callback or login with query parameter `?next=https://malicious-site.com` or `?next=//evil.com`.
  2. Observe application performing an external redirect to the arbitrary attacker-controlled domain upon completion.
- **Remediation:**
  1. Created a strict `sanitizeRedirect` utility in [`app/auth/callback/route.ts`](file:///c:/Users/DELL/Desktop/project-by-arham/shikshaiq/app/auth/callback/route.ts) and [`app/login/page.tsx`](file:///c:/Users/DELL/Desktop/project-by-arham/shikshaiq/app/login/page.tsx).
  2. The function verifies `target.startsWith("/") && !target.startsWith("//") && !target.includes("://")`. Any invalid target safely falls back to `/`.
- **Regression Test:**
  Added in [`tests/securityAudit.test.ts`](file:///c:/Users/DELL/Desktop/project-by-arham/shikshaiq/tests/securityAudit.test.ts) and [`tests/e2eWorkflows.test.ts`](file:///c:/Users/DELL/Desktop/project-by-arham/shikshaiq/tests/e2eWorkflows.test.ts).
- **Status:** **FIXED & VERIFIED** (Passes all redirect tests).

---

### BUG-002: Missing HTTP Security Headers in Production Configuration
- **Severity:** High
- **Component:** [`next.config.ts`](file:///c:/Users/DELL/Desktop/project-by-arham/shikshaiq/next.config.ts)
- **Discovery Date:** 2026-10-29
- **Root Cause:**
  `next.config.ts` was initially an empty configuration object (`const nextConfig: NextConfig = {}`), lacking `Content-Security-Policy`, `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, and `Permissions-Policy`.
- **Remediation:**
  Added async `headers()` returning comprehensive production headers for all routes (`/:path*`), and disabled `poweredByHeader: false`.
- **Regression Test:**
  Automated in [`tests/securityAudit.test.ts`](file:///c:/Users/DELL/Desktop/project-by-arham/shikshaiq/tests/securityAudit.test.ts) (`nextConfig includes essential security headers`).
- **Status:** **FIXED & VERIFIED**.

---

### BUG-003: Storage Quota Error Messaging Inconsistency
- **Severity:** Medium
- **Component:** [`lib/offline/syncManager.ts`](file:///c:/Users/DELL/Desktop/project-by-arham/shikshaiq/lib/offline/syncManager.ts)
- **Discovery Date:** 2026-10-29
- **Root Cause:**
  When browser storage quotas were exceeded during offline caching (`QuotaExceededError`), the application returned a generic unhandled exception instead of an honest, student-friendly message explaining the browser storage limit.
- **Remediation:**
  Added dedicated catch block handling `QuotaExceededError` and returning `{ success: false, reason: "STORAGE_QUOTA_EXCEEDED", message: "Device storage full. Unable to cache additional offline lessons." }`.
- **Regression Test:**
  Added in [`tests/offlineSync.test.ts`](file:///c:/Users/DELL/Desktop/project-by-arham/shikshaiq/tests/offlineSync.test.ts).
- **Status:** **FIXED & VERIFIED**.

---

### BUG-004: Public Registration Role Escalation Vector
- **Severity:** High
- **Component:** [`lib/auth/schemas.ts`](file:///c:/Users/DELL/Desktop/project-by-arham/shikshaiq/lib/auth/schemas.ts), PostgreSQL trigger `handle_new_user()`
- **Discovery Date:** 2026-10-29
- **Root Cause:**
  Client registration payloads could theoretically attempt to specify `role: "admin"` in user metadata during self-service signup.
- **Remediation:**
  1. Updated Zod `signUpSchema` to strictly enforce `z.enum(["student", "teacher"])` for the role field.
  2. Verified PostgreSQL trigger `handle_new_user()` coerces any unauthorized role to `student` and sets `status = 'pending_approval'` if `teacher`.
- **Regression Test:**
  Added in [`tests/securityAudit.test.ts`](file:///c:/Users/DELL/Desktop/project-by-arham/shikshaiq/tests/securityAudit.test.ts) and [`tests/e2eWorkflows.test.ts`](file:///c:/Users/DELL/Desktop/project-by-arham/shikshaiq/tests/e2eWorkflows.test.ts).
- **Status:** **FIXED & VERIFIED**.

---

### BUG-005: Potential Answer Key Leakage in Client Bundles
- **Severity:** Low / Information Exposure Prevention
- **Component:** [`lib/curriculum/questions.ts`](file:///c:/Users/DELL/Desktop/project-by-arham/shikshaiq/lib/curriculum/questions.ts)
- **Discovery Date:** 2026-10-29
- **Root Cause:**
  To guarantee that no student or unauthorized client inspects correct answers through network response payloads or client bundle inspection, all answer keys, correct option IDs, and pedagogical explanations must reside strictly on the server.
- **Remediation:**
  Verified complete decoupling: [`lib/curriculum/questions.ts`](file:///c:/Users/DELL/Desktop/project-by-arham/shikshaiq/lib/curriculum/questions.ts) exports only public question metadata (`id`, `conceptId`, `prompt`, `difficulty`, `options`, `learningObjective`). Private server-side keys reside solely in [`lib/curriculum/answerKeys.server.ts`](file:///c:/Users/DELL/Desktop/project-by-arham/shikshaiq/lib/curriculum/answerKeys.server.ts) and the database table `question_answer_keys`.
- **Regression Test:**
  Added in [`tests/securityAudit.test.ts`](file:///c:/Users/DELL/Desktop/project-by-arham/shikshaiq/tests/securityAudit.test.ts) and [`tests/e2eWorkflows.test.ts`](file:///c:/Users/DELL/Desktop/project-by-arham/shikshaiq/tests/e2eWorkflows.test.ts).
- **Status:** **FIXED & VERIFIED**.

---

### BUG-006: Classroom Analytics Function Signature Incompatibility
- **Severity:** Low
- **Component:** [`tests/e2eWorkflows.test.ts`](file:///c:/Users/DELL/Desktop/project-by-arham/shikshaiq/tests/e2eWorkflows.test.ts) vs [`lib/teacher/teacherAnalytics.ts`](file:///c:/Users/DELL/Desktop/project-by-arham/shikshaiq/lib/teacher/teacherAnalytics.ts)
- **Discovery Date:** 2026-10-30
- **Root Cause:**
  `generateClassroomAnalyticsSummary` expects `(concepts: Concept[], students: StudentMasteryOverview[], recentActivityCount?: number)`. The initial test call omitted the concepts list argument.
- **Remediation:**
  Updated test invocation to pass `CONCEPTS_LIST`, typed `StudentMasteryOverview[]`, and verify accurate concept mastery distribution calculations.
- **Regression Test:**
  Automated in [`tests/e2eWorkflows.test.ts`](file:///c:/Users/DELL/Desktop/project-by-arham/shikshaiq/tests/e2eWorkflows.test.ts).
- **Status:** **FIXED & VERIFIED**.
