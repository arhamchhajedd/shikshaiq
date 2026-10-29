# ShikshaIQ

> **One classroom. Different learners. Personalized learning for everyone.**

ShikshaIQ is an adaptive learning platform tailored for Indian school students (Classes 6–10), initially focused on NCERT Class 7 Mathematics (Fractions). It features deterministic concept DAG tracking, prerequisite bottleneck detection, teacher gap heatmaps, and production-grade authentication with Supabase.

---

## Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router, Server Actions, Server Components)
- **Library:** [React 19](https://react.dev/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) with pure White & Black minimal Apple-inspired UI
- **Database & Auth:** [Supabase](https://supabase.com/) (`@supabase/supabase-js`, `@supabase/ssr`) with PostgreSQL Row Level Security (RLS)
- **Validation:** [Zod](https://zod.dev/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Testing:** Node.js native test runner via `tsx`

---

## Getting Started

### 1. Clone & Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create `.env.local` in the project root:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
# Optional: Required for server-side assessment grading & mastery calculation
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

> **Note:** Find these values in your Supabase project under **Project Settings > API**.

### 3. Run the Supabase SQL Migrations

1. Open your [Supabase Dashboard](https://supabase.com/dashboard).
2. Navigate to **SQL Editor > New query**.
3. Run the baseline profile migration:
   - Copy & paste [`supabase/migrations/20261029000000_auth_profiles.sql`](./supabase/migrations/20261029000000_auth_profiles.sql).
   - Click **Run**.
4. Run the core schema, adaptive learning tables, RLS policies, and curriculum seed:
   - Copy & paste [`supabase/migrations/20261030000000_phase03_core_schema.sql`](./supabase/migrations/20261030000000_phase03_core_schema.sql).
   - Click **Run**.
5. Run the Phase 04 learning journey migration (lesson progress, practice questions, and answer keys):
   - Copy & paste [`supabase/migrations/20261030010000_phase04_learning_journey.sql`](./supabase/migrations/20261030010000_phase04_learning_journey.sql).
   - Click **Run**.
6. Run the Phase 05 classroom management, teacher interventions, and audit logging migration:
   - Copy & paste [`supabase/migrations/20261030020000_phase05_teacher_admin.sql`](./supabase/migrations/20261030020000_phase05_teacher_admin.sql).
   - Click **Run**.
7. Run the Phase 06 AI Tutor conversations and messages migration:
   - Copy & paste [`supabase/migrations/20261030030000_phase06_ai_tutor.sql`](./supabase/migrations/20261030030000_phase06_ai_tutor.sql).
   - Click **Run**.
8. Run the Phase 07 offline learning and idempotency migration:
   - Copy & paste [`supabase/migrations/20261030040000_phase07_offline_sync.sql`](./supabase/migrations/20261030040000_phase07_offline_sync.sql).
   - Click **Run**.

This sets up:
- The `public.user_role` and `public.account_status` enums (`student`, `teacher`, `admin` / `active`, `pending_approval`, `suspended`).
- `public.profiles` with automatic synchronization triggers on `auth.users`.
- Core curriculum and assessment persistence tables: `concepts`, `concept_prerequisites`, `questions`, `question_answer_keys` (protected from client reads), `student_attempts`, `student_mastery`, `classrooms`, `classroom_students`.
- Phase 04 learning journey tables: `student_lesson_completions`, `concept_lessons`, and `student_attempts.attempt_type`.
- Phase 05 classroom join codes, `enroll_in_classroom` function, `teacher_interventions`, and `audit_logs`.
- Phase 06 `tutor_conversations` and `tutor_messages` with strict student-level Row Level Security (RLS).
- Phase 07 `student_attempts.idempotency_key` with unique partial index `idx_student_attempts_idempotency` for offline attempt queues.
- Comprehensive Row Level Security (RLS) policies for least-privilege tenant isolation.
- Idempotent seed data for NCERT Class 7 Fractions (5 concepts, 5 rich lessons, prerequisite graph, 25 validated questions, and 25 answer keys).

### 4. Provision the First Administrator

For security, administrative accounts cannot be created via public sign-up:

1. Sign up a new user via `/signup` with role "Student" or "Teacher".
2. Open **Supabase Dashboard > SQL Editor**.
3. Run the following snippet replacing the email with your account email:
   ```sql
   UPDATE public.profiles
   SET role = 'admin', account_status = 'active'
   WHERE id = (
     SELECT id FROM auth.users WHERE email = 'your-admin-email@example.com'
   );
   ```
4. Sign out and sign back in to access the Admin Console at `/admin`.

### 5. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to view the application.

---

## Authentication & Role-Based Flow

ShikshaIQ implements role-based access control (RBAC) with zero fake data:

| Role | Sign-Up Flow | Approval State | Redirect Destination | Dashboard Access |
|---|---|---|---|---|
| **Student** | Choose "Student", select Grade & School | Instant `active` | `/student` | Student Dashboard, Diagnostic Assessment, Learning Path |
| **Teacher** | Choose "Teacher", enter School Name | `pending_approval` | `/pending-approval` (until approved) &rarr; `/teacher` | Teacher Analytics, Class Gap Heatmap, Student Roster |
| **Admin** | Provisioned via controlled SQL | Active upon provisioning | `/admin` | Admin Console, User Directory, Teacher Approvals |

---

## Quality Checks & Testing

The project maintains 100% strict verification rules:

```bash
# Run unit tests (scoring engine & validation)
npm test

# Run ESLint (0 errors, 0 warnings enforced)
npm run lint

# Run TypeScript type-checker
npx tsc --noEmit

# Run production build
npm run build
```

---

## Project Structure

```
shikshaiq/
├── app/
│   ├── (admin)/admin/            # Admin console & user directory
│   ├── (auth)/login/             # Sign In with role-aware redirection
│   ├── (auth)/signup/            # Sign Up with role tabs (Student/Teacher/Admin)
│   ├── (student)/student/        # Student Dashboard & Diagnostic Flow
│   ├── (teacher)/teacher/        # Teacher Analytics
│   ├── api/assessment/submit/    # Secure deterministic grading endpoint
│   └── page.tsx                  # Public landing page
├── components/
│   ├── layout/Header.tsx         # Responsive header with session awareness
│   └── ui/                       # Apple-minimal design tokens (Button, Card, Badge)
├── docs/
│   ├── SHIKSHAIQ_CONTEXT.md      # Product & pedagogical architecture
│   ├── SHIKSHAIQ_PHASES.md       # Milestones & phased checklist
│   ├── SECURITY.md               # Threat model, RLS & validation contracts
│   └── DECISIONS.md              # Architecture Decision Records (ADRs)
├── lib/
│   ├── assessment/               # Pure deterministic scoring & DAG traversal
│   ├── auth/                     # Server Actions for auth & validation
│   ├── curriculum/               # Concept DAG & isolated answer keys
│   └── supabase/                 # SSR client, server, and middleware helpers
├── supabase/
│   └── migrations/               # Production SQL migration scripts
└── types/                        # Strict TypeScript definitions
```

