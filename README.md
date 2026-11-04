# ShikshaIQ

> **One classroom. Different learners. Personalized learning for everyone.**

ShikshaIQ is a deterministic adaptive learning platform tailored for Indian school students (Classes 6–10), initially focused on **NCERT Class 7 Mathematics (Fractions & Decimals)**. Built with Next.js 16 (App Router), React 19, TypeScript, and Supabase, it bridges student learning gaps using a rigorous prerequisite Knowledge Graph (DAG), real-time teacher orchestration, and a culturally anchored Socratic AI companion protected by an architectural firewall.

---

## Key Highlights & Architectural Pillars

```
+----------------------------------------------------------------------------------------------------+
|                                    SHIKSHAIQ ARCHITECTURAL PILLARS                                |
+------------------------------------+---------------------------------------------------------------+
| 1. Deterministic DAG Engine        | Mathematical scoring M(c) = Correct / ValidAttempts.          |
|                                    | 80%+ Mastered, 50-79% Developing, <50% Root Gap Bottleneck.   |
+------------------------------------+---------------------------------------------------------------+
| 2. Strict Architectural Firewall   | The LLM NEVER computes mastery, grades, or sees answer keys.  |
|                                    | Socratic AI only provides conceptual scaffolding (rotis/dosas)|
+------------------------------------+---------------------------------------------------------------+
| 3. Offline-First Synchronization   | PWA Service Worker + IndexedDB queue with idempotency keys    |
|                                    | designed for intermittent connectivity in Indian classrooms.  |
+------------------------------------+---------------------------------------------------------------+
| 4. Live Cockpit & Parent Loop      | PostgreSQL Realtime CDC pushes live alerts to teachers;       |
|                                    | automated WhatsApp Web API shares bilingual progress cards.  |
+------------------------------------+---------------------------------------------------------------+
```

---

## Visual Architecture & Workflow Documentation

The system includes comprehensive, university- and enterprise-grade vector documentation:

- **System Architecture & Workflow PDF:** [`docs/ShikshaIQ_Architecture_and_Workflow.pdf`](./docs/ShikshaIQ_Architecture_and_Workflow.pdf)
  - **Page 1:** Project Hero, Discovered Tech Stack Matrix, and Core Engineering Pillars.
  - **Page 2:** Complete System Architecture Diagram (5 swimlanes: Actors, Edge/Security, App/API Layer, Deterministic Engine vs. Socratic AI with red dashed Architectural Firewall, Supabase PostgreSQL with RLS & Realtime CDC).
  - **Page 3:** Complete System Workflow Flowchart (Standard flowchart symbols detailing Auth, Diagnostic Assessment, Deterministic Grading, Prerequisite DFS Check, Three-Way Pedagogical Branching [Aarav, Diya, Rohan], Socratic AI Drawer, and Realtime WebSocket loop).
- **Public Streamable Path:** Accessible directly at `http://localhost:3000/ShikshaIQ_Architecture_and_Workflow.pdf` when the dev server is running.
- **Generate / Rebuild Command:**
  ```bash
  npm run generate:pdf
  ```

---

## Platform Video Walkthrough & Voiceover

- **Generated MP4 Video:** [`public/shikshaiq_platform_demo.mp4`](./public/shikshaiq_platform_demo.mp4)
- **Automated Recording Pipeline:** Playwright Headless Chromium + Python MoviePy:
  ```bash
  npm run record:demo
  ```
  Walks through the complete multi-persona journey:
  1. **Landing & Identity:** Value proposition, NCERT Class 7 curriculum, and role cards.
  2. **Student Diagnostic & Branching:** Aarav (Accelerated 94%), Diya (Guided Scaffolding 72%), and Rohan (Root Gap Remediation 48%).
  3. **Socratic AI Companion:** Real-time hint generation using Indian analogies without answer leakages.
  4. **Teacher Cockpit:** Real-time gap heatmap, live intervention triggers, and WhatsApp dispatch.
  5. **Admin Console:** Security audit logs, user management, and teacher approval gating.

---

## Tech Stack

| Domain | Technology / Tooling | Implementation Role |
| :--- | :--- | :--- |
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router) | Turbopack, Server Actions, React Server Components (RSC) |
| **UI & Styling** | [React 19](https://react.dev/) + [Tailwind CSS v4](https://tailwindcss.com/) | Minimal Apple-inspired monochrome aesthetic (`#000000`/`#ffffff`, hairline borders) |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) | Strict mode, zero `any`, Zod runtime validation |
| **Database & Auth** | [Supabase](https://supabase.com/) | PostgreSQL 15, Row Level Security (RLS), `@supabase/ssr` HTTP-only session cookies |
| **Realtime Telemetry** | PostgreSQL Realtime (CDC) | WebSocket push channel updating teacher dashboards live on student attempts |
| **Adaptive Core** | Pure TypeScript (`lib/adaptive/`) | Directed Acyclic Graph (DAG) for NCERT Class 7 Fractions with bottleneck detection |
| **Socratic AI** | Google Gemini / OpenAI (`@google/genai`, `openai`) | Non-evaluative conceptual scaffolding (strictly firewalled from grading) |
| **Client Storage** | IndexedDB + Service Worker | Offline queue with UUID idempotency keys for zero-loss attempt sync |
| **Automated Testing** | Node.js Test Runner via `tsx` | 117+ automated unit and integration tests across 41 suites |
| **Quality & Linting** | ESLint v9 (`eslint-config-next`) | Strict lint configuration enforced with 0 errors and 0 warnings |
| **Document & Media Engine** | Playwright & MoviePy | Headless browser automation for vector PDF rendering and demo video assembly |

---

## Getting Started

### 1. Prerequisites

- **Node.js:** v20.x or higher
- **npm:** v10.x or higher
- **Supabase Account:** Free-tier or self-hosted PostgreSQL instance

### 2. Clone & Install Dependencies

```bash
git clone https://github.com/your-username/shikshaiq.git
cd shikshaiq
npm install
```

### 3. Configure Environment Variables

Copy the example environment configuration into `.env.local`:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials:

```ini
# Supabase Public Configuration (Project Settings -> API)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key

# Optional: Server-only service role key (Required for server grading & admin overrides; NEVER expose to client)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Socratic AI Tutor Configuration (Phase 06)
# Choose either Google Gemini (recommended) or OpenAI:
GEMINI_API_KEY=your-gemini-api-key
# OPENAI_API_KEY=your-openai-api-key
AI_PROVIDER=gemini
AI_MODEL=gemini-1.5-flash
```

### 4. Execute Supabase Database Migrations

Apply the migration scripts in sequential order inside the **Supabase Dashboard > SQL Editor**:

1. [`supabase/migrations/20261029000000_auth_profiles.sql`](./supabase/migrations/20261029000000_auth_profiles.sql) — Profile tables & trigger on `auth.users`.
2. [`supabase/migrations/20261030000000_phase03_core_schema.sql`](./supabase/migrations/20261030000000_phase03_core_schema.sql) — Concepts, DAG edges, questions, answer keys (withheld from client), and attempts.
3. [`supabase/migrations/20261030010000_phase04_learning_journey.sql`](./supabase/migrations/20261030010000_phase04_learning_journey.sql) — Interactive lessons, rich NCERT curriculum seed, and progress tracking.
4. [`supabase/migrations/20261030020000_phase05_teacher_admin.sql`](./supabase/migrations/20261030020000_phase05_teacher_admin.sql) — Classroom enrollment join codes, teacher interventions, and audit logging.
5. [`supabase/migrations/20261030030000_phase06_ai_tutor.sql`](./supabase/migrations/20261030030000_phase06_ai_tutor.sql) — Socratic chat conversations and messages with strict student RLS.
6. [`supabase/migrations/20261030040000_phase07_offline_sync.sql`](./supabase/migrations/20261030040000_phase07_offline_sync.sql) — Offline idempotency unique index `idx_student_attempts_idempotency`.

### 5. Provision the Initial Administrator (ADR 006)

To prevent privilege escalation, administrator accounts cannot be registered via public forms:

1. Register an account at `/signup` with role **Student** or **Teacher**.
2. Run this query in the **Supabase SQL Editor**:
   ```sql
   UPDATE public.profiles
   SET role = 'admin', account_status = 'active'
   WHERE id = (SELECT id FROM auth.users WHERE email = 'your-admin-email@example.com');
   ```
3. Sign out and sign back in to access the Administrator Console at `/admin`.

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## Authentication & Role-Based Flow (RBAC)

| Role | Sign-Up Flow | Initial State | Access Gating | Primary Views & Capabilities |
| :--- | :--- | :--- | :--- | :--- |
| **Student** | Direct sign-up; select Grade (Class 7) & School | `active` | Direct login to `/student` | Diagnostic Assessment, Adaptive Learning Map, Interactive Lessons, Socratic Drawer, Offline Sync |
| **Teacher** | Teacher sign-up; enter School Name & Subject | `pending_approval` | Quarantined at `/pending-approval` until approved by Admin | Class Mastery Heatmap, Student Drilldowns, Live Interventions, WhatsApp Progress Dispatch |
| **Admin** | Provisioned only via authorized database SQL | `active` | Direct login to `/admin` | Teacher Verification Cockpit, Platform User Directory, Real-Time Audit Logs, System Health |

---

## Available NPM Scripts

```bash
# Start development server with Turbopack
npm run dev

# Run all 117+ automated unit & integration tests
npm test

# Run ESLint (strictly enforced 0 errors, 0 warnings)
npm run lint

# Check TypeScript static types across the codebase
npx tsc --noEmit

# Compile production build
npm run build

# Start production server
npm run start

# Generate master vector Architecture & Workflow PDF
npm run generate:pdf

# Record automated end-to-end platform demo video
npm run record:demo
```

---

## Project Structure

```
shikshaiq/
├── app/
│   ├── (admin)/admin/              # Admin console, teacher approvals & audit trail
│   ├── (auth)/login/               # Role-aware login with secure redirects
│   ├── (auth)/signup/              # Multi-role registration (Student / Teacher)
│   ├── (auth)/pending-approval/    # Security holding page for unverified teachers
│   ├── (student)/student/          # Student dashboard, adaptive learning & diagnostic
│   ├── (teacher)/teacher/          # Teacher analytics, classroom roster & interventions
│   ├── api/
│   │   ├── ai/socratic/            # Firewalled Socratic AI companion endpoint
│   │   ├── assessment/submit/      # Server-side deterministic grading endpoint
│   │   ├── teacher/intervene/      # Teacher manual intervention & note dispatcher
│   │   └── whatsapp/send/          # Bilingual parent progress WhatsApp dispatcher
│   ├── layout.tsx                  # Root layout with Apple-minimal styling & fonts
│   └── page.tsx                    # Public landing page showcasing 3 student personas
├── components/
│   ├── layout/Header.tsx           # Global session-aware navigation header
│   ├── student/                    # Socratic drawer, adaptive tree, lesson viewer
│   ├── teacher/                    # Live gap heatmap, intervention modal, student drawer
│   └── ui/                         # Apple-minimal design tokens (Button, Card, Badge, Modal)
├── docs/
│   ├── ShikshaIQ_Architecture_and_Workflow.pdf # Official 3-page master technical PDF
│   ├── SHIKSHAIQ_CONTEXT.md        # Pedagogical framework & NCERT Fractions DAG
│   ├── SHIKSHAIQ_PHASES.md         # Detailed phased checklist and engineering audit
│   ├── SECURITY.md                 # Threat model, RLS specifications & OWASP controls
│   └── DECISIONS.md                # Architecture Decision Records (ADR 001 - ADR 008)
├── lib/
│   ├── adaptive/                   # Deterministic scoring, prerequisite graph & bottleneck DFS
│   ├── ai/                         # Socratic prompt templates, guardrails & provider client
│   ├── assessment/                 # Assessment submission validation and state derivation
│   ├── auth/                       # Server Actions for auth, role verification & session cookies
│   ├── curriculum/                 # NCERT Class 7 concept metadata & isolated answer keys
│   ├── notifications/              # Bilingual WhatsApp message formatting & dispatch
│   ├── offline/                    # IndexedDB queue & background sync manager
│   └── supabase/                   # Client, server, middleware, and Realtime CDC helpers
├── public/
│   ├── shikshaiq_platform_demo.mp4 # Pre-rendered complete voiceover walkthrough video
│   ├── sw.js                       # Offline caching service worker
│   └── favicon.ico                 # High-contrast monochrome branding icon
├── scripts/
│   ├── generate_master_architecture_workflow_pdf.js # Playwright PDF vector generator
│   ├── record_platform_demo.js     # Playwright multi-role automated screen capture
│   └── assemble_demo_video.py      # MoviePy audio/video compositor
├── supabase/
│   └── migrations/                 # Versioned, reproducible PostgreSQL migration scripts
└── tests/                          # Comprehensive unit & integration tests
```

---

## Security & Compliance Architecture

ShikshaIQ follows strict **OWASP ASVS** and **Security by Default** principles:

1. **Answer Key Withholding:** Answer keys are stored in a dedicated `question_answer_keys` table accessible **only** to the service-role on the server. The client never receives correct options during active assessments.
2. **Row Level Security (RLS):** Every Supabase table is locked with granular RLS policies. Students can only read their own attempts; teachers can only view students enrolled in their assigned classrooms.
3. **No LLM Evaluative Authority:** The Socratic AI model is architecturally forbidden from calculating mastery scores or altering user state.
4. **Content Security Policy (CSP):** Next.js config enforces strict nonce-based script restrictions, anti-clickjacking frame ancestors, and disables `X-Powered-By`.
5. **Audit Logging:** Administrative actions (teacher approvals, role modifications, curriculum edits) are immutably logged to `public.audit_logs`.

---

## Detailed Project Documentation

- [Product & Pedagogical Context](./docs/SHIKSHAIQ_CONTEXT.md)
- [Phased Implementation Checklist & Audit](./docs/SHIKSHAIQ_PHASES.md)
- [Security Threat Model & Policy Matrix](./docs/SECURITY.md)
- [Architecture Decision Records (ADRs)](./docs/DECISIONS.md)
- [Architecture & Workflow PDF](./docs/ShikshaIQ_Architecture_and_Workflow.pdf)

---

## License

This project is licensed under the [MIT License](LICENSE).
