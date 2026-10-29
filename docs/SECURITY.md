# ShikshaIQ — Security Controls & Threat Model

This document outlines the security controls, validation schemas, and threat model enforced across the ShikshaIQ platform.

---

## 1. Threat Model & Mitigations

| Threat | Attack Vector | Security Control in Place |
|---|---|---|
| **Client Answer Key Inspection** | Inspecting client React state or bundle to identify correct answer IDs before submitting diagnostic quiz or practice | **Zero Client Leakage:** Answer keys are stored in `public.question_answer_keys` and server-only `ANSWER_KEYS` dictionary with runtime browser guards. The client receives only public question stems and options. In practice mode, each answer is graded server-side (`app/api/practice/submit/route.ts`), and the correct option ID is returned only *after* the student commits their response. |
| **Score Tampering** | Manipulating client-submitted scores or mastery percentages | **Server-Derived Scores:** Clients cannot submit scores or mastery states. Clients only submit question IDs and selected option IDs. The server computes all scores deterministically and writes to `student_mastery`. RLS prohibits client-side INSERT/UPDATE on `student_mastery`. |
| **Malformed Submission Payloads** | Sending malicious, empty, or oversized JSON payloads to the submission endpoint | **Runtime Schema Validation:** All requests to `/api/assessment/submit` and `/api/practice/submit` are validated using strict Zod schemas (`assessmentSubmissionSchema`, `practiceSubmissionSchema`). |
| **Data Scraping & Injection** | Injecting scripts or arbitrary HTML into question prompts or student notes | **Strict Typings & Escaping:** All strings rendered in React are automatically escaped. No `dangerouslySetInnerHTML` is used anywhere in the codebase. |
| **Unauthorized Teacher Access** | Self-registering as a teacher to view other students' records | **Admin Approval Workflow:** New teacher accounts are assigned `account_status = 'pending_approval'`. They are redirected to `/pending-approval` by middleware and cannot access the teacher dashboard or student records until an administrator approves them. |
| **Admin Self-Provisioning** | Registering an administrative account through the public registration interface | **No Public Admin Registration:** The public `/signup` form and Zod schema permit only `student` and `teacher` roles. The database trigger rejects public attempts to create admin accounts. Administrators must be provisioned via controlled database procedures. |
| **Arbitrary Classroom ID Guessing** | Attempting to guess UUIDs to inspect other classrooms or students | **Classroom Ownership Verification:** Server Actions verify `c.teacher_id = auth.uid()` or admin role before returning classroom rosters or student details. RLS policy on `public.classrooms` and `public.classroom_students` blocks direct database reads. |
| **Unguessable Join Codes** | Brute-forcing classroom enrollment codes | **6-Character Cryptographic Randomness:** Codes use a 32-character alphabet excluding ambiguous glyphs (`0`, `O`, `1`, `I`), yielding 32^6 (>1 billion) combinations per active class. Enrollment requires authenticated student sessions. |
| **Teacher Recommendation Tampering** | Changing historical attempts or falsifying scores via interventions | **Separation of Concerns:** `teacher_interventions` are stored in a dedicated table distinct from `student_attempts` and `student_mastery`. An intervention only suggests the next activity and preserves original deterministic recommendations without altering student performance records. |
| **Audit Log Tampering** | Deleting or modifying administrator or teacher audit events | **Append-Only Immutable Logs:** `public.audit_logs` RLS permits `INSERT` and `SELECT` (admins and actors), with zero `UPDATE` or `DELETE` policies, guaranteeing non-repudiation. |

---

## 2. Server API Validation (`/api/assessment/submit` & `/api/practice/submit`)

All incoming submissions are checked against strict Zod contracts:

```typescript
const studentAnswerSchema = z.object({
  questionId: z.string().min(1, "Question ID is required"),
  selectedOptionId: z.string().min(1, "Selected option ID is required"),
  timeSpentSeconds: z.number().int().nonnegative().optional(),
});

export const assessmentSubmissionSchema = z.object({
  personaId: z.string().optional(),
  submittedAt: z.string().datetime().optional(),
  answers: z
    .array(studentAnswerSchema)
    .min(1, "At least one answer must be submitted")
    .max(50, "Exceeded maximum answers per batch"),
});
```

---

## 3. Supabase Auth, Row Level Security (RLS) & RBAC

All authentication and user identities are managed via Supabase Auth with server-side session cookies:

| Security Vector | Implementation Detail | Guarantee |
|---|---|---|
| **Session Integrity** | `@supabase/ssr` creates HTTP-only, Secure, SameSite cookies via Next.js Server Actions and Middleware. | Prevents XSS token theft; tokens are not accessible to JavaScript in the browser. |
| **Role-Based Access Control (RBAC)** | Roles (`student`, `teacher`, `admin`) and statuses (`active`, `pending_approval`, `suspended`) are stored in `public.profiles`. | Validated at registration; unauthorized role values default to `student`. Teacher role defaults to `pending_approval`. |
| **Privilege Escalation Guard** | `public.profiles` RLS update policy enforces that users cannot alter their own `role` or `account_status`. Only admins can update these fields. | Non-admin users cannot promote themselves or unblock suspended/pending status. |
| **Least-Privilege RLS Policies** | 1. Authenticated users can only read their own profile (`auth.uid() = id`).<br>2. Teachers can only view students enrolled in their assigned classes.<br>3. Students can only read and insert their own `student_attempts` and read their own `student_mastery`.<br>4. Answer keys in `question_answer_keys` have zero SELECT policies for clients.<br>5. `public.teacher_interventions` readable only by assigned student and creator teacher.<br>6. `public.audit_logs` readable only by admins and the actor. | Complete multi-tenant isolation and anti-tamper guarantee. |
| **Input Sanitization & Schemas** | Auth actions (`signInUser`, `signUpUser`, `requestPasswordReset`, `resetPassword`), classroom actions (`createClassroomAction`), and intervention actions validate input using strict Zod schemas. | Rejects malformed emails, short passwords (<8 characters), invalid roles, and out-of-range grade levels. |

| **Prompt Injection & Jailbreaks** | Attempting to trick the AI tutor into ignoring guidelines, roleplaying, or revealing internal prompts | **Hardened System Instruction:** System prompt strictly separates curriculum context from user text and enforces Socratic bounds, prohibiting persona drift or instruction overrides. |
| **Answer Key Leakage via AI Tutor** | Asking the AI tutor to give away the answers to practice questions or diagnostic assessments | **Zero Key Ingestion & Direct Answer Prohibition:** The tutor endpoint (`/api/tutor`) never queries or passes `ANSWER_KEYS` to the LLM. The system instruction strictly prohibits revealing option letters or final numbers, enforcing progressive hints only. |
| **LLM Key Compromise** | Extracting model API keys from network inspection or client bundles | **Strict Server-Side Isolation:** `GEMINI_API_KEY` and `OPENAI_API_KEY` are read exclusively in server-side modules (`lib/tutor/provider.ts` and `app/api/tutor/route.ts`). Never prefixed with `NEXT_PUBLIC_`. |
| **Runaway Token Spend & Abuse** | Flooding the AI tutor endpoint with automated high-frequency requests | **Sliding Window Rate Limiter:** Enforces 15 requests per minute per authenticated student ID (`lib/tutor/rateLimiter.ts`). Rejects excessive requests with HTTP 429 and `retryAfterSeconds`. |
| **Tutor Conversation Privacy** | Accessing or eavesdropping on another student's tutoring dialogues | **Row Level Security (RLS) Isolation:** `public.tutor_conversations` and `public.tutor_messages` enforce `student_id = auth.uid()`. Students cannot read or modify another user's conversation sessions. |
| **Tutor-Induced Score Alteration** | Using LLM responses to mutate mastery, mark attempts correct, or change roles | **Architectural Isolation:** The AI Tutor has zero database mutation permissions for assessment or mastery tables. The deterministic adaptive engine remains the sole authority for mastery calculations. |

---

## 4. AI Tutor Guardrails & Socratic Boundaries (`/api/tutor`)

The Socratic AI Tutor is bound by six non-negotiable architectural guardrails:
1. **Never Give Away the Final Answer:** The tutor provides conceptual scaffolding, checks understanding, and offers step-by-step guidance, but never directly outputs the correct option or final numeric answer.
2. **Context Isolation:** Active practice context includes question prompts and options, but strictly excludes server-side answer keys.
3. **No Clinical or Medical Diagnoses:** The tutor is strictly prohibited from inferring or diagnosing learning disabilities or medical conditions.
4. **Cultural Grounding:** Analogies are anchored in age-appropriate Indian daily life (rotis, cricket, gulab jamuns, pocket money).
5. **Truthful Unconfigured State:** If no API provider key is provided in server environment variables, the system truthfully returns a configuration notice rather than substituting synthetic fallback replies.
6. **Student Conversation Privacy:** Conversations are bound to the authenticated student ID in `public.tutor_conversations` and `public.tutor_messages` with strict RLS.

---

## 5. Offline Learning, IndexedDB & PWA Threat Model

| Threat Vector | Risk Description | Architectural Security Control |
|---|---|---|
| **Answer Key Leakage in Cache** | Inspecting client IndexedDB or Service Worker cache to extract solutions | **Zero Answer Key Ingestion:** `CachedQuestion` records in IndexedDB contain only public question prompts, options, and objectives. Correct answer IDs and explanations are strictly kept on the server in `ANSWER_KEYS`. |
| **Tampered Offline Attempts** | Modifying IndexedDB to insert fraudulent `is_correct: true` values | **Server-Side Authority:** The server sync endpoint (`/api/practice/sync`) completely ignores any client-supplied correctness or scores. Answers are evaluated solely on the server against trusted answer keys. |
| **Double-Counting & Duplicate Sync** | Network retries or duplicate offline sync requests inflating mastery | **Database Idempotency Constraint:** Unique partial index `idx_student_attempts_idempotency` on `(student_id, idempotency_key)`. Repeated submissions return `already_processed` without duplicate records or re-evaluating evidence. |
| **Multi-User Queue Pollution** | Syncing student A's offline attempts to student B's account on a shared device | **Strict Identity Verification:** All offline attempts in IndexedDB are indexed by student `userId`. On synchronization, the server verifies `auth.uid() = attempt.userId`. Foreign attempts are strictly rejected. |
| **Service Worker Token Caching** | Caching private session tokens, cookies, or student records in shared SW cache | **Explicit Never-Cache Policy:** `public/sw.js` explicitly excludes `/api/*`, `/auth/*`, `/teacher/*`, `/admin/*`, `/pending-approval`, and `supabase.co` from service worker caches. |

---

## 6. Residual Risks & Next Steps

- **Edge Rate Limiting:** Current rate limiting is implemented in-memory per container. A distributed Redis-backed rate limiter (e.g. Upstash) will be configured for multi-instance production deployments.
- **Service Role Key Security:** The server uses `SUPABASE_SERVICE_ROLE_KEY` solely within server-side API handlers (`app/api/assessment/submit/route.ts`) to grade against protected answer keys and write validated mastery records. This key is never prefixed with `NEXT_PUBLIC_` and is never bundled into client JS.


