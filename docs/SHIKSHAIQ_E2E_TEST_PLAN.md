# ShikshaIQ — End-to-End Test Plan (Phase 09)

**Date:** 2026-10-30  
**Role:** Senior QA Engineer, Full-Stack Developer & Security Tester  
**Application:** ShikshaIQ (NCERT Class 7 Fractions Adaptive Learning Platform)  
**Target Environments:** Local Isolated Test Environment (`http://localhost:3000`), Supabase PostgreSQL Backend.

---

## 1. Test Suite Structure & Coverage Inventory

The end-to-end test plan covers 11 major functional and security domains across all 5 user roles:
- **Anonymous Visitor** (Public website, landing page, login, signup, auth callbacks)
- **Student** (Dashboard, diagnostic assessment, results, lessons, practice, offline queueing, AI tutor)
- **Pending Teacher** (Restricted access, approval queue status, access blocking)
- **Approved Teacher** (Classroom cohorts, join codes, rosters, student mastery analytics, explainable interventions)
- **Administrator** (Platform metrics, teacher approval/rejection, classroom oversight, answer key inspector, audit timeline)

---

## 2. Test Cases Specification

### Suite 1: Public Website & Navigation (PUB)
- **PUB-01 (Landing Page Rendering):** Verify hero section, value proposition, CTAs, curriculum overview, and footer load without console errors or layout shifts.
- **PUB-02 (Navigation & Routing):** Verify header navigation links lead to correct sections/pages, and mobile navigation toggles cleanly.
- **PUB-03 (404 Fallback):** Verify navigating to non-existent route (`/non-existent-page`) renders a valid, accessible Not Found page with return-to-home link.
- **PUB-04 (PWA Web App Manifest):** Verify `/manifest.webmanifest` returns HTTP 200 with valid JSON, standalone display mode, and high-contrast theme color.

### Suite 2: Authentication, Registration & Role Isolation (AUTH)
- **AUTH-01 (Student Signup Validation):** Verify student signup enforces required fields, email format, password length (>=6 chars), and grade level (6–10).
- **AUTH-02 (Teacher Signup & Pending Status):** Verify teacher registration assigns `role: 'teacher'` and `account_status: 'pending_approval'`.
- **AUTH-03 (Privilege Escalation Defense):** Verify public signup payload containing `role: 'admin'` is rejected by schema and coerced to `'student'` by database trigger.
- **AUTH-04 (Login & Credential Verification):** Verify valid credentials authenticate and redirect to role-appropriate portal; invalid credentials return clear error.
- **AUTH-05 (Open Redirect Protection):** Verify `next` redirect query parameter rejects external URLs (`https://evil.com`, `//evil.com`) and accepts safe relative paths.
- **AUTH-06 (Sign Out & Session Clearing):** Verify signing out clears session cookies and resets client `syncManager` active user to `null`.

### Suite 3: Role Access Control Matrix (RBAC)
- **RBAC-01 (Anonymous Route Guards):** Verify accessing `/student`, `/teacher`, `/admin`, or `/pending-approval` while unauthenticated redirects to `/login`.
- **RBAC-02 (Student Access Restrictions):** Verify authenticated student cannot access `/teacher` (redirects to `/student`) or `/admin` (redirects to `/student`).
- **RBAC-03 (Pending Teacher Access Restrictions):** Verify pending teacher visiting `/teacher` is redirected to `/pending-approval`.
- **RBAC-04 (Approved Teacher Access):** Verify approved teacher can access `/teacher` and `/teacher/students`, but cannot access `/admin`.
- **RBAC-05 (Admin Access):** Verify administrator can access `/admin`, view metrics, and manage teacher approvals.
- **RBAC-06 (Private Answer Key Protection):** Verify `public.question_answer_keys` is blocked from client SELECT requests; answer keys are inaccessible to students and teachers.

### Suite 4: Student Learning Journey (STUDENT)
- **STUDENT-01 (Student Dashboard Empty State):** Verify new student sees 0% initial progress, empty activity state, and prompt to take diagnostic assessment.
- **STUDENT-02 (Diagnostic Assessment Runner):** Verify 15-question quiz loads with single-question view, timer, option selection, and forward/backward review.
- **STUDENT-03 (Server Scoring & Result Persistence):** Verify submission is graded by `/api/assessment/submit` using server answer keys, attempts are saved to `student_attempts`, and mastery records are written to `student_mastery`.
- **STUDENT-04 (Results Screen Presentation):** Verify `/student/results` presents overall accuracy, concept-by-concept mastery, prerequisite bottleneck analysis, and question review.
- **STUDENT-05 (Lesson Reader & Visual Model):** Verify `/student/learn/[conceptId]` presents summary, visual fraction model, worked examples, common mistakes, and pro tips.
- **STUDENT-06 (Adaptive Practice & Instant Feedback):** Verify `/student/practice/[conceptId]` submits answers to `/api/practice/submit`, validates server-side, shows pedagogical feedback, and updates mastery without client score fabrication.

### Suite 5: Adaptive Learning Engine (ADAPT)
- **ADAPT-01 (Prerequisite Bottleneck Remediation):** Verify struggling with prerequisite (e.g. `fraction-basics`) triggers recommendation to remediate root prerequisite before advancing to downstream concepts (e.g. `equivalent-fractions`).
- **ADAPT-02 (Advancement on Mastery):** Verify scoring >=80% with >=3 valid attempts marks concept as `mastered` and advances recommendation to next node in DAG.
- **ADAPT-03 (DAG Cycle Safety):** Verify `validateConceptGraph` detects self-loops and circular cycles, failing safely with `ConceptGraphError`.

### Suite 6: Socratic AI Tutor (TUTOR)
- **TUTOR-01 (Drawer UI & Multilingual Switcher):** Verify Socratic tutor drawer opens smoothly, supports English, Hindi (हिंदी), and Marathi (मराठी).
- **TUTOR-02 (Zero Key Ingestion):** Verify tutor context builder never imports or includes `ANSWER_KEYS` in prompts sent to model providers.
- **TUTOR-03 (Rate Limiting):** Verify rate limiter restricts students to 15 requests per minute, returning HTTP 429 when exceeded.
- **TUTOR-04 (Unconfigured Provider Graceful Notice):** Verify `NullTutorProvider` returns clear setup instructions when no API key is configured (never generates fake chat responses).

### Suite 7: Teacher Workflow & Classroom Management (TEACH)
- **TEACH-01 (Teacher Dashboard Metrics):** Verify teacher dashboard displays real student enrollment counts, cohort selector, and classroom metrics.
- **TEACH-02 (Classroom Creation & Join Code):** Verify `createClassroomAction` generates unique 6-character alphanumeric join code and persists classroom.
- **TEACH-03 (Classroom Roster & Mastery Distribution):** Verify teacher can view enrolled student rosters with concept mastery breakdowns.
- **TEACH-04 (Cross-Teacher Cohort Isolation):** Verify Teacher B cannot view, query, or modify Teacher A's classroom cohort.
- **TEACH-05 (Teacher Intervention Modal):** Verify teacher can submit an explainable recommendation override and that it persists in `teacher_interventions` without altering raw historical student attempt records.

### Suite 8: Administrator Operations (ADMIN)
- **ADMIN-01 (Platform Overview Metrics):** Verify admin dashboard queries real counts of users, students, teachers, admins, classrooms, and attempts.
- **ADMIN-02 (Teacher Approval Flow):** Verify pending teacher request can be approved, updating `account_status` to `'active'` and creating an immutable audit log entry.
- **ADMIN-03 (Teacher Rejection Flow):** Verify teacher request can be rejected with documented reason, updating `account_status` to `'rejected'`.
- **ADMIN-04 (Curriculum & Answer Key Inspector):** Verify authorized administrators can inspect all 25 curriculum questions, options, and server answer keys with explanations.
- **ADMIN-05 (Audit Timeline):** Verify `AdminAuditTimeline` displays immutable audit log records with actor and timestamp.

### Suite 9: Offline Learning & PWA Synchronization (OFFLINE)
- **OFFLINE-01 (Download Concept for Offline):** Verify "Save for Offline" caches lesson and public questions into IndexedDB.
- **OFFLINE-02 (Offline Practice Attempt Queueing):** Verify selecting an option while offline enqueues attempt in IndexedDB with `status: 'pending'` and client UUIDv4 idempotency key.
- **OFFLINE-03 (No Client Mastery Changes):** Verify local queued attempts do not modify or compute concept mastery on the client.
- **OFFLINE-04 (Reconnection Batch Synchronization):** Verify reconnecting triggers `/api/practice/sync` which grades attempts, updates mastery in Supabase, and clears queued items from IndexedDB.
- **OFFLINE-05 (Idempotency Deduplication):** Verify duplicate sync requests return `already_processed` without double-counting mastery evidence or inserting duplicate records.
- **OFFLINE-06 (Multi-Account Isolation):** Verify IndexedDB stores partition pending attempts strictly by `userId`; logging out clears active user context.

### Suite 10: Negative Security & Edge Cases (SEC)
- **SEC-01 (Cross-Tenant Student Data Access):** Verify Student A cannot fetch Student B's attempt records.
- **SEC-02 (Answer Key Direct API Query):** Verify direct client queries to `question_answer_keys` are blocked by RLS.
- **SEC-03 (Client Mastery Mutation Attempt):** Verify direct client INSERT/UPDATE on `student_mastery` is blocked by RLS.
- **SEC-04 (Suspended User Action Blocking):** Verify suspended user attempting server action or tutor call receives HTTP 403 / authorization rejection.

### Suite 11: HTTP Security & Responsive UI (HTTP/UI)
- **HTTP-01 (Security Headers):** Verify production responses include CSP, HSTS, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, and disable `X-Powered-By`.
- **UI-01 (Responsive Viewports):** Verify landing, student, teacher, and admin pages render cleanly without horizontal overflow at desktop (1536x730) and mobile (375x667) viewports.

---

## 3. Automated & Manual Test Strategy

1. **Automated Unit & Integration Test Suite (`npm test`):**
   - 31 existing suites covering curriculum, scoring, adaptive engine, teacher workflows, admin workflows, offline sync, tutor guardrails, and security audits.
   - Comprehensive new E2E test suite: `tests/e2eWorkflows.test.ts` exercising complete cross-role workflows, state transitions, and edge cases.
2. **Browser Subagent Walkthroughs:**
   - Public navigation & landing page walkthrough.
   - Student diagnostic assessment, practice runner, and offline queuing walkthrough.
   - Teacher dashboard, cohort selector, and intervention walkthrough.
   - Admin metrics, teacher approval, and question bank inspector walkthrough.
3. **Quality Gates:**
   - `npm test`: 100% pass rate.
   - `npm run lint`: 0 errors, 0 warnings.
   - `npx tsc --noEmit`: 0 errors.
   - `npm run build`: All 21 routes build cleanly.
