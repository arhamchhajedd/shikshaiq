# Architecture Decision Records (ADRs)

## ADR 001: Separation of Public Questions from Server-Only Answer Keys

- **Context:** In diagnostic assessment testing, client components must render question stems and distractor options without leaking correct answer IDs or explanations before submission.
- **Decision:** Split question assets into `lib/curriculum/questions.ts` (public, imported by client and server) and `lib/curriculum/answerKeys.server.ts` (server-only, contains correct option IDs and pedagogical explanations). In addition, guarded `answerKeys.server.ts` with a runtime browser check (`typeof window !== "undefined"`) to prevent any accidental inclusion in browser JavaScript bundles.
- **Consequences:** All answer checking and mastery evaluation must execute either via Next.js Route Handlers (`/api/assessment/submit`) or Server Components/Actions. Zero answers are exposed in the client DOM or network inspection tabs prior to submission.

---

## ADR 002: Deterministic DAG Traversal for Prerequisite Bottlenecks

- **Context:** Rather than treating mathematical concepts in isolation or allowing an LLM to hallucinate student mastery, prerequisite relationships follow the NCERT Class 7 curriculum hierarchy:
  - `fraction-basics` & `common-multiples` (Root concepts).
  - `equivalent-fractions` (Requires `fraction-basics`).
  - `adding-fractions` (Requires `common-multiples` and `equivalent-fractions`).
  - `mixed-fractions` (Requires `adding-fractions`).
- **Decision:** When evaluating diagnostic test submissions, if an advanced concept (e.g., Adding Fractions) is missed, the scoring engine traverses backward through its prerequisite edges. If a root dependency (e.g., Common Multiples / LCM) is under 80% mastery, the recommendation engine directly points to the root blocker as the immediate next activity.
- **Consequences:** Highly explainable, auditable recommendations. Eliminates guesswork for students and teachers.

---

## ADR 003: Deterministic Demo Personas with Real Dynamic Evaluation

- **Context:** Demo data is required to show the platform's diagnostic capability without needing real student accounts or persistent databases in Phase 02.
- **Decision:** Demo personas (Aarav, Diya, Rohan) define explicit, typed student answer patterns (`StudentAnswer[]`) rather than hardcoded scores. Switching or quick-filling a persona runs through the exact same scoring and recommendation algorithm via `/api/assessment/submit`.
- **Consequences:** Consistent, verifiable behavior. Rohan is accurately flagged with an LCM bottleneck, Diya is flagged for practice on mixed fractions, and Aarav demonstrates high mastery across all 5 nodes.

---

## ADR 004: Native tsx Test Runner for Unit Tests

- **Context:** We needed a lightweight, rapid unit test runner for business logic (`lib/assessment/scoring.ts`, `lib/assessment/validation.ts`) compatible with Node.js 24 and Next.js 16.
- **Decision:** Used Node's native test runner executed via `tsx` (`tsx --test tests/**/*.test.ts`).
- **Consequences:** Zero peer dependency friction, fast execution (<500ms), and full TypeScript path alias support without compiling to disk first.

---

## ADR 005: Supabase SSR Cookie Authentication & Role Profile Automation

- **Context:** We require real, production-ready authentication and RBAC for three distinct roles: `student`, `teacher`, and `admin`, without fake accounts or client-side trust.
- **Decision:**
  1. Use `@supabase/ssr` with Next.js 16 Server Actions and Middleware for HTTP-only cookie session handling.
  2. Implement an automated PostgreSQL trigger (`handle_new_user()`) on `auth.users` that creates a 1:1 row in `public.profiles` using registration metadata.
  3. Enforce Row Level Security (RLS) on `public.profiles` with security definer functions (`is_admin()`, `is_educator()`) to eliminate recursive query evaluation and prevent privilege escalation.
  4. Perform role-based redirects upon login: `student` &rarr; `/student`, `teacher` &rarr; `/teacher`, and `admin` &rarr; `/admin`.
- **Consequences:**
  - Complete zero-fake-data architecture: accounts are real Supabase Auth users.
  - Role tampering is prevented at both the database level (RLS `WITH CHECK`) and API layer (Zod validation).

---

## ADR 006: Teacher Approval Workflow and Admin Provisioning Boundary

- **Context:** Unrestricted public registration as an educator or administrator exposes student data to unauthorized parties.
- **Decision:**
  1. Teachers can register publicly, but their profile is assigned `account_status = 'pending_approval'`. They are redirected to `/pending-approval` until an administrator explicitly approves them via `/admin`.
  2. Administrative registration is completely disabled on the public web. Public registration schemas and forms only accept `student` and `teacher`. The initial administrator must be provisioned via direct SQL execution in the Supabase Dashboard or secure CLI script.
- **Consequences:** Eliminates privilege escalation vulnerabilities and safeguards minor students' assessment data.

---

## ADR 007: Migration from Demo Personas to Pure Supabase Data Model

- **Context:** Phase 02 utilized hardcoded demo answer personas (Aarav, Diya, Rohan) to demonstrate diagnostic capability. Phase 03 mandates zero fake data in production.
- **Decision:**
  1. Removed all persona switches, fake student arrays, and synthetic teacher classroom data.
  2. Assessment questions are loaded directly from the PostgreSQL `questions` table.
  3. Assessment attempts and concept mastery are stored persistently in `student_attempts` and `student_mastery`.
  4. When no records exist in the database, screens display clear, welcoming empty states with call-to-action buttons (e.g. "Take Diagnostic Assessment") rather than invented fallback records.
- **Consequences:** Guarantees 100% integrity of learner data and transparent system state.

---

## ADR 008: Structured Lesson Content Architecture & Progress Tracking

- **Context:** Students need clear, pedagogically grounded micro-lessons for each of the 5 Class 7 Fractions concepts before or during remedial practice.
- **Decision:**
  1. Author version-controlled curriculum lessons (`lib/curriculum/lessons.ts` and `supabase/migrations/20261030010000_phase04_learning_journey.sql`) containing objectives, worked examples, visual fraction models, and common misconceptions.
  2. Track student lesson completion in `public.student_lesson_completions` using an explicit server action (`markLessonCompleted`).
  3. Ensure lessons are treated as public educational curriculum content, separate from private student learning records.
- **Consequences:** Curriculum content remains verifiable, mathematically sound, and easily accessible across server and client components without LLM hallucinations.

---

## ADR 009: Per-Question Interactive Practice with Immediate Server-Side Feedback

- **Context:** In diagnostic assessments, all questions are submitted in a batch at the end. For guided practice, students need immediate feedback per question with explanations, without leaking remaining answer keys.
- **Decision:**
  1. Create a dedicated endpoint (`/api/practice/submit`) for individual question submissions.
  2. Grade each submitted answer on the server against private `ANSWER_KEYS`, revealing the explanation and correct option only after the student's submission is committed.
  3. Persist the attempt in `student_attempts` with `attempt_type: 'practice'` and dynamically update `student_mastery` and DAG recommendations in real time.
- **Consequences:** Zero client-side answer key exposure, instant pedagogical feedback, and real-time adaptation.

---

## ADR 010: Unguessable 6-Character Classroom Join Codes & Secure Student Enrollment

- **Context:** Teachers need an effortless mechanism to enroll students into their classroom cohorts without manual email entry or public enrollment links that allow unauthorized access.
- **Decision:**
  1. Generate unique 6-character uppercase alphanumeric join codes using a 32-character base (`ABCDEFGHJKLMNPQRSTUVWXYZ23456789`) that excludes easily confused characters (`0`, `O`, `1`, `I`).
  2. Implement `enroll_in_classroom` as a `SECURITY DEFINER` function in Supabase requiring active student authentication.
  3. Validate active, non-archived status and prevent duplicate enrollments.
- **Consequences:** Over 1 billion possible combinations per class, eliminating brute-force enumeration while providing a friendly student join experience on mobile and desktop.

---

## ADR 011: Teacher Pedagogical Overrides & Interventions Architecture

- **Context:** Educators must be able to review system recommendations and assign targeted learning activities without undermining the deterministic mastery engine or falsifying student history.
- **Decision:**
  1. Persist teacher overrides in a separate `public.teacher_interventions` table linked to student and teacher profiles.
  2. The student learning journey presents the active teacher override as a high-priority "Teacher Assigned Activity" with the teacher's note, while preserving underlying mastery scores and historical attempts.
  3. Restrict intervention creation to teachers who legitimately supervise the student in an active classroom cohort.
- **Consequences:** Full educator autonomy with zero tampering of historical attempt correctness or mastery calculation.

---

## ADR 012: Platform Governance, Educator Vetting & Immutable Audit Trail

- **Context:** Educational platforms require rigorous role vetting so unverified accounts cannot view minors' learning records, and sensitive administrative actions must be auditable.
- **Decision:**
  1. Default teacher self-registration to `pending_approval` status, routed directly to `/pending-approval` by edge middleware.
  2. Administrators approve or reject requests via `/admin` with a mandatory validated rejection rationale (5–250 characters).
  3. Persist all sensitive actions (approvals, rejections, suspensions, interventions, classroom creation) to an append-only `public.audit_logs` table with zero update/delete policies.
- **Consequences:** Absolute compliance with minor privacy standards, complete accountability, and non-repudiation for all administrative interventions.

---

### ADR 013: Model-Agnostic Server-Side AI Tutor Provider Abstraction

- **Context:** The AI Tutor must support modern LLMs (Google Gemini, OpenAI) without vendor lock-in or heavyweight external agent frameworks that bloat client or server bundles.
- **Decision:** Implement a lightweight, typed `AITutorProvider` interface with server-side adapters: `GeminiTutorProvider` (`GEMINI_API_KEY`), `OpenAITutorProvider` (`OPENAI_API_KEY`), and `NullTutorProvider` (when unconfigured). Provider keys are strictly isolated to server runtime.
- **Consequences:** Easy switching between models (e.g. `gemini-1.5-flash`, `gpt-4o-mini`), zero client bundle bloat, zero dependency vulnerabilities, and complete provider key isolation.

---

### ADR 014: Socratic Pedagogical Guardrails & Strict Answer Key Isolation

- **Context:** Students asking the tutor for assistance on practice or quiz problems must be guided to understand concepts, not handed direct answers or answer keys.
- **Decision:** 
  1. The server API endpoint (`/api/tutor`) never queries or injects `ANSWER_KEYS` into prompt contexts.
  2. Prompts enforce Socratic questioning: ask probing questions, provide hints, and use culturally relatable Indian analogies (rotis, cricket, gulab jamuns).
  3. The tutor is architecturally isolated from database mastery mutations: LLM responses cannot mark questions correct, alter scores, or mutate learning progress.
- **Consequences:** Preserves diagnostic integrity, prevents cheating, and builds genuine conceptual understanding.

---

### ADR 015: Truthful Fallback Architecture Over Synthetic Chat Fallbacks

- **Context:** In educational software, presenting hardcoded or synthetic chatbot replies when an AI provider is unconfigured or failing constitutes deceptive UX.
- **Decision:** If no valid provider key is configured or the provider times out, the system explicitly reports an honest `UNCONFIGURED` or `TIMEOUT` status with clear instructions for resolution.
- **Consequences:** Upholds complete transparency and adheres strictly to platform honesty requirements.

---

### ADR 016: Native IndexedDB Persistence Layer for Offline Practice & Zero-Key Curriculum Caching

- **Context:** In rural and semi-urban Indian classrooms, internet connectivity is intermittent. Students must be able to read downloaded lessons and solve practice questions offline without leaking protected solutions.
- **Decision:** Implement a typed, transactional native IndexedDB storage engine (`lib/offline/indexedDb.ts`, `shikshaiq_offline_v1`) managing `cached_lessons`, `cached_questions`, `pending_attempts`, and `sync_metadata`. Question records strictly contain public prompt and option data; zero answer keys are cached client-side.
- **Consequences:** Dependency-free local storage, zero client bundle overhead, zero answer-key leakage, and instant offline availability for previously downloaded content.

---

### ADR 017: Database-Level Idempotency Constraint for Offline Synchronizations

- **Context:** Mobile or flaky network reconnects often trigger duplicate submission retries. Submitting the same practice attempt multiple times could corrupt attempt history and artificially inflate adaptive mastery evidence.
- **Decision:** 
  1. Add an `idempotency_key TEXT` column to `public.student_attempts`.
  2. Create a unique partial index `idx_student_attempts_idempotency` on `(student_id, idempotency_key) WHERE idempotency_key IS NOT NULL`.
  3. Client generates a stable UUIDv4 key for each offline attempt.
  4. On batch synchronization (`/api/practice/sync`), if an idempotency key already exists for that student, the server returns status `already_processed` without duplicate insertion or double-counting mastery evidence.
- **Consequences:** Absolute protection against double-counting and race conditions, complete resilience across network retries, and strict multi-user queue isolation.

---

### ADR 018: Strict Never-Cache Service Worker Strategy for Authenticated Endpoints

- **Context:** Indiscriminately caching all fetch requests with a service worker risks caching session cookies, auth tokens, or private student assessment answers in shared browser storage.
- **Decision:** In `public/sw.js`, apply Cache-First strategy exclusively to versioned static assets (`/_next/static/*`, `/icons/*`, `.css`, `.svg`, `.woff2`) and Network-First for public navigation shell (`/`). Explicitly enforce a `NEVER_CACHE_PATTERNS` regex matching `/api/*`, `/auth/*`, `/teacher/*`, `/admin/*`, `/pending-approval`, and `supabase.co`.
- **Consequences:** Complete isolation of authenticated student/teacher data, elimination of stale session bugs, and zero credential leakage via browser caches.




