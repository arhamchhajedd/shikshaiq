# Changelog

All notable changes to the ShikshaIQ codebase are documented in this file.

## [Phase 09] - 2026-10-30

### Added
- **Complete End-to-End Application Testing Plan (`docs/SHIKSHAIQ_E2E_TEST_PLAN.md`):**
  - Exhaustive 11-suite test plan covering all 5 user roles (Anonymous, Student, Pending Teacher, Approved Teacher, Administrator).
  - Explicit non-negotiable rules: Zero fake production data, Never assume credentials, Test real functionality, Preserve existing functionality.
- **Automated End-to-End Test Suite (`tests/e2eWorkflows.test.ts`):**
  - 17 cross-cutting E2E integration tests verifying:
    - NCERT Class 7 curriculum integrity across all 25 practice questions and 15 diagnostic questions.
    - Role-based registration authorization and privilege escalation rejection.
    - Open redirect protection across all authentication routes.
    - Deterministic 15-question diagnostic scoring and prerequisite bottleneck identification.
    - Adaptive DAG traversal directing students to foundational prerequisite gaps.
    - Classroom analytics cohort distribution calculations and intervention history preservation.
    - Privileged administrator question bank inspector and teacher approval state transitions with audit logging.
    - Offline practice attempt queueing, idempotency deduplication, and multi-student isolation.
    - Production HTTP security headers (CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy).
  - Expanded total automated test suite to **101 tests passing across 38 suites** (`npm test`).
- **Defect Tracking & Remediation Log (`docs/SHIKSHAIQ_BUGS.md`):**
  - Documented, reproduced, and remediated 6 defects (BUG-001 through BUG-006) with 100% resolution rate.
- **Complete End-to-End Test Results (`docs/SHIKSHAIQ_E2E_RESULTS.md`):**
  - Evidence-based test report covering all 11 suites, role access matrix, automated verification logs, and recommended rollout actions.
- **Browser Automation Verification:**
  - Automated walkthroughs across public landing page, authentication screens, pending approval view, student diagnostic runner, practice runner, and admin portal.
  - Confirmed strict compliance with the White & Black Apple-inspired minimal aesthetic with zero unhandled errors or dead buttons.

## [Phase 08] - 2026-10-30

### Added
- **Security Audit & Production Hardening (`docs/SHIKSHAIQ_SECURITY_AUDIT.md`):**
  - Comprehensive vulnerability review across Authentication, RLS policies, Secret isolation, Adaptive Engine, AI Tutor, and Offline Sync.
  - Implemented strict Content-Security-Policy (CSP), Strict-Transport-Security (HSTS), X-Frame-Options: DENY, and X-Content-Type-Options: nosniff in `next.config.ts`.
  - Disabled `poweredByHeader` to prevent framework fingerprinting.
  - Remediated open redirect vulnerability in `/auth/callback` and `/login` via relative URI sanitization.
  - Exempted `.env.example` in `.gitignore` to maintain version-controlled template configurations.
- **Production Readiness Checklist (`docs/SHIKSHAIQ_PRODUCTION_CHECKLIST.md`):**
  - 10-section operational checklist with all items verified passing.
- **Automated Security Audit Tests (`tests/securityAudit.test.ts`):**
  - 10 automated unit tests verifying open redirect protection, public admin escalation prevention, curriculum answer key isolation, adaptive graph cycle detection, and security headers.
  - Total test suite expanded to **84 of 84 tests passing across 31 suites**.

## [Phase 07] - 2026-10-30

### Added
- **Progressive Web App (PWA) Foundation:**
  - Next.js Web App Manifest (`app/manifest.ts` & `public/manifest.json`) supporting standalone display mode, portrait orientation, theme color `#000000`, and background color `#ffffff`.
  - Scalable vector squircle PWA icons (`public/icons/icon.svg`).
  - Production service worker (`public/sw.js`) with versioned static cache (`shikshaiq-v1-static`).
  - Explicit Never-Cache security rules protecting authenticated endpoints (`/api/*`, `/auth/*`, `/teacher/*`, `/admin/*`, `/pending-approval`, and `supabase.co`).
  - Client component registration (`components/offline/ServiceWorkerRegistration.tsx`).
- **IndexedDB Local Storage Layer (`lib/offline/indexedDb.ts`):**
  - Dependency-free typed IndexedDB persistence engine (`shikshaiq_offline_v1`).
  - Dedicated object stores: `cached_lessons`, `cached_questions`, `pending_attempts`, `sync_metadata`.
  - Zero answer key caching: public questions cached with prompts and options only; answer keys strictly remain server-side.
  - Multi-user isolation: attempts indexed by student `userId`.
- **Client Synchronization Manager (`lib/offline/syncManager.ts`):**
  - Online/offline event listener and reactive state subscription system.
  - Client-side UUIDv4 idempotency key generation.
  - Attempt queueing and batching.
  - Curriculum caching utility (`cacheCurriculumConcept`).
- **Server-Side Batch Sync & Database Idempotency (`/api/practice/sync`):**
  - Protected API endpoint with session authentication (`getUser()`) and Zod batch schema (max 20 items).
  - Supabase migration `20261030040000_phase07_offline_sync.sql` adding `idempotency_key` and unique partial index `idx_student_attempts_idempotency` to `student_attempts`.
  - Evaluates attempts against authoritative server `ANSWER_KEYS` (client cannot fabricate correctness).
  - Recalculates deterministic concept mastery and recommendations upon attempt acceptance.
  - Duplicate idempotency keys return `already_processed` without double-counting evidence.
- **Offline Learning UI & Status Indicators:**
  - `components/offline/OfflineStatusBar.tsx`: Apple minimal status bar indicating connectivity, pending attempt counts, and manual "Sync Now" action.
  - `components/offline/OfflineDownloadButton.tsx`: Button enabling students to save lessons and practice questions for offline learning.
  - Student Dashboard (`/student`): Added offline readiness card and download actions.
  - Learn Screen (`/student/learn/[conceptId]`): Added offline status banner and download button.
  - Practice Screen (`/student/practice/[conceptId]`): Offline attempt queueing with local status badges and non-blocking question progression.
  - AI Tutor (`components/tutor/SocraticTutorDrawer.tsx`): Honest offline pause notice when disconnected.
- **Phase 07 Acceptance Checklist Verification:**
  - Verified 1: Previously cached lessons open fully offline with complete pedagogical rules, worked examples, and visual fraction strip models.
  - Verified 2: Offline practice attempts are clearly marked as Pending Sync in problem card, option pill badges, status bar, and completion screen.
  - Verified 3: No authoritative mastery changes occur on the client before server validation.
  - Verified 4: Reconnecting sends queued attempts to Supabase without duplication using unique partial index `idx_student_attempts_idempotency`.
  - Verified 5: Failed attempts remain recoverable in IndexedDB for retry upon connection restore.
  - Verified 6: Multi-account isolation prevents pending attempts from transferring between students.
  - Verified 7: Private answer keys and teacher/admin data are excluded from offline storage and Service Worker cache.
  - Verified 8: Storage limitations (QuotaExceededError) and unsupported features are handled with honest descriptive notices.
- **Automated Tests:**
  - `tests/offlineSync.test.ts`: Expanded to 17 unit tests verifying all 8 acceptance criteria. Total test suite expanded to 74 passing tests across 25 suites.

## [Phase 06] - 2026-10-30

### Added
- **Server-Side AI Socratic Tutor (`/api/tutor`):**
  - Protected API endpoint with session authentication (`getUser()`), account status verification, and Zod schema validation.
  - Rate limiting per student (`15 req/min`) with sliding window eviction.
  - Authorized curriculum and concept context extraction without answer key exposure.
- **Provider Abstraction (`lib/tutor/provider.ts`):**
  - Unified `AITutorProvider` interface with server-side API key isolation.
  - Support for Google Gemini (`GEMINI_API_KEY`) and OpenAI (`OPENAI_API_KEY`).
  - `NullTutorProvider` returning an honest, helpful unconfigured notice rather than simulated or fake chat replies.
- **Socratic Pedagogical Framework (`lib/tutor/prompts.ts`):**
  - Culturally grounded analogies (rotis, cricket runs, gulab jamuns, pocket money).
  - Native multilingual support for English, Hindi (हिंदी), and Marathi (मराठी).
  - Hardened guardrails: prompt injection defense, secret answer key protection, prohibition of score or mastery tampering.
- **Interactive Student UI (`components/tutor/SocraticTutorDrawer.tsx`):**
  - Apple-inspired white and black minimal slide-over drawer embedded on `/student/learn/[conceptId]` and `/student/practice/[conceptId]`.
  - Floating trigger pill, multilingual switcher (`EN`, `हि`, `म`), quick action prompt chips, message thread, auto-scrolling, thinking indicator, and retry handling.
- **Database Persistence (`supabase/migrations/20261030030000_phase06_ai_tutor.sql`):**
  - `public.tutor_conversations` and `public.tutor_messages` tables with student-level Row Level Security (RLS).
- **Automated Tests:**
  - `tests/tutorGuardrails.test.ts`: 8 unit tests for provider abstraction, prompt generation, multilingual formatting, rate limiting, and answer key isolation. Total test count expanded to 57 passing tests across 17 suites.

## [Phase 05] - 2026-10-30

### Added
- **Teacher Dashboard & Analytics (`/teacher`):**
  - Classroom cohort switcher, enrolled/assessed learner counters, and concept mastery matrix.
  - Deterministic explainable classroom insights engine (`lib/teacher/teacherAnalytics.ts`).
- **Supervised Student Directory & Inspection (`/teacher/students` & `/teacher/students/[studentId]`):**
  - Roster view with search and cohort filtering.
  - Student inspection view with server-side authorization check preventing cross-cohort student data access.
- **Teacher Interventions & Pedagogical Overrides (`components/teacher/InterventionModal.tsx`):**
  - Custom next activity assignment stored in `public.teacher_interventions` without altering historical assessment attempts.
  - High-priority student dashboard intervention banner (`components/student/TeacherInterventionBanner.tsx`).
- **Admin Governance Center (`/admin`):**
  - Teacher vetting queue, user directory with suspension controls, classroom oversight, and protected curriculum answer key inspector.
  - Immutable platform audit trail (`components/admin/AdminAuditTimeline.tsx`).
- **Database Schema Migration (`20261030020000_phase05_teacher_admin.sql`):**
  - Classrooms table enhancements (`join_code`, `subject`, `section`, `is_archived`).
  - Stored procedure `enroll_in_classroom(p_join_code)`.
  - `public.teacher_interventions` and `public.audit_logs` tables with RLS.
  - Mutual RLS recursion resolution via security definer helpers.

## [Phase 04] - 2026-10-30

### Added
- **Concept Micro-Lessons (`/student/learn/[conceptId]`):**
  - High-quality, mathematically sound curriculum lessons for all 5 Class 7 Fractions concepts in `lib/curriculum/lessons.ts`.
  - Visual mathematical representations in `components/curriculum/VisualFractionModel.tsx` (fraction strips, multiples comparison grids, equivalent area bars, mixed circle models).
  - Step-by-step worked examples with solution steps and pro-tips.
  - Common mistakes and misconceptions cards with explicit corrections and explanations.
  - "Mark as Completed" button with live status feedback and server persistence via `lib/curriculum/lessonActions.ts`.
  - "Start Guided Practice →" direct transition button.
- **Interactive Guided Practice (`/student/practice/[conceptId]`):**
  - Interactive practice quiz interface with concept filtering from Supabase.
  - Real-time submission via `/api/practice/submit` endpoint with authenticated user verification.
  - Immediate server-side grading against private answer keys with zero premature answer leakage.
  - Live pedagogical explanations and updated concept mastery state.
  - Session completion summary featuring score, accuracy, updated mastery badge, and next adaptive DAG recommendation.
- **Curriculum Question Bank Expansion & Schema Migration:**
  - `supabase/migrations/20261030010000_phase04_learning_journey.sql`:
    - `public.student_lesson_completions` table with RLS.
    - `public.concept_lessons` table with public read access.
    - `attempt_type` column on `public.student_attempts` (`diagnostic`, `practice`, `concept_test`).
    - Seeded 10 additional practice questions (25 total) across all 5 concepts with corresponding protected server answer keys.
- **Student Journey & Dashboard Integration:**
  - Student Dashboard (`/student`): added completed lessons counter, direct "Learn" and "Practice" action links on every concept row, and smart adaptive action buttons that route to either prerequisite remediation or guided practice.
  - Results Screen (`/student/results`): recommendation card now directly launches the targeted concept lesson or guided practice, and Concept Breakdown table includes direct action links.
- **Automated Tests:**
  - `tests/practiceEngine.test.ts`: 7 new unit tests for lesson completeness, question bank integrity, protected answer key validation, and mastery progression.
  - Test suite expanded to 36 passing tests across 9 test suites.

## [Phase 03] - 2026-10-30

### Added
- **Authentication & RBAC:**
  - Role support for `student`, `teacher`, and `admin` with `account_status` (`active`, `pending_approval`, `suspended`).
  - Teacher approval workflow: teachers register in `pending_approval` status and must be verified by an administrator.
  - Administrative provisioning: public admin registration disabled; provisioned via SQL or admin console.
  - Dedicated authentication pages: `/signup`, `/login`, `/auth/callback`, `/auth/forgot-password`, `/auth/reset-password`, and `/pending-approval`.
  - Server Actions in `lib/auth/actions.ts`: `signUpUser`, `signInUser`, `signOutUser`, `requestPasswordReset`, `resetPassword`, `approveTeacher`, `getCurrentUserProfile`.
  - Middleware route protection in `lib/supabase/middleware.ts` safeguarding student, teacher, and admin paths.
- **Supabase PostgreSQL Schema & Migrations:**
  - `supabase/migrations/20261029000000_auth_profiles.sql`: user role enum, profiles table, auto-profile trigger, RLS policies.
  - `supabase/migrations/20261030000000_phase03_core_schema.sql`: upgrade to `profiles` with `account_status`, `concepts`, `concept_prerequisites`, `questions`, protected `question_answer_keys`, `student_attempts`, `student_mastery`, `classrooms`, `classroom_students`, and full RLS policies.
  - Idempotent seed data for Class 7 Fractions (5 concepts, prerequisite links, 15 questions, 15 protected answer keys).
- **Deterministic Adaptive Learning Engine (`lib/adaptive/`):**
  - `lib/adaptive/config.ts`: Centralized threshold definitions (`MASTERY_THRESHOLD = 0.8`, `PARTIAL_THRESHOLD = 0.5`, `MIN_EVIDENCE_FOR_MASTERY = 2`).
  - `lib/adaptive/graph.ts`: Directed acyclic graph verification with cycle detection via 3-color DFS, self-loop rejection, and topological sorting.
  - `lib/adaptive/scoring.ts`: Deterministic mastery calculation with deduplicated attempts and tentative status for insufficient evidence.
  - `lib/adaptive/recommendation.ts`: DAG traversal engine prioritizing root prerequisite gaps over advanced concepts, offering guided practice, advancement, or completion.
- **Zero Fake Data Migration:**
  - Removed all hardcoded demo personas and fake score arrays from production screens.
  - Assessment runner (`/student/assessment`) fetches real questions from Supabase.
  - Submission handler (`app/api/assessment/submit/route.ts`) grades on server against private answer keys, writes attempts to `student_attempts`, recalculates mastery in `student_mastery`, and returns adaptive recommendations.
  - Student Dashboard (`/student`) and Results (`/student/results`) display real Supabase progress with authentic empty states.
  - Teacher Dashboard (`/teacher`) displays authenticated teacher data and real classroom roster with empty states.
  - Admin Console (`/admin`) allows viewing real users and approving pending teachers.
- **Automated Tests:**
  - `tests/adaptiveEngine.test.ts`: 16 comprehensive unit tests covering mastery scoring, evidence thresholds, cycle rejection, prerequisite gap detection, tie-breaking, and idempotent runs.
  - Total test count expanded to 29 passing tests across 3 suites.

## [Phase 02] - 2026-10-29

### Added
- **Curriculum Domain Layer:**
  - `types/curriculum.ts`: Typed definitions for `ConceptId`, `MasteryStatus`, `Concept`, `QuestionOption`, `PublicQuestion`, and `PrivateAnswerKey`.
  - `types/assessment.ts`: Typed definitions for `StudentAnswer`, `AssessmentSubmission`, `ConceptResult`, `QuestionReviewItem`, and `AssessmentResult`.
  - `lib/curriculum/concepts.ts`: 5-node NCERT Class 7 Fractions concept DAG (`fraction-basics`, `common-multiples`, `equivalent-fractions`, `adding-fractions`, `mixed-fractions`).
  - `lib/curriculum/questions.ts`: 15 mathematically validated, age-appropriate Class 7 questions (3 per concept) without answer key leakage.
  - `lib/curriculum/answerKeys.server.ts`: Isolated server-side answer keys and explanations with browser import guards.
- **Deterministic Assessment Engine:**
  - `lib/assessment/scoring.ts`: Pure scoring engine evaluating concept mastery (`mastered` $\ge 80\%$, `partial` $50\%-79\%$, `needs_revision` $< 50\%$) and traversing prerequisite DAG edges to detect root bottlenecks.
  - `lib/assessment/validation.ts`: Zod schema validation for assessment submission payloads.
  - `app/api/assessment/submit/route.ts`: Secure API route evaluating submitted answers server-side.
- **Interactive Student Learning Experience:**
  - `components/curriculum/MasteryBadge.tsx`: Accessible status badges with explicit icons and labels (`Mastered`, `Partial`, `Needs revision`, `Not started`).
  - `app/(student)/student/page.tsx`: Complete Student Dashboard with Class 7 Fractions progress, recommended next activity, concept mastery table, continue learning card, recent assessment summary, and demo persona switcher.
  - `app/(student)/student/assessment/page.tsx`: Interactive diagnostic quiz runner with 1-at-a-time navigation, untimed timer, progress indicator, question selector dots, answer selection, review mode, validation, and demo fast-fill helpers.
  - `app/(student)/student/results/page.tsx`: Diagnostic results report featuring overall score, strong/revision concept lists, DAG prerequisite recommendations, diagnostic estimate disclaimer, and question-by-question accordion review.
- **Demo State & Personas:**
  - `lib/demo/personas.ts`: Explicit answer patterns for Aarav (14/15), Diya (10/15), and Rohan (6/15).
  - `lib/demo/state.ts`: Session storage helpers for seamless state retention and quiz restarts.
- **Testing & Documentation:**
  - `tests/scoring.test.ts`: 9 unit tests for mastery thresholds, bottleneck detection, and persona scoring.
  - `tests/validation.test.ts`: 4 unit tests for Zod schema validation.
  - `docs/DECISIONS.md`: Architecture Decision Records (ADR 001 - ADR 004).
  - `docs/SECURITY.md`: Threat model and server security controls.

## [Phase 01] - 2026-10-29

### Added
- Apple-inspired white and black minimal design system with crisp hairline borders and monochrome button pills.
- Reusable UI primitives: `Button`, `Badge`, `Card`, `SectionHeading`.
- Responsive public landing page (`app/page.tsx`) with hero, problem breakdown, how it works, persona pathways, teacher copilot, and footer.
- Initial route shells for `/student`, `/student/assessment`, `/teacher`, `/login`, and `/signup`.
