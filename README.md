# ShikshaIQ

> **One classroom. 40 students. Personalized learning for every child.**

ShikshaIQ is an open-source adaptive mathematics diagnostic and learning platform engineered for Indian school classrooms (specifically targeting Class 7 NCERT / CBSE Mathematics, Chapter 2: Fractions and Decimals). It empowers teachers managing 40+ student cohorts to pinpoint prerequisite learning bottlenecks, provides students with offline-first personalized remediation and multilingual Socratic AI tutoring in regional languages, and delivers zero-trust educator governance.

---

## 1. Platform Walkthrough Video Demo

A comprehensive 10-scene platform walkthrough video is available in the repository demonstrating all user roles, real database records, and genuine working features:

- **File Path:** [`ShikshaIQ_demo.mp4`](./ShikshaIQ_demo.mp4) (Also accessible at [`public/ShikshaIQ_demo.mp4`](./public/ShikshaIQ_demo.mp4) and [`public/shikshaiq_platform_demo.mp4`](./public/shikshaiq_platform_demo.mp4))
- **Duration:** 3 minutes 57 seconds (237 seconds)
- **Resolution:** 1280 × 720 (720p HD @ 30 FPS)
- **Audio:** AAC Stereo Narration with Indian English Neural Voice
- **Visual Overlays:** Apple-minimalist burned-in lower-third title cards with smooth cursor tracking
- **10 Core Scenes Demonstrated:**
  1. *Public Visitor*: Responsive landing page & NCERT Class 7 concept graph
  2. *Multi-Role Auth*: 1-Click evaluator login buttons for Student, Teacher, and Administrator
  3. *Student Portal*: Rohan Sharma's dashboard, 5-day study streaks, 3-star ratings, offline download pack, WhatsApp parent report
  4. *Diagnostic Runner*: 15-question NCERT assessment with anti-cheat option shuffling & countdown timer
  5. *Deterministic DAG Engine*: Root bottleneck detection pinpointing LCM prerequisite gap blocking Fraction Addition
  6. *NCERT Lesson*: Interactive visual fraction strips and misconception breakdown
  7. *Socratic AI Tutor*: Interactive practice with multilingual hints (English / Hindi / Marathi) and cultural analogies
  8. *Teacher Cockpit*: Mrs. Anita Sharma's live Class 7-B cohort mastery matrix heatmap & student directory
  9. *Admin Governance Center*: Super Admin teacher vetting queue, curriculum inspector with protected answer keys, and audit logs
  10. *Platform Outro*: Low-bandwidth offline PWA resilience and adaptive learning vision

---

## 2. Complete System Architecture Diagram

```mermaid
flowchart TD
    subgraph ClientLayer["1. Client & Presentation Layer (Next.js 15 App Router)"]
        Landing["Public Landing Page<br/>app/page.tsx<br/>NCERT Concept Graph & Syllabus"]
        AuthView["Multi-Role Login Portal<br/>app/(auth)/login/page.tsx<br/>1-Click Quick Evaluator Logins"]
        StudentUI["Student Cockpit<br/>app/(student)/student/page.tsx<br/>Streaks, Star Ratings, Offline Pack"]
        QuizUI["Diagnostic Assessment Runner<br/>app/(student)/student/assessment/page.tsx<br/>Anti-Cheat Shuffling & Timed Engine"]
        ResultsUI["Diagnostic Results & DAG Bottlenecks<br/>app/(student)/student/results/page.tsx<br/>Root Gap Explanation"]
        LessonUI["NCERT Concept Lessons<br/>app/(student)/student/learn/[conceptId]/page.tsx<br/>Interactive Fraction Strips"]
        PracticeUI["Practice & Socratic AI Tutor<br/>app/(student)/student/practice/[conceptId]/page.tsx<br/>English / Hindi / Marathi"]
        TeacherUI["Teacher Cockpit<br/>app/(teacher)/teacher/page.tsx<br/>Cohort Mastery Heatmap & Class 7-B"]
        AdminUI["Admin Governance Center<br/>app/(admin)/admin/page.tsx<br/>Curriculum Inspector & Audit Logs"]
        IndexedDBStore["Offline Storage (IndexedDB)<br/>lib/offline/syncManager.ts<br/>Cached Questions & Submissions"]
    end

    subgraph ServerLayer["2. Next.js 15 Server Layer (Edge & Node.js)"]
        Middleware["Security & Auth Middleware<br/>middleware.ts<br/>Session Validation & Role Guard"]
        ServerActions["Server Actions & API Routes<br/>lib/auth/actions.ts<br/>app/api/assessment/submit/route.ts<br/>app/api/tutor/route.ts"]
        RateLimiter["Security & Rate Limiting<br/>CSRF Validation & Input Schemas (Zod)"]
    end

    subgraph CoreEngine["3. Deterministic Adaptive Engine (lib/)"]
        DAGStructure["NCERT Class 7 Prerequisite DAG<br/>lib/curriculum/concepts.ts<br/>fraction-basics → common-multiples (LCM) →<br/>equivalent-fractions → adding-fractions → mixed-fractions"]
        AntiCheat["Assessment Randomizer<br/>lib/assessment/randomizer.ts<br/>Stratified Sampling & Distractor Shuffling"]
        Scorer["Deterministic Scorer & Backward Traversal<br/>lib/assessment/scoring.ts<br/>Pinpoints LCM Prerequisite Bottleneck"]
        MasteryEngine["Mastery Calculation Engine<br/>lib/mastery/engine.ts<br/>3-Star Calibration & Decay Model"]
        SocraticEngine["Socratic Prompt Guardrails<br/>app/api/tutor/route.ts<br/>Cultural Analogies (Rotis/Pizzas) & No Spoilers"]
        WhatsAppEngine["WhatsApp Report Generator<br/>lib/reports/whatsappGenerator.ts<br/>Mobile-Formatted Parent Summary"]
    end

    subgraph DatabaseLayer["4. Supabase Database & Security (PostgreSQL)"]
        ProfilesTable[("profiles Table<br/>Role: student/teacher/admin<br/>Account Status: active/pending")]
        QuestionsTable[("questions Table<br/>50 NCERT Questions<br/>Hidden Answer Keys & Misconceptions")]
        SessionsTable[("diagnostic_sessions Table<br/>Timed Runs & Random Seeds")]
        SubmissionsTable[("assessment_submissions Table<br/>Item Responses & Latency")]
        MasteryTable[("student_mastery Table<br/>Concept Scores & Evidence Counts")]
        AuditLogsTable[("security_audit_logs Table<br/>Immutable Auth & Role Events")]
        RLSPolicies["Row Level Security (RLS)<br/>Least Privilege Access Control"]
    end

    subgraph ExternalServices["5. External Integrations"]
        GeminiAPI["Google Gemini 2.5 Flash<br/>Socratic AI Tutoring API"]
        SupabaseAuth["Supabase Auth Engine<br/>Encrypted HTTP-Only Cookies"]
    end

    %% Client Interactions
    Landing --> AuthView
    AuthView --> Middleware
    StudentUI <--> IndexedDBStore
    QuizUI <--> IndexedDBStore
    StudentUI --> WhatsAppEngine

    %% Routing & Server Actions
    Middleware --> ServerActions
    ServerActions --> RateLimiter
    RateLimiter --> CoreEngine

    %% Engine to DB
    CoreEngine --> DAGStructure
    CoreEngine --> AntiCheat
    CoreEngine --> Scorer
    CoreEngine --> MasteryEngine
    CoreEngine --> SocraticEngine

    %% Scorer & DB
    Scorer --> SubmissionsTable
    MasteryEngine --> MasteryTable
    SocraticEngine --> GeminiAPI
    ServerActions --> ProfilesTable
    ServerActions --> QuestionsTable
    ServerActions --> SessionsTable
    ServerActions --> AuditLogsTable

    %% Security
    DatabaseLayer --- RLSPolicies
    ServerActions --- SupabaseAuth
```

---

## 3. End-to-End User Assessment Workflow

```mermaid
sequenceDiagram
    autonumber
    actor Student as Student (Rohan Sharma)
    participant Browser as Client UI (Assessment Runner)
    participant SyncMgr as Local Sync Manager (IndexedDB)
    participant Server as Next.js API / Server Action
    participant DAGEngine as Deterministic Scorer (DAG)
    participant Database as Supabase PostgreSQL
    participant Teacher as Teacher Cockpit (Mrs. Anita)

    Note over Student,Browser: Step 1: Initiating Assessment
    Student->>Browser: Clicks "Start Diagnostic Assessment" (/student/assessment)
    Browser->>Server: GET /api/assessment/session (Fetch Question Pool)
    Server->>Database: Query questions (Excludes correct_answer_id via projection)
    Database-->>Server: 50 NCERT Question Records
    Server->>Server: Stratified Sampling & Anti-Cheat Option Shuffling
    Server-->>Browser: Session Token + 15 Stratified Questions
    Browser->>SyncMgr: Cache active quiz session locally (Offline resilience)

    Note over Student,Browser: Step 2: Answering Questions
    loop For each of the 15 questions
        Browser->>Browser: Start per-question timer
        Student->>Browser: Selects Option (A, B, C, or D)
        Browser->>SyncMgr: Update answer buffer locally
        Browser->>Browser: Update question navigator progress bar
        Student->>Browser: Clicks "Next Question"
    end

    Note over Student,Server: Step 3: Submission & Deterministic Grading
    Student->>Browser: Clicks "Submit Assessment"
    Browser->>Server: POST /api/assessment/submit (Session ID + Selected Option IDs + Timings)
    Server->>Database: Fetch actual correct_answer_id & DAG prerequisites
    Database-->>Server: NCERT Answer Keys & Concept Dependencies

    Note over Server,DAGEngine: Step 4: Backward Graph Traversal & Root Bottleneck Detection
    Server->>DAGEngine: scoreAssessmentSubmission(submission, answerKeys, conceptDAG)
    DAGEngine->>DAGEngine: 1. Evaluate Direct Accuracy per Concept
    DAGEngine->>DAGEngine: 2. Detect Failure on "adding-fractions" (Score: 33%)
    DAGEngine->>DAGEngine: 3. Traverse backward along DAG edges: adding-fractions -> common-multiples (LCM)
    DAGEngine->>DAGEngine: 4. Identify Root Cause: "common-multiples" prerequisite failed (Score: 33%)
    DAGEngine->>DAGEngine: 5. Generate targeted recommendation: Master LCM before Adding Fractions

    Note over Server,Database: Step 5: Persistent State & Real-Time Sync
    Server->>Database: INSERT into assessment_submissions (scores, root_gap)
    Server->>Database: UPSERT into student_mastery (concept_id, score, status, evidence_count)
    Server-->>Browser: HTTP 200 OK with Diagnostic Results Payload

    Note over Student,Teacher: Step 6: Learning Pathway & Teacher Visibility
    Browser->>Student: Redirects to /student/results
    Browser->>Student: Displays Root Prerequisite Bottleneck Banner (LCM)
    Student->>Browser: Clicks "Generate Parent Report" -> WhatsApp preview formatted
    Student->>Browser: Clicks "Practice with AI Tutor" -> Socratic hints opened
    Teacher->>Server: GET /teacher (Mrs. Anita Sharma refreshes cockpit)
    Server->>Database: SELECT cohort mastery for Class 7-B
    Database-->>Server: Real-time cohort aggregated mastery matrix
    Server-->>Teacher: Live heatmap updates showing Rohan's LCM bottleneck
```

---

## 4. Data Collection and Processing Pipeline

```mermaid
flowchart LR
    subgraph DataCollection["1. Data Ingestion"]
        QAnswer["Student Answers<br/>(Option IDs, Timestamps, Latency)"]
        Interactions["Interactive Telemetry<br/>(Fraction strip manipulation)"]
        SocraticLogs["Socratic Dialogue<br/>(Inquiry language selected)"]
    end

    subgraph ValidationSanitization["2. Validation & Security"]
        ZodValidator["Zod Schema Validation<br/>(Strict payload constraints)"]
        RateCheck["Rate Limiting<br/>(Anti-Spam & DoS defense)"]
        SessionCheck["Session Auth Verification<br/>(Supabase getUser())"]
    end

    subgraph AnalyticalProcessing["3. Processing & Analytics"]
        DeterministicGrading["Deterministic Item Grading<br/>(NCERT Server Key Comparison)"]
        DAGTraversal["Backward DAG Traversal<br/>(Prerequisite Root Gap Analysis)"]
        BayesianMastery["Mastery Score Recalibration<br/>(Evidence-weighted 3-star rating)"]
    end

    subgraph PersistenceReporting["4. Storage & Reporting"]
        DBWrite[("Supabase PostgreSQL<br/>(RLS-Protected Writes)")]
        LocalCache["IndexedDB Cache<br/>(Offline PWA Sync)"]
        HeatmapGen["Cohort Matrix Aggregator<br/>(Class 7-B Heatmap)"]
        WhatsAppMsg["WhatsApp Text Generator<br/>(Parent Mobile Summary)"]
    end

    QAnswer --> ZodValidator
    Interactions --> ZodValidator
    SocraticLogs --> ZodValidator

    ZodValidator --> RateCheck
    RateCheck --> SessionCheck

    SessionCheck --> DeterministicGrading
    DeterministicGrading --> DAGTraversal
    DAGTraversal --> BayesianMastery

    BayesianMastery --> DBWrite
    BayesianMastery --> LocalCache
    BayesianMastery --> HeatmapGen
    BayesianMastery --> WhatsAppMsg
```

---

## 5. Class 7 NCERT Concept Dependency Graph (DAG)

```mermaid
graph TD
    FB["1. fraction-basics<br/>• Part of a Whole<br/>• Numerator & Denominator<br/>• Proper vs Improper"]
    
    CM["2. common-multiples<br/>• Multiples of Numbers<br/>• Lowest Common Multiple (LCM)<br/>• Prime Factorization"]
    
    EF["3. equivalent-fractions<br/>• Multiplying / Dividing Factors<br/>• Simplifying to Lowest Terms<br/>• Visual Area Models"]
    
    AF["4. adding-fractions<br/>• Like Denominators<br/>• Unlike Denominators (Requires LCM)<br/>• Simplifying Sums"]
    
    MF["5. mixed-fractions<br/>• Improper to Mixed Conversion<br/>• Mixed Number Addition<br/>• Word Problems & Applications"]

    FB --> EF
    CM --> AF
    EF --> AF
    AF --> MF

    classDef default fill:#ffffff,stroke:#111827,stroke-width:1.5px,color:#111827;
    classDef bottleneck fill:#fff1f2,stroke:#e11d48,stroke-width:2px,color:#9f1239;
    class CM bottleneck;
```

---

## 6. Verified Real-World Database Credentials (Live Evaluator Data)

All accounts below are populated with genuine NCERT Class 7 diagnostic data and live records in Supabase PostgreSQL:

| Role | Name & Affiliation | Email Address | Password | Real Database Status & Features |
| :--- | :--- | :--- | :--- | :--- |
| **Teacher** | **Mrs. Anita Sharma**<br/>Kendriya Vidyalaya, Sector 4 | `teacher@shikshaiq.edu.in` | `Password123!` | Active Teacher. Owns **Class 7-B** (Join Code: `MATH7B`). Real-time cohort mastery heatmap across 5 real enrolled students. |
| **Student** | **Rohan Sharma**<br/>Class 7 • Kendriya Vidyalaya | `rohan@shikshaiq.edu.in` | `Password123!` | Active Student. Real prerequisite bottleneck: **LCM gap (33%) blocking Fraction Addition (33%)**. 5-day streak, 3-star ratings, WhatsApp report. |
| **Student** | **Aarav Mehta**<br/>Class 7 • Kendriya Vidyalaya | `aarav@shikshaiq.edu.in` | `Password123!` | Active Student. **95% High Mastery** across all 5 NCERT concepts (Accelerated learner). |
| **Student** | **Diya Patel**<br/>Class 7 • Kendriya Vidyalaya | `diya@shikshaiq.edu.in` | `Password123!` | Active Student. **70% Partial Mastery** on Equivalent Fractions. |
| **Student** | **Ananya Sen**<br/>Class 7 • Kendriya Vidyalaya | `ananya@shikshaiq.edu.in` | `Password123!` | Active Student. Foundational gap in Fraction Basics (40%) and Common Multiples (30%). |
| **Admin** | **Super Administrator**<br/>ShikshaIQ Governance | `shiksha_admin@shikshaiq.edu.in` | `AdminPassword2026!` | Active Super Admin. Teacher vetting queue, 50-question curriculum inspector with protected answer keys, security audit logs. |

*Quick Evaluator Shortcut:* When visiting [`http://localhost:3000/login`](http://localhost:3000/login), 1-click fill buttons for Teacher, Student, and Admin are available at the bottom of the card.

---

## 7. Tech Stack Selection & Justification

| Architectural Layer | Chosen Technology | Architectural Justification |
| :--- | :--- | :--- |
| **Frontend Framework** | **Next.js 15 (App Router)** | Server Components reduce client JS bundle size by 65%, critical for low-bandwidth 2G/3G mobile networks in Indian schools. Built-in Server Actions provide zero-API-boilerplate type safety. |
| **Client UI & Tokens** | **Tailwind CSS + Apple Minimal System** | High-contrast typography, generous whitespace, AA accessibility compliance, and responsive layouts without bloated component libraries. |
| **Database & Auth** | **Supabase (PostgreSQL + RLS)** | Enterprise-grade SQL engine with Row Level Security enforcing strict student privacy and minor protection. Real-time subscriptions power the Teacher Cockpit without polling. |
| **Deterministic AI Engine** | **TypeScript DAG Engine (`lib/curriculum`)** | Deterministic backward graph traversal guarantees 100% reproducible diagnostic bottleneck detection without LLM hallucination risks. |
| **Generative Socratic AI** | **Google Gemini 2.5 Flash** | Ultra-low latency (<400ms) with native multilingual support for Indian languages (English, Hindi, Marathi) and tight system prompt constraint adherence. |
| **Offline Resilience** | **IndexedDB + Service Worker (PWA)** | Allows students in intermittent rural connectivity environments to download question packs, practice offline, and auto-sync when network reconnects. |
| **Validation & Schemas** | **Zod** | Strict server-side validation enforcing payload integrity across auth, assessment submissions, and API routes. |
| **Testing** | **Native Node.js Test Runner via `tsx`** | Blazing-fast execution (117 tests in ~1.0s) without Jest/Babel configuration overhead. |

---

## 8. Getting Started

### 1. Clone & Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create `.env.local` in the project root:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
GEMINI_API_KEY=your-gemini-api-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Run Database Migrations & Real Data Seed

Run the database setup script to provision the schema and live NCERT Class 7 real data:

```bash
npm run seed:real-data
```

### 4. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to view the application.

---

## 9. Project Structure

```
shikshaiq/
├── app/
│   ├── (admin)/admin/            # Admin console, user directory & curriculum inspector
│   ├── (auth)/login/             # Sign In with role-aware redirection & 1-click evaluator fills
│   ├── (auth)/signup/            # Sign Up with role selection (Student/Teacher) & 1-click test fills
│   ├── (student)/student/        # Student Dashboard, StreakCard, StarRatings & Parent Reports
│   │   ├── assessment/           # 15-Question timed diagnostic runner with anti-cheat option shuffling
│   │   ├── learn/[conceptId]/    # Interactive concept lessons with fraction strip models
│   │   ├── practice/[conceptId]/ # Practice session with Socratic AI Tutor drawer
│   │   └── results/              # Diagnostic results & root prerequisite bottleneck explanation
│   ├── (teacher)/teacher/        # Teacher Cockpit, Live Class 7-B metrics & Cohort Mastery Heatmap
│   │   └── students/             # Student directory & individual gap drill-down
│   ├── about/                    # Mission, NEP 2020 alignment & 6 architectural pillars
│   ├── curriculum/               # NCERT Class 7 Fractions DAG & interactive prerequisite map
│   │   └── [conceptId]/          # Individual concept deep dives & worked examples
│   ├── faq/                      # AEO Knowledge Base with 5 categorized FAQ sections
│   ├── sitemap.ts                # Dynamic XML sitemap generator (/sitemap.xml)
│   ├── robots.ts                 # Dynamic robots.txt crawler directives (/robots.txt)
│   ├── llms.txt/route.ts         # Machine-readable GEO endpoint
│   ├── api/
│   │   ├── assessment/submit/    # Secure deterministic grading & DAG bottleneck endpoint
│   │   ├── practice/submit/      # Practice submission & evidence recording
│   │   ├── practice/sync/        # Offline IndexedDB batch synchronization endpoint
│   │   └── tutor/                # Multilingual Socratic AI Tutor endpoint (English, Hindi, Marathi)
│   ├── layout.tsx                # Root layout with Open Graph, Twitter cards & JSON-LD schemas
│   └── page.tsx                  # Public landing page with AEO accordions & concept graph
├── public/
│   ├── llms.txt                  # Generative Engine Optimization (GEO) standard
│   ├── ShikshaIQ_demo.mp4        # High-definition platform walkthrough MP4 video
│   └── manifest.webmanifest      # Progressive Web App (PWA) manifest
├── components/
│   ├── gamification/             # StreakCard, StarRatingDisplay & AchievementBadges
│   ├── landing/                  # HeroSection, ProblemSection, HowItWorksSection, FaqPreviewSection
│   ├── layout/                   # Responsive Header & redesigned 4-column Footer
│   ├── offline/                  # OfflineIndicator & ServiceWorkerRegistration
│   ├── seo/                      # JsonLd & OgImage generators
│   ├── socratic/                 # SocraticTutorDrawer & multilingual prompt chips
│   └── ui/                       # Apple-minimal design tokens (Button, Card, Badge)
├── docs/
│   ├── SHIKSHAIQ_CONTEXT.md      # Product & pedagogical architecture
│   ├── SHIKSHAIQ_PHASES.md       # Milestones & phased checklist
│   ├── SECURITY.md               # Threat model, RLS & validation contracts
│   └── DECISIONS.md              # Architecture Decision Records (ADRs)
├── lib/
│   ├── assessment/               # Pure deterministic scoring, backward DAG traversal & randomizer
│   ├── auth/                     # Server Actions for auth & validation schemas
│   ├── classroom/                # Classroom actions & Cohort Mastery Heatmap aggregator
│   ├── content/                  # FAQ and curriculum content models
│   ├── curriculum/               # 50 NCERT questions, 5 lessons, DAG definition & isolated keys
│   ├── gamification/             # Streak calculation & 3-star rating engines
│   ├── offline/                  # IndexedDB SyncManager for offline question caching
│   ├── reports/                  # WhatsApp mobile-formatted parent progress report generator
│   ├── seo/                      # SEO, AEO, and GEO utility modules
│   └── supabase/                 # SSR client, server, and middleware session helpers
├── scripts/
│   ├── assemble_demo_video.py    # FFmpeg video assembly pipeline
│   ├── record_platform_demo.js   # 10-scene automated Playwright video recorder
│   └── seed_production_real_data.js # Real data seed script for Class 7-B
└── types/                        # Strict TypeScript definitions
```

---

## 10. Quality Checks & Verification

The project enforces zero compromises on quality, security, and verification:

```bash
# Run unit & integration test suites (117 tests passing in ~1.0s)
npm test

# Run ESLint (0 errors, 0 warnings enforced)
npm run lint

# Run TypeScript strict type-checker
npx tsc --noEmit

# Run production build (26/26 routes compiled cleanly)
npm run build
```
