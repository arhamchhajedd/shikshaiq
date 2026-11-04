/* eslint-disable @typescript-eslint/no-require-imports */
const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const OUTPUT_PDF_PUBLIC = path.join(__dirname, "../public/shikshaiq_adaptive_architecture_and_flow.pdf");
const OUTPUT_PDF_ROOT = path.join(__dirname, "../shikshaiq_adaptive_architecture_and_flow.pdf");

const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>ShikshaIQ — Adaptive Learning Architecture & Workflow</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');

    @page {
      size: A4 portrait;
      margin: 10mm 12mm 12mm 12mm;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      color: #111827;
      background: #ffffff;
      font-size: 11px;
      line-height: 1.45;
      -webkit-font-smoothing: antialiased;
    }

    .page {
      width: 100%;
      height: 100%;
      page-break-after: always;
      display: flex;
      flex-direction: column;
      position: relative;
    }

    .page:last-child {
      page-break-after: avoid;
    }

    /* Header styling */
    .doc-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      border-bottom: 1.5px solid #000000;
      padding-bottom: 8px;
      margin-bottom: 14px;
    }

    .brand-group {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .brand-badge {
      width: 24px;
      height: 24px;
      background: #000000;
      color: #ffffff;
      font-weight: 800;
      font-size: 11px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 6px;
    }

    .brand-title {
      font-size: 16px;
      font-weight: 800;
      letter-spacing: -0.02em;
      color: #000000;
    }

    .brand-subtitle {
      font-size: 9.5px;
      color: #6b7280;
      font-weight: 500;
      margin-top: 1px;
    }

    .doc-meta {
      text-align: right;
      font-size: 8.5px;
      color: #4b5563;
      font-family: 'JetBrains Mono', monospace;
    }

    .section-title {
      font-size: 13.5px;
      font-weight: 800;
      letter-spacing: -0.01em;
      color: #000000;
      text-transform: uppercase;
      display: flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 3px;
    }

    .section-desc {
      font-size: 9.5px;
      color: #4b5563;
      margin-bottom: 10px;
      line-height: 1.4;
    }

    /* Badges */
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 2px 7px;
      border-radius: 9999px;
      font-size: 8.5px;
      font-weight: 600;
      letter-spacing: 0.02em;
      text-transform: uppercase;
    }
    .badge-black { background: #000000; color: #ffffff; }
    .badge-emerald { background: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0; }
    .badge-amber { background: #fffbeb; color: #92400e; border: 1px solid #fde68a; }
    .badge-rose { background: #fff1f2; color: #9f1239; border: 1px solid #fecdd3; }
    .badge-neutral { background: #f3f4f6; color: #374151; border: 1px solid #e5e7eb; }

    /* Architecture Layers (Page 1) */
    .arch-container {
      display: flex;
      flex-direction: column;
      gap: 9px;
      flex: 1;
    }

    .layer-card {
      border: 1px solid #e5e7eb;
      border-radius: 10px;
      padding: 9px 12px;
      background: #fafafa;
      position: relative;
    }

    .layer-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 6px;
    }

    .layer-name {
      font-size: 10.5px;
      font-weight: 700;
      color: #111827;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .layer-number {
      background: #000000;
      color: #ffffff;
      font-size: 8px;
      font-weight: 700;
      padding: 1px 5px;
      border-radius: 4px;
      font-family: 'JetBrains Mono', monospace;
    }

    .grid-3 {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
    }

    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
    }

    .sub-box {
      background: #ffffff;
      border: 1px solid #e5e7eb;
      border-radius: 7px;
      padding: 7px 9px;
    }

    .sub-box-title {
      font-size: 9.5px;
      font-weight: 700;
      color: #111827;
      margin-bottom: 2px;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .sub-box-text {
      font-size: 8.5px;
      color: #4b5563;
      line-height: 1.35;
    }

    .code-pill {
      font-family: 'JetBrains Mono', monospace;
      font-size: 8px;
      background: #f3f4f6;
      border: 1px solid #e5e7eb;
      padding: 1px 4px;
      border-radius: 4px;
      color: #111827;
    }

    /* Core Adaptive Split Card */
    .adaptive-core-card {
      border: 1.5px solid #000000;
      background: #ffffff;
      border-radius: 10px;
      padding: 10px 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.03);
    }

    .firewall-divider {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      margin: 8px 0;
      border-top: 1px dashed #d1d5db;
      padding-top: 7px;
    }

    .firewall-pill {
      background: #111827;
      color: #ffffff;
      font-size: 8px;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 9999px;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      display: flex;
      align-items: center;
      gap: 5px;
    }

    /* Callout & Principle Footer */
    .principles-footer {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
      margin-top: 10px;
      border-top: 1px solid #e5e7eb;
      padding-top: 9px;
    }

    .principle-item {
      font-size: 8.5px;
      color: #374151;
      line-height: 1.35;
    }

    .principle-title {
      font-size: 9px;
      font-weight: 700;
      color: #000000;
      margin-bottom: 2px;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    /* PAGE 2 FLOW SPECIFIC STYLES */
    .flow-step-container {
      display: flex;
      flex-direction: column;
      gap: 8px;
      flex: 1;
    }

    .step-node {
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 8px 11px;
      background: #ffffff;
      display: flex;
      align-items: flex-start;
      gap: 10px;
      position: relative;
    }

    .step-index {
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: #000000;
      color: #ffffff;
      font-size: 9.5px;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      margin-top: 1px;
    }

    .step-content {
      flex: 1;
    }

    .step-header-line {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 3px;
    }

    .step-title {
      font-size: 10px;
      font-weight: 700;
      color: #111827;
    }

    .step-text {
      font-size: 8.5px;
      color: #4b5563;
      line-height: 1.35;
    }

    /* Branching Layout in Step 5 */
    .branch-container {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 7px;
      margin-top: 5px;
    }

    .branch-card {
      border-radius: 6px;
      padding: 6px 8px;
      font-size: 8.5px;
      border: 1px solid;
    }

    .branch-accelerated {
      background: #ecfdf5;
      border-color: #a7f3d0;
      color: #064e3b;
    }

    .branch-guided {
      background: #fffbeb;
      border-color: #fde68a;
      color: #78350f;
    }

    .branch-rootgap {
      background: #fff1f2;
      border-color: #fecdd3;
      color: #881337;
    }

    .branch-title {
      font-weight: 700;
      font-size: 9px;
      margin-bottom: 2px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    /* Table styling */
    .spec-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 8.5px;
      margin-top: 8px;
    }

    .spec-table th {
      background: #f3f4f6;
      color: #111827;
      text-align: left;
      padding: 4px 8px;
      font-weight: 700;
      border: 1px solid #e5e7eb;
      font-family: 'JetBrains Mono', monospace;
      font-size: 8px;
    }

    .spec-table td {
      padding: 4px 8px;
      border: 1px solid #e5e7eb;
      color: #374151;
    }

    .spec-table tr:nth-child(even) {
      background: #fafafa;
    }

    .flow-connector {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 10px;
      color: #9ca3af;
    }

    .page-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid #e5e7eb;
      padding-top: 6px;
      margin-top: auto;
      font-size: 8px;
      color: #9ca3af;
      font-family: 'JetBrains Mono', monospace;
    }
  </style>
</head>
<body>

  <!-- ========================================================================= -->
  <!-- PAGE 1: ADAPTIVE SYSTEM ARCHITECTURE                                     -->
  <!-- ========================================================================= -->
  <div class="page">
    <div class="doc-header">
      <div class="brand-group">
        <div class="brand-badge">IQ</div>
        <div>
          <div class="brand-title">ShikshaIQ</div>
          <div class="brand-subtitle">One classroom. Different learners. Personalized learning for everyone.</div>
        </div>
      </div>
      <div class="doc-meta">
        <div>ARCHITECTURE DOCUMENTATION</div>
        <div>VERSION 1.0.0 &bull; NCERT CLASS 7 FRACTIONS</div>
      </div>
    </div>

    <div class="section-title">
      <span>Part 1: Adaptive System Architecture & Security Boundary</span>
      <span class="badge badge-black">SYSTEM BLUEPRINT</span>
    </div>
    <div class="section-desc">
      A transparent, deterministic knowledge-tracing architecture engineered for Indian school classrooms (40–60 students per teacher). Strict physical and logical decoupling between the deterministic evaluation engine and the Socratic AI tutor companion.
    </div>

    <div class="arch-container">

      <!-- LAYER 1: CLIENT TIER -->
      <div class="layer-card">
        <div class="layer-header">
          <div class="layer-name">
            <span class="layer-number">LAYER 1</span>
            <span>Client & Presentation Layer (Offline-First Next.js 16 + React 19)</span>
          </div>
          <span class="badge badge-neutral">Minimal Monochrome UI</span>
        </div>
        <div class="grid-3">
          <div class="sub-box">
            <div class="sub-box-title">
              <span>Student Learning Portal</span>
              <span class="code-pill">/student</span>
            </div>
            <div class="sub-box-text">
              Daily study streak tracking, 3-star concept ratings, 15-question diagnostic runner, visual fraction bars, and 1-click WhatsApp parent progress reports.
            </div>
          </div>
          <div class="sub-box">
            <div class="sub-box-title">
              <span>Teacher Copilot Dashboard</span>
              <span class="code-pill">/teacher</span>
            </div>
            <div class="sub-box-text">
              Real-time student mastery matrix heatmap, classroom-wide bottleneck alerts (e.g. LCM deficit), and pedagogical intervention override controls.
            </div>
          </div>
          <div class="sub-box">
            <div class="sub-box-title">
              <span>Offline PWA Sync Engine</span>
              <span class="code-pill">IndexedDB</span>
            </div>
            <div class="sub-box-text">
              Caches full NCERT lessons & questions for rural schools. Queues offline student attempts with client UUIDv4 for idempotent auto-sync upon reconnection.
            </div>
          </div>
        </div>
      </div>

      <!-- LAYER 2: SECURITY & GATEWAY -->
      <div class="layer-card" style="background: #f8fafc; border-color: #cbd5e1;">
        <div class="layer-header">
          <div class="layer-name">
            <span class="layer-number" style="background: #334155;">LAYER 2</span>
            <span>Edge Security, Anti-Tamper & Role-Based Authorization</span>
          </div>
          <span class="badge badge-neutral">Zero-Trust Boundary</span>
        </div>
        <div class="grid-3">
          <div class="sub-box">
            <div class="sub-box-title">Middleware Session Guard</div>
            <div class="sub-box-text">
              Enforces HTTP-only SameSite cookies via <span class="code-pill">@supabase/ssr</span>. Blocks unverified teachers and routes them to <span class="code-pill">/pending-approval</span>.
            </div>
          </div>
          <div class="sub-box">
            <div class="sub-box-title">Zero Client Grading</div>
            <div class="sub-box-text">
              Client never submits scores or passes percentages. Client submits only selected option IDs; grading occurs strictly on the protected server runtime.
            </div>
          </div>
          <div class="sub-box">
            <div class="sub-box-title">Production Security Headers</div>
            <div class="sub-box-text">
              Strict CSP without unsafe external domains, HSTS (63M seconds), <span class="code-pill">X-Frame-Options: DENY</span>, and anti-open-redirect destination validators.
            </div>
          </div>
        </div>
      </div>

      <!-- LAYER 3: CORE ADAPTIVE ENGINE (SPECIAL HIGHLIGHT) -->
      <div class="adaptive-core-card">
        <div class="layer-header">
          <div class="layer-name">
            <span class="layer-number" style="background: #000000;">LAYER 3</span>
            <span style="font-size: 11.5px; font-weight: 800;">Deterministic Adaptive Core Engine (<span class="code-pill">lib/adaptive/</span>)</span>
          </div>
          <span class="badge badge-emerald">Auditable & Transparent</span>
        </div>
        <div class="grid-3" style="margin-top: 4px;">
          <div class="sub-box" style="border-left: 3px solid #000000;">
            <div class="sub-box-title">1. Prerequisite DAG Graph</div>
            <div class="sub-box-text">
              Acyclic Directed Graph mapping Class 7 Fractions:
              <br>• <strong>C1:</strong> Fraction Basics (Parts of a whole)
              <br>• <strong>C2:</strong> Common Multiples & Factors (LCM)
              <br>• <strong>C3:</strong> Equivalent Fractions (Req: C1)
              <br>• <strong>C4:</strong> Adding Fractions (Req: C2 + C3)
              <br>• <strong>C5:</strong> Mixed Fraction Problems (Req: C4)
            </div>
          </div>
          <div class="sub-box" style="border-left: 3px solid #10b981;">
            <div class="sub-box-title">2. Deterministic Mastery Calculation</div>
            <div class="sub-box-text">
              Strict ratio formula per concept node:
              <div style="font-family: 'JetBrains Mono', monospace; font-size: 8px; margin: 3px 0; background: #f3f4f6; padding: 2px 4px; border-radius: 4px;">
                Mastery(c) = CorrectAttempts / TotalValidEvidence
              </div>
              • <strong>Mastered:</strong> &ge; 80% with &ge; 2 valid attempts
              <br>• <strong>Partial:</strong> 50% to &lt; 80% (or &ge; 80% with 1 attempt)
              <br>• <strong>Needs Revision:</strong> &lt; 50% score
            </div>
          </div>
          <div class="sub-box" style="border-left: 3px solid #f43f5e;">
            <div class="sub-box-title">3. Root Gap Prerequisite Traversal</div>
            <div class="sub-box-text">
              Recursive DFS inspects all transitive prerequisites:
              <br>If student struggles with C4 (Adding Fractions), engine inspects C2 & C3. If C2 (LCM) &lt; 80%, engine flags <strong>Root Prerequisite Bottleneck</strong> and routes to C2 first!
            </div>
          </div>
        </div>

        <!-- FIREWALL SEPARATION -->
        <div class="firewall-divider">
          <div class="firewall-pill">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            ARCHITECTURAL FIREWALL: STRICT DECOUPLING
          </div>
          <span style="font-size: 8px; color: #6b7280; font-style: italic;">The LLM is NEVER the grader. Deterministic algorithms decide mastery; AI provides only Socratic hints.</span>
        </div>

        <!-- LAYER 4: AI COMPANION TIER -->
        <div class="grid-2">
          <div class="sub-box" style="background: #fafafa;">
            <div class="sub-box-title">
              <span>Socratic AI Companion Service (<span class="code-pill">lib/ai/</span>)</span>
              <span class="badge badge-amber" style="font-size: 7.5px;">LLM Guardrails</span>
            </div>
            <div class="sub-box-text">
              <strong>Server-Side Only:</strong> Zero secret leakage. Injects concept context, objective, and Indian cultural analogies (dividing rotis, sharing dosas, cricket over run-rates). Rate-limited to 15 req/min per student.
            </div>
          </div>
          <div class="sub-box" style="background: #fafafa;">
            <div class="sub-box-title">
              <span>Socratic Prompt Guardrails</span>
              <span class="badge badge-neutral" style="font-size: 7.5px;">Zero Spoon-Feeding</span>
            </div>
            <div class="sub-box-text">
              The AI is instructed strictly to ask probing questions and guide students step-by-step. <strong>Private answer keys are strictly withheld</strong> from the AI context payload to completely eliminate prompt leakage.
            </div>
          </div>
        </div>
      </div>

      <!-- LAYER 5: PERSISTENCE & DATA -->
      <div class="layer-card">
        <div class="layer-header">
          <div class="layer-name">
            <span class="layer-number">LAYER 4</span>
            <span>Data Persistence, Row Level Security & Real-Time Telemetry (Supabase PostgreSQL)</span>
          </div>
          <span class="badge badge-neutral">ACID Compliance</span>
        </div>
        <div class="grid-3">
          <div class="sub-box">
            <div class="sub-box-title">Row Level Security (RLS)</div>
            <div class="sub-box-text">
              Students access only own attempts. Teachers view only enrolled class cohorts. Database-level policy prevents foreign profile tampering.
            </div>
          </div>
          <div class="sub-box">
            <div class="sub-box-title">PostgreSQL Realtime CDC</div>
            <div class="sub-box-text">
              Subscribes to <span class="code-pill">student_mastery</span> and <span class="code-pill">student_attempts</span> events, instantly updating Teacher Copilot telemetry with zero page refresh.
            </div>
          </div>
          <div class="sub-box">
            <div class="sub-box-title">Immutable Audit Trail</div>
            <div class="sub-box-text">
              Captures all educator approvals, account suspensions, and teacher intervention assignments with actor ID and ISO timestamps.
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- PRINCIPLES FOOTER -->
    <div class="principles-footer">
      <div class="principle-item">
        <div class="principle-title">1. Deterministic & Explainable</div>
        Every recommendation contains a deterministic audit rationale explaining why a prerequisite was assigned (e.g. <em>"C4 requires C2 (LCM), currently at 45%"</em>).
      </div>
      <div class="principle-item">
        <div class="principle-title">2. Privacy of Minors</div>
        Zero commercial analytics or ad trackers. Student PII is strictly isolated; student names and emails are never forwarded to external AI providers.
      </div>
      <div class="principle-item">
        <div class="principle-title">3. Classroom Reality</div>
        Engineered for real Indian state board and CBSE schools: erratic internet handling, high student-to-teacher ratios, and multi-language support (EN, HI, MR).
      </div>
    </div>

    <div class="page-footer">
      <span>SHIKSHAIQ &bull; ADAPTIVE LEARNING ARCHITECTURE SPECIFICATION</span>
      <span>PAGE 1 OF 2</span>
    </div>
  </div>

  <!-- ========================================================================= -->
  <!-- PAGE 2: ADAPTIVITY EXECUTION FLOW                                        -->
  <!-- ========================================================================= -->
  <div class="page">
    <div class="doc-header">
      <div class="brand-group">
        <div class="brand-badge">IQ</div>
        <div>
          <div class="brand-title">ShikshaIQ</div>
          <div class="brand-subtitle">One classroom. Different learners. Personalized learning for everyone.</div>
        </div>
      </div>
      <div class="doc-meta">
        <div>EXECUTION LIFECYCLE</div>
        <div>ALGORITHMIC TRAVERSAL FLOW</div>
      </div>
    </div>

    <div class="section-title">
      <span>Part 2: Adaptivity Workflow & Dynamic Remediation Traversal</span>
      <span class="badge badge-black">EXECUTION PIPELINE</span>
    </div>
    <div class="section-desc">
      Detailed step-by-step lifecycle showing how a student attempt triggers deterministic grading, DAG gap traversal, dynamic three-way personalized branching, Socratic scaffolding, and real-time teacher feedback loops.
    </div>

    <div class="flow-step-container">

      <!-- STEP 1 -->
      <div class="step-node">
        <div class="step-index">1</div>
        <div class="step-content">
          <div class="step-header-line">
            <div class="step-title">Diagnostic Assessment Administration</div>
            <span class="badge badge-neutral">15-Question Baseline</span>
          </div>
          <div class="step-text">
            Student begins with a 15-question baseline assessment (3 randomized questions per concept across all 5 DAG nodes). The client receives question stems and options; <strong>private answer keys remain strictly on the server</strong> to prevent browser inspection cheating.
          </div>
        </div>
      </div>

      <!-- CONNECTOR -->
      <div class="flow-connector">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12l7 7 7-7"/></svg>
      </div>

      <!-- STEP 2 -->
      <div class="step-node">
        <div class="step-index">2</div>
        <div class="step-content">
          <div class="step-header-line">
            <div class="step-title">Server-Side Anti-Tamper Evaluation & Attempt Deduplication</div>
            <span class="badge badge-neutral">API: /api/assessment/submit</span>
          </div>
          <div class="step-text">
            Client submits answers payload <span class="code-pill">[{ questionId, selectedOptionId, timeSpentSeconds }]</span>. Server verifies submissions against private <span class="code-pill">ANSWER_KEYS</span>, computes isCorrect, persists raw attempts to <span class="code-pill">student_attempts</span>, and deduplicates multiple attempts on identical questions.
          </div>
        </div>
      </div>

      <!-- CONNECTOR -->
      <div class="flow-connector">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12l7 7 7-7"/></svg>
      </div>

      <!-- STEP 3 -->
      <div class="step-node">
        <div class="step-index">3</div>
        <div class="step-content">
          <div class="step-header-line">
            <div class="step-title">Deterministic Node Mastery Evaluation</div>
            <span class="badge badge-emerald">Formula Evaluation</span>
          </div>
          <div class="step-text">
            The mathematical engine evaluates each concept node independently:
            <span class="code-pill">Mastery(c) = Correct / ValidEvidence</span>. Threshold evaluation:
            <span class="badge badge-emerald" style="font-size:7px;">Mastered (&ge;80% + N&ge;2)</span>,
            <span class="badge badge-amber" style="font-size:7px;">Partial (50%–79%)</span>,
            <span class="badge badge-rose" style="font-size:7px;">Needs Revision (&lt;50%)</span>.
            Persists to <span class="code-pill">student_mastery</span> database table.
          </div>
        </div>
      </div>

      <!-- CONNECTOR -->
      <div class="flow-connector">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12l7 7 7-7"/></svg>
      </div>

      <!-- STEP 4 -->
      <div class="step-node" style="border-left: 3px solid #000000;">
        <div class="step-index">4</div>
        <div class="step-content">
          <div class="step-header-line">
            <div class="step-title">Prerequisite DAG Gap Traversal Algorithm</div>
            <span class="badge badge-black">DFS Prerequisite Check</span>
          </div>
          <div class="step-text">
            For current target concept <em>C</em>, the engine executes a topological Depth-First Search over all upstream prerequisites:
            <br><code>for each P in TransitivePrerequisites(C): if Mastery(P) &lt; 0.80 then FLAG_BOTTLENECK(P)</code>
            <br>If multiple prerequisites are weak, the engine selects the foundational root node first (tie-breaker: lowest curriculum order index).
          </div>
        </div>
      </div>

      <!-- CONNECTOR -->
      <div class="flow-connector">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12l7 7 7-7"/></svg>
      </div>

      <!-- STEP 5: THREE-WAY BRANCHING -->
      <div class="step-node" style="background: #fafafa;">
        <div class="step-index">5</div>
        <div class="step-content">
          <div class="step-header-line">
            <div class="step-title">Dynamic Pedagogical Routing (Three Individualized Journeys)</div>
            <span class="badge badge-neutral">Differentiated Learning</span>
          </div>
          <div class="step-text">
            Based on the DAG audit, students are partitioned into three distinct learning trajectories:
          </div>

          <div class="branch-container">
            <div class="branch-card branch-accelerated">
              <div class="branch-title">
                <span>Branch A: Accelerated</span>
                <span class="badge badge-emerald" style="font-size:7px;">94% Score</span>
              </div>
              <strong>Student: Aarav Gupta</strong><br>
              All foundational nodes mastered. Bypasses repetitive procedural drills and advances straight to multi-step <em>Mixed Fraction Word Problems</em> and algebraic applications.
            </div>

            <div class="branch-card branch-guided">
              <div class="branch-title">
                <span>Branch B: Guided Scaffolding</span>
                <span class="badge badge-amber" style="font-size:7px;">72% Score</span>
              </div>
              <strong>Student: Diya Patel</strong><br>
              Prerequisites intact, but occasional reduction errors. Assigned visual fraction bars and guided step-by-step practice to cement fraction simplification fluency.
            </div>

            <div class="branch-card branch-rootgap">
              <div class="branch-title">
                <span>Branch C: Root Gap Bridge</span>
                <span class="badge badge-rose" style="font-size:7px;">48% Score</span>
              </div>
              <strong>Student: Rohan Sharma</strong><br>
              Failure in Adding Fractions is diagnosed as a <em>Common Multiples (LCM at 45%)</em> deficit. Routed to a 5-minute visual LCM module before returning to fraction addition.
            </div>
          </div>
        </div>
      </div>

      <!-- CONNECTOR -->
      <div class="flow-connector">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12l7 7 7-7"/></svg>
      </div>

      <!-- STEP 6 -->
      <div class="step-node">
        <div class="step-index">6</div>
        <div class="step-content">
          <div class="step-header-line">
            <div class="step-title">Socratic Scaffolding & Conceptual Remediation</div>
            <span class="badge badge-amber">Interactive Practice</span>
          </div>
          <div class="step-text">
            Students practice targeted questions. When stuck, the Socratic AI Companion provides step-by-step hints and relatable Indian cultural analogies (e.g. <em>"Think of sharing a 6-slice pizza among friends"</em> or <em>"Finding the LCM of bell ringing intervals"</em>) without ever disclosing the correct answer choice.
          </div>
        </div>
      </div>

      <!-- CONNECTOR -->
      <div class="flow-connector">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12l7 7 7-7"/></svg>
      </div>

      <!-- STEP 7 -->
      <div class="step-node" style="border-left: 3px solid #10b981;">
        <div class="step-index">7</div>
        <div class="step-content">
          <div class="step-header-line">
            <div class="step-title">Continuous Mastery Re-evaluation & Real-Time Telemetry Feedback Loop</div>
            <span class="badge badge-emerald">Closed Loop</span>
          </div>
          <div class="step-text">
            Upon completing remediation, new attempt records update concept mastery. When the prerequisite gap is cleared (&ge; 80%), the engine unlocks downstream concepts, broadcasts a live update to the <strong>Teacher Copilot Matrix</strong>, and generates an updated <strong>Parent WhatsApp Progress Card</strong>.
          </div>
        </div>
      </div>

    </div>

    <!-- DAG CURRICULUM SPECIFICATION TABLE -->
    <table class="spec-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Curriculum Concept</th>
          <th>Prerequisites</th>
          <th>Downstream Impact</th>
          <th>Root Remediation Action</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>C1</strong></td>
          <td>Fraction Basics</td>
          <td>None (Foundational)</td>
          <td>Blocks C3, C4, C5</td>
          <td>Visual fraction parts-of-a-whole interactive model</td>
        </tr>
        <tr>
          <td><strong>C2</strong></td>
          <td>Common Multiples & Factors</td>
          <td>None (Arithmetic)</td>
          <td>Blocks C4, C5</td>
          <td>Common multiples list & prime factorization tree</td>
        </tr>
        <tr>
          <td><strong>C3</strong></td>
          <td>Equivalent Fractions</td>
          <td>C1 (Fraction Basics)</td>
          <td>Blocks C4, C5</td>
          <td>Multiplying/dividing numerator & denominator grids</td>
        </tr>
        <tr>
          <td><strong>C4</strong></td>
          <td>Adding Fractions</td>
          <td>C2 (LCM) + C3 (Equivalent)</td>
          <td>Blocks C5</td>
          <td>Convert unlike denominators to common LCM base</td>
        </tr>
        <tr>
          <td><strong>C5</strong></td>
          <td>Mixed Fraction Problems</td>
          <td>C4 (Adding Fractions)</td>
          <td>Curriculum Summit</td>
          <td>Decompose mixed fractions to improper fractions</td>
        </tr>
      </tbody>
    </table>

    <div class="page-footer">
      <span>SHIKSHAIQ &bull; ADAPTIVE LEARNING ARCHITECTURE SPECIFICATION</span>
      <span>PAGE 2 OF 2</span>
    </div>
  </div>

</body>
</html>
`;

async function generatePDF() {
  console.log("Launching headless browser for PDF generation...");
  const browser = await chromium.launch({
    headless: true,
    executablePath: "/usr/bin/google-chrome",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  await page.setContent(htmlContent, { waitUntil: "networkidle" });

  console.log("Generating A4 print-quality PDF...");
  await page.pdf({
    path: OUTPUT_PDF_PUBLIC,
    format: "A4",
    printBackground: true,
    margin: {
      top: "10mm",
      bottom: "10mm",
      left: "12mm",
      right: "12mm",
    },
  });

  // Copy to workspace root
  fs.copyFileSync(OUTPUT_PDF_PUBLIC, OUTPUT_PDF_ROOT);

  await browser.close();
  console.log(`✓ Generated: ${OUTPUT_PDF_PUBLIC}`);
  console.log(`✓ Copied to: ${OUTPUT_PDF_ROOT}`);
}

generatePDF().catch(console.error);
