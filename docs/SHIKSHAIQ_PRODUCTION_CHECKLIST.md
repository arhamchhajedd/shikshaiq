# ShikshaIQ — Production Readiness Checklist (Phase 08)

This checklist tracks the deployment readiness of ShikshaIQ for controlled staging and production launch.

---

## 1. Authentication & Role-Based Authorization
- [x] **[PASS]** Unauthenticated users cannot access `/student/*`, `/teacher/*`, or `/admin/*` routes.
- [x] **[PASS]** Students cannot access teacher or administrator panels.
- [x] **[PASS]** Pending teachers cannot access classroom management or student records.
- [x] **[PASS]** Suspended accounts are immediately signed out and blocked from all protected actions.
- [x] **[PASS]** Teachers can only access classrooms they own and students enrolled in their cohorts.
- [x] **[PASS]** Admin authorization is derived from server-verified database roles, never client state.
- [x] **[PASS]** Public signup schema restricts roles strictly to `student` and `teacher` (never `admin`).
- [x] **[PASS]** Database trigger `handle_new_user()` coerces any public attempt to self-declare `admin` to `student`.
- [x] **[PASS]** Auth callbacks and login redirect parameters validate targets against open redirect attacks.

---

## 2. Supabase, Database Grants & Row Level Security (RLS)
- [x] **[PASS]** Row Level Security enabled across all application tables.
- [x] **[PASS]** `question_answer_keys` grants revoked from `anon` and `authenticated`; zero client SELECT policies.
- [x] **[PASS]** Multi-tenant RLS isolation on `student_attempts`, `student_mastery`, and `tutor_conversations`.
- [x] **[PASS]** Client cannot directly insert or modify records in `student_mastery`.
- [x] **[PASS]** Classroom join code enrollment RPC `enroll_in_classroom` validates code and assigns membership securely.
- [x] **[PASS]** Teacher interventions are stored separately from raw attempts without rewriting historical evidence.
- [x] **[PASS]** `public.audit_logs` is append-only with zero UPDATE/DELETE permissions.

---

## 3. Secret Management & Environmental Safety
- [x] **[PASS]** Zero private credentials or API keys committed to the repository.
- [x] **[PASS]** `.env.local` strictly excluded in `.gitignore`.
- [x] **[PASS]** `.env.example` committed with template placeholders only.
- [x] **[PASS]** `SUPABASE_SERVICE_ROLE_KEY` and LLM keys (`GEMINI_API_KEY`, `OPENAI_API_KEY`) isolated to server.
- [x] **[PASS]** Server errors log sanitized generic messages to clients without leaking stack traces or PII.

---

## 4. Assessment & Adaptive Engine Integrity
- [x] **[PASS]** Correctness validated strictly on the server against authoritative `ANSWER_KEYS`.
- [x] **[PASS]** Client-submitted correctness and mastery values are never accepted.
- [x] **[PASS]** Missing assessment evidence defaults to `not_started` and is never treated as proven inability.
- [x] **[PASS]** Adaptive engine prioritizes root prerequisite bottlenecks before downstream concepts.
- [x] **[PASS]** Concept graph validation detects self-loops and circular cycles using 3-color DFS.
- [x] **[PASS]** Partial unique index `idx_student_attempts_idempotency` deduplicates submissions and prevents double counting.

---

## 5. Socratic AI Tutor Guardrails
- [x] **[PASS]** Authentication and account status checked before every tutor request.
- [x] **[PASS]** Sliding window rate limiting enforces 15 requests/minute threshold per student.
- [x] **[PASS]** Secret answer keys are strictly excluded from AI prompts and context assembly.
- [x] **[PASS]** Socratic prompt engineering prevents direct answer reveal and enforces culturally relatable Indian analogies.
- [x] **[PASS]** Model responses rendered safely without executing arbitrary HTML or script injection.
- [x] **[PASS]** `NullTutorProvider` declared honestly when no API key is configured (never fabricates fake replies).

---

## 6. Offline Learning & Synchronization (PWA)
- [x] **[PASS]** Web App Manifest configured with Apple minimal aesthetic and standalone display mode.
- [x] **[PASS]** Service worker (`public/sw.js`) caches static assets and navigation routes with strict never-cache patterns for authenticated endpoints.
- [x] **[PASS]** IndexedDB caches approved lessons and public questions with zero answer key leakage.
- [x] **[PASS]** Offline practice attempts enqueued with client UUIDv4 idempotency keys and marked as `pending`.
- [x] **[PASS]** Client never computes or alters mastery locally; mastery updates strictly await server sync.
- [x] **[PASS]** Multi-account isolation: IndexedDB stores partitioned by `userId`; logout clears active user immediately.
- [x] **[PASS]** Failed sync requests remain recoverable in IndexedDB for subsequent retry upon reconnection.
- [x] **[PASS]** Device storage limits (`QuotaExceededError`) reported honestly to the student.

---

## 7. HTTP Security Headers
- [x] **[PASS]** Content-Security-Policy (CSP) configured in `next.config.ts`.
- [x] **[PASS]** `X-Frame-Options: DENY` configured for frame protection against clickjacking.
- [x] **[PASS]** `X-Content-Type-Options: nosniff` configured.
- [x] **[PASS]** `Strict-Transport-Security` (HSTS) configured for production HTTPS (`max-age=63072000`).
- [x] **[PASS]** `Referrer-Policy: strict-origin-when-cross-origin` configured.
- [x] **[PASS]** `poweredByHeader: false` disables `X-Powered-By: Next.js`.

---

## 8. Student Privacy & Compliance (DPDP Act 2023)
- [x] **[PASS]** Data minimization: only educational essentials collected (`full_name`, `email`, `grade_level` [6-10], `school_name`).
- [x] **[PASS]** No third-party analytics trackers, cookies, or marketing scripts.
- [x] **[PASS]** Student names, emails, and profile IDs excluded from AI tutor context payloads.

---

## 9. Performance & Accessibility
- [x] **[PASS]** Modern typography with tight tracking and high-contrast monochrome design system.
- [x] **[PASS]** Semantic HTML elements (`<header>`, `<main>`, `<section>`, `<footer>`, proper heading hierarchy).
- [x] **[PASS]** Visible focus rings and keyboard accessibility on interactive buttons and inputs.
- [x] **[PASS]** Mobile-responsive layouts with touch-friendly targets across student, teacher, and admin screens.

---

## 10. Automated Quality Gates & Build Verification
- [x] **[PASS]** Unit and security tests: **84 of 84 passing across 31 test suites** (`npm test`).
- [x] **[PASS]** Linting: **0 errors, 0 warnings** (`npm run lint`).
- [x] **[PASS]** TypeScript strict mode: **0 errors** (`npx tsc --noEmit`).
- [x] **[PASS]** Production build: **All 21 routes compiled successfully** (`npm run build`).

---

## Overall Assessment
**Status:** **READY FOR CONTROLLED STAGING LAUNCH**  
*The ShikshaIQ platform satisfies all architectural, security, offline, pedagogical, and quality requirements.*
