# ShikshaIQ — Professional Platform Demo Video Walkthrough & Voice-Over Script

**Target Video Length:** 3:30 – 4:00 Minutes  
**Resolution:** 1920x1080 (1080p 60fps) or 4K  
**Tone:** Confident, articulate, educational, modern Apple-inspired minimalism  
**Theme:** "One Classroom. Different Learners. Deterministic Adaptive Intelligence."

---

## Pre-Recording Checklist & Setup

1. **Browser Setup:**
   - Chrome or Brave browser in 100% zoom, maximized on a 1080p or 1440p monitor.
   - Bookmarks bar hidden (`Ctrl+Shift+B`).
   - Clean browser profile without noisy extensions.
   - Dev server running at `http://localhost:3000`.
2. **Audio Setup:**
   - Quiet environment with cardioid microphone, pop filter, and normalized voice levels (-14 LUFS).
3. **Demo Accounts / Roles Covered:**
   - **Public Visitor** (Landing page)
   - **Student Persona** (Aarav / Rohan Sharma)
   - **Teacher Persona** (Mrs. Sunita Sharma / Class 7-A Mathematics)
   - **Administrator Persona** (System Administrator)

---

## Master Scene-by-Scene Video Walkthrough

```
+----------------------------------------------------------------------------------------------------------+
| TIMELINE | SCENE / ROLE       | ON-SCREEN ACTIONS (WHAT TO CLICK & SHOW)       | VOICE-OVER SCRIPT (SPOKEN WORDS)  |
+----------------------------------------------------------------------------------------------------------+
| 0:00-0:30| Scene 1: Public    | - Start on http://localhost:3000/              | "In an average Indian classroom, |
|          | Landing & Mission  | - Slow smooth scroll past hero headline:       | over 40 students learn from a    |
|          |                    |   'Every student learns differently...'        | single teacher. A one-size-      |
|          |                    | - Pause on the Live Interactive Diagnostic     | fits-all lesson leaves struggling|
|          |                    |   Snapshot card showing Rohan's status.        | students behind and limits       |
|          |                    | - Highlight the Prerequisite DAG Rule banner.  | advanced ones. Welcome to        |
|          |                    |                                                | ShikshaIQ—an adaptive learning   |
|          |                    |                                                | platform built for Class 7 NCERT |
|          |                    |                                                | Mathematics."                    |
+----------------------------------------------------------------------------------------------------------+
| 0:30-1:20| Scene 2: Student   | - Click 'Explore Student Demo' or '/student'   | "Let's step into the shoes of a  |
|          | Assessment &       | - Show the wide Student Dashboard: 6 metrics,  | Class 7 student. The dashboard    |
|          | Results            |   gamification stars, and 3-day streak card.   | gives real-time visibility into  |
|          |                    | - Click 'Start Diagnostic Quiz' or '/student/  | concept mastery—derived solely   |
|          |                    |   assessment'.                                 | from validated attempts.         |
|          |                    | - Demonstrate the randomized question items,   |                                  |
|          |                    |   numbered dot jumper, and responsive 2-column | Taking the 15-question           |
|          |                    |   options. Answer 2-3 questions.               | diagnostic test evaluates every  |
|          |                    | - Click 'Review All' to show review mode.      | foundational skill. Our server-  |
|          |                    | - Submit and land on '/student/results'.       | side scoring engine assesses the |
|          |                    | - Point to the letter grade, accuracy, and the | submission against NCERT keys,   |
|          |                    |   identified prerequisite bottleneck (LCM      | pinpointing root bottlenecks—like|
|          |                    |   blocking fraction addition).                 | Common Multiples blocking        |
|          |                    |                                                | Fraction Addition."              |
+----------------------------------------------------------------------------------------------------------+
| 1:20-1:55| Scene 3: Learn,    | - Click 'Review Concept Lesson' (/student/     | "Students don't just get scores— |
|          | Practice & AI      |   learn/fraction-basics).                      | they get an immediate, guided    |
|          | Socratic Tutor     | - Show the visual fraction strip model, worked | pathway. In the lesson view,     |
|          |                    |   examples, and common misconception cards.    | interactive fraction strips and  |
|          |                    | - Click 'Start Guided Practice' (/student/     | worked examples demystify the    |
|          |                    |   practice/fraction-basics).                   | concept.                         |
|          |                    | - Select an option and show instant server     |                                  |
|          |                    |   feedback badge.                              | During practice, if a student is |
|          |                    | - Click the bottom-right 'Ask AI Tutor' pill.  | stuck, our built-in Socratic AI  |
|          |                    | - Show the multilingual drawer: switch to      | tutor provides step-by-step      |
|          |                    |   Hindi (हि) and Marathi (म), and click a     | scaffolding in English, Hindi, or|
|          |                    |   quick prompt chip (e.g. 'Give me an analogy').| Marathi—without ever giving away |
|          |                    | - Highlight the offline download badge.        | the direct answer."              |
+----------------------------------------------------------------------------------------------------------+
| 1:55-2:45| Scene 4: Teacher   | - Navigate to '/pending-approval' briefly to   | "Next, let's explore Teacher     |
|          | Copilot & Real-    |   show role privacy verification.              | Copilot. To safeguard learner    |
|          | time Telemetry     | - Navigate to '/teacher'.                      | privacy, teacher accounts require|
|          |                    | - Switch cohorts (Class 7-A / Class 7-B).      | admin approval before accessing  |
|          |                    | - Show the 4 metrics cards and Concept         | student records.                 |
|          |                    |   Mastery Matrix with color-coded badges.      |                                  |
|          |                    | - Click the 'Simulate Live Quiz' button to     | Once inside, educators get a live|
|          |                    |   show real-time telemetry animation!          | telemetry view of their cohort.  |
|          |                    | - Scroll to Explainable Classroom Insights     | The Concept Mastery Matrix       |
|          |                    |   card showing automatic gap alerts.           | shows which concepts are         |
|          |                    | - Click 'All Students Directory' (/teacher/    | mastered, developing, or at-risk.|
|          |                    |   students) and click a student profile.       | Teachers can even assign targeted|
|          |                    | - Click 'Assign Intervention' modal and save.  | overrides without tampering with |
|          |                    |                                                | historical records."             |
+----------------------------------------------------------------------------------------------------------+
| 2:45-3:15| Scene 5: Admin     | - Navigate to '/admin'.                        | "Finally, the Admin Governance   |
|          | Governance Center  | - Show the Platform Administration overview:   | Center gives school leadership   |
|          |                    |   users, classrooms, questions bank.           | complete institutional control.  |
|          |                    | - Under 'Pending Teachers', click 'Approve'.   | Administrators can vet teacher   |
|          |                    | - Switch to 'Curriculum Bank' tab: expand a    | signups with a single click,     |
|          |                    |   question to reveal protected answer keys     | manage user access, and inspect  |
|          |                    |   and pedagogical explanations.                | the protected curriculum bank    |
|          |                    | - Scroll to Audit Log Timeline showing the     | where private answer keys reside |
|          |                    |   logged approval action with timestamp.       | strictly server-side."           |
+----------------------------------------------------------------------------------------------------------+
| 3:15-3:35| Scene 6: PWA &     | - Show the top 'Offline Mode' indicator in the | "Built for Indian schools with   |
|          | Closing Call-to-   |   status bar.                                  | unreliable connectivity, ShikshaIQ|
|          | Action             | - Navigate back to '/' (Landing page).         | supports offline PWA caching with|
|          |                    | - Pan across the clean, Apple-minimal design.  | idempotent Supabase sync.        |
|          |                    | - Hover on 'Get Started' button.               | One classroom. Every learner.    |
|          |                    |                                                | Welcome to the future of Indian  |
|          |                    |                                                | education with ShikshaIQ."       |
+----------------------------------------------------------------------------------------------------------+
```

---

## Detailed Step-by-Step Production Guide

### Scene 1: Public Landing Page (0:00 – 0:30)
- **URL:** `http://localhost:3000/`
- **Mouse Movement:**
  - Start at the top. Let the viewer absorb the ultra-clean Apple-style white & black aesthetic.
  - Hover lightly over the **"ShikshaIQ • Class 7"** logo on the left and the **"Explore Student Demo"** button on the right.
  - Scroll down smoothly to the **"Live Diagnostic Snapshot"** card.
  - Hover over the 4 concept cards: *Fraction Basics (Mastered)*, *Common Multiples (Root Gap)*, *Equivalent Fractions (Developing)*, and *Adding Fractions (Blocked)*.
  - Point to the **"Adaptive Recommendation"** callout at the bottom of the card.
- **Voice-over:**
  > *"In an average Indian school classroom, over 40 students learn from a single teacher. While some learners understand fraction concepts instantly, others struggle with foundational prerequisites like common multiples. A one-size-fits-all lecture leaves struggling learners behind and limits high achievers. Welcome to ShikshaIQ—an adaptive mathematical learning platform engineered for Class 7 NCERT curriculum."*

---

### Scene 2: Student Diagnostic & Adaptive Scoring (0:30 – 1:20)
- **URL:** `http://localhost:3000/student` -> `http://localhost:3000/student/assessment`
- **Mouse Movement:**
  - Click **"Explore Student Demo"**.
  - Show the wide student dashboard with **Overall Accuracy (88%)**, **Mastered Nodes (3/5)**, **Curriculum Stars (11/15)**, and the **3-Day Streak Card**.
  - Click **"Start Diagnostic Quiz"**.
  - Show the self-paced progress bar and the 15 question selector dots.
  - Click option `B` on Question 1, then click **Next Question**.
  - Click Question dot `8` to demonstrate direct jumping.
  - Click **"Review All"** button: show all 15 question status cards laid out in the 5-column grid.
  - Click **"Submit Diagnostic Quiz"**.
  - On `/student/results`, highlight the letter grade badge ("A"), the breakdown table, and the adaptive recommendation: *"Revise Common Multiples first before attempting Adding Fractions."*
- **Voice-over:**
  > *"Let's explore the learner experience. In the Student Dashboard, progress is derived entirely from validated student submissions—never fake estimates. When a student takes the 15-question diagnostic assessment, questions are sampled from our verified NCERT bank with anti-cheat randomization. After submission, our deterministic knowledge tracing engine grades the assessment server-side against protected keys. Instead of just giving a percentage, ShikshaIQ identifies the root prerequisite gap blocking downstream progress."*

---

### Scene 3: Learn Screen, Practice & Multilingual Socratic AI Tutor (1:20 – 1:55)
- **URL:** `http://localhost:3000/student/learn/fraction-basics` -> `http://localhost:3000/student/practice/fraction-basics`
- **Mouse Movement:**
  - Click **"Review Concept Lesson"**.
  - Scroll through the visual fraction models and the worked examples grid.
  - Hover over the **"Common Misconception"** card.
  - Click **"Practice"** in the top-right.
  - Select an option on Question 1; observe the instant emerald confirmation badge and explanation.
  - Click the floating black **"Ask AI Tutor"** button in the bottom right corner.
  - In the slide-over drawer, click the **"हि"** button to switch to Hindi, then **"म"** for Marathi.
  - Click one of the quick prompt chips (e.g. *"Give me an everyday analogy"*).
  - Show the response explaining fractions using rotis or cricket runs.
  - Close the drawer and show the **"Offline Download"** button.
- **Voice-over:**
  > *"Rather than getting stuck, students receive a personalized learning path. In the lesson module, step-by-step worked solutions and visual fraction strips build conceptual clarity. In guided practice, every attempt receives immediate feedback. And when students need extra guidance, our Socratic AI Tutor provides hints and everyday cultural analogies in English, Hindi, and Marathi—teaching students how to think without revealing the final answer."*

---

### Scene 4: Teacher Copilot & Real-Time Classroom Telemetry (1:55 – 2:45)
- **URL:** `http://localhost:3000/pending-approval` -> `http://localhost:3000/teacher`
- **Mouse Movement:**
  - Open `/pending-approval` to show the verification notice: *"Teacher Account Pending Approval - Student Record Isolation"*.
  - Navigate to `/teacher`.
  - Switch between **Class 7-A** and **Class 7-B** in the classroom selector.
  - Show the 4 metrics cards: Enrolled Learners, Assessed Students, Curriculum Scope, and Class Average.
  - Click the green **"Simulate Live Quiz"** button in the header; point to the pulsing green **"Realtime Telemetry"** notification banner that appears at the top.
  - Scroll through the **Concept Mastery Matrix** showing color-coded counts for Mastered, Partial, and Needs Revision.
  - Show the **Explainable Classroom Insights** cards (e.g. *"3 students are stuck on Common Multiples"*).
  - Click **"All Students Directory"** (`/teacher/students`), filter by name, and click **"Inspect"** on a student profile.
  - Click **"Assign Intervention"**, choose a focus concept, type a brief note, and click **Save Intervention**.
- **Voice-over:**
  > *"Now let's switch to the Teacher Copilot. To protect student privacy, new educator signups remain in a pending state until vetted by school administrators. Once approved, teachers gain unprecedented clarity over their classroom. The Concept Mastery Matrix maps out student comprehension across all 5 NCERT concepts. The system automatically detects cohort-wide bottlenecks—alerting the teacher when multiple learners struggle with the same prerequisite. Teachers can inspect individual learner profiles and assign targeted pedagogical interventions without altering historical records."*

---

### Scene 5: Administrator Governance Center (2:45 – 3:15)
- **URL:** `http://localhost:3000/admin`
- **Mouse Movement:**
  - Navigate to `/admin`.
  - Highlight the platform metrics: Total Registered Users, Active Teachers, Cohorts, and Questions Bank.
  - In the **Pending Teachers** tab, locate a pending educator and click the black **"Approve"** button.
  - Show the instant status change to "Active".
  - Click on the **"Curriculum Bank"** tab: expand a Class 7 Fractions question to reveal the privileged answer key, correct option, and pedagogical solution.
  - Scroll down to the **Audit Log Timeline** to show the recorded entry: *"Approved Teacher Account by Admin with timestamp."*
- **Voice-over:**
  > *"For school administrators, ShikshaIQ provides total governance. Principals and admins can vet new teachers with a single click, audit user access, and oversee classroom enrollments. The privileged curriculum bank allows admins to inspect question mappings and server-side answer keys, while an immutable audit log records all critical administrative decisions."*

---

### Scene 6: Offline PWA & Closing Call to Action (3:15 – 3:35)
- **URL:** `http://localhost:3000/`
- **Mouse Movement:**
  - Highlight the top **OfflineStatusBar** indicating offline caching and sync readiness.
  - Navigate back to the clean public landing page (`/`).
  - Smooth scroll up to the hero section.
  - Hover gently over the primary **"Explore Student Demo"** and **"Sign In"** buttons.
- **Voice-over:**
  > *"Built with Next.js, Supabase PostgreSQL, and offline Progressive Web App architecture, ShikshaIQ ensures learning never stops, even in low-bandwidth Indian classrooms. One classroom. Different learners. Personalized mastery for every child. Thank you for watching ShikshaIQ."*

---

## Audio & Video Editing Guidelines

1. **Background Music:**
   - Subtle, modern ambient tech music (warm acoustic guitar or soft piano with gentle synthesizer pads).
   - Keep music volume at **-22 dB** under the voice-over (**-14 dB**).
2. **Video Transitions:**
   - Smooth cuts or 0.2s cross-fades between role switches.
   - 1.15x slight zoom-in on critical UI micro-interactions (e.g. clicking the "Simulate Live Quiz" button, the multilingual AI tutor toggle, and the audit log).
3. **Captions:**
   - Include auto-captions with white sans-serif text and subtle black outline at the bottom center.
