/* eslint-disable @typescript-eslint/no-require-imports */
const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const DOCS_DIR = path.join(__dirname, "../docs");
const PUBLIC_DIR = path.join(__dirname, "../public");
const ROOT_DIR = path.join(__dirname, "..");

if (!fs.existsSync(DOCS_DIR)) fs.mkdirSync(DOCS_DIR, { recursive: true });
if (!fs.existsSync(PUBLIC_DIR)) fs.mkdirSync(PUBLIC_DIR, { recursive: true });

const OUTPUT_PDF_DOCS = path.join(DOCS_DIR, "ShikshaIQ_Architecture_and_Workflow.pdf");
const OUTPUT_PDF_ROOT = path.join(ROOT_DIR, "ShikshaIQ_Architecture_and_Workflow.pdf");
const OUTPUT_PDF_PUBLIC = path.join(PUBLIC_DIR, "ShikshaIQ_Architecture_and_Workflow.pdf");

const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>ShikshaIQ — System Architecture & Workflow Documentation</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap');

    @page {
      size: A4 landscape;
      margin: 6mm 8mm 6mm 8mm;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      color: #0f172a;
      background: #ffffff;
      font-size: 10px;
      line-height: 1.35;
      -webkit-font-smoothing: antialiased;
    }

    .page {
      width: 100%;
      height: 196mm;
      max-height: 196mm;
      page-break-after: always;
      display: flex;
      flex-direction: column;
      position: relative;
      overflow: hidden;
    }

    .page:last-child {
      page-break-after: avoid;
    }

    /* Common Running Header */
    .header-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #0f172a;
      padding-bottom: 5px;
      margin-bottom: 8px;
      flex-shrink: 0;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 9px;
    }

    .header-logo {
      width: 24px;
      height: 24px;
      background: #000000;
      color: #ffffff;
      font-weight: 900;
      font-size: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 5px;
      font-family: 'Inter', sans-serif;
    }

    .header-title-group h1 {
      font-size: 14px;
      font-weight: 800;
      letter-spacing: -0.02em;
      color: #000000;
      line-height: 1.1;
    }

    .header-title-group p {
      font-size: 8px;
      color: #64748b;
      font-weight: 500;
    }

    .header-meta {
      text-align: right;
      font-family: 'JetBrains Mono', monospace;
      font-size: 7.5px;
      color: #475569;
      line-height: 1.3;
    }

    /* Running Footer */
    .footer-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid #e2e8f0;
      padding-top: 4px;
      margin-top: auto;
      font-family: 'JetBrains Mono', monospace;
      font-size: 7.5px;
      color: #94a3b8;
      flex-shrink: 0;
    }

    /* Badge & Tag Helpers */
    .tag {
      display: inline-flex;
      align-items: center;
      gap: 3px;
      padding: 1.5px 5px;
      border-radius: 4px;
      font-size: 7.5px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.02em;
      font-family: 'JetBrains Mono', monospace;
    }
    .tag-black { background: #000; color: #fff; }
    .tag-blue { background: #eff6ff; color: #1e40af; border: 1px solid #bfdbfe; }
    .tag-emerald { background: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0; }
    .tag-amber { background: #fffbeb; color: #92400e; border: 1px solid #fde68a; }
    .tag-rose { background: #fff1f2; color: #9f1239; border: 1px solid #fecdd3; }
    .tag-slate { background: #f8fafc; color: #334155; border: 1px solid #cbd5e1; }

    /* ========================================================================= */
    /* PAGE 1: TITLE & EXECUTIVE ARCHITECTURE BRIEF                              */
    /* ========================================================================= */
    .hero-banner {
      background: #f8fafc;
      border: 1.5px solid #e2e8f0;
      border-radius: 8px;
      padding: 12px 16px;
      margin-bottom: 9px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-shrink: 0;
    }

    .hero-text h2 {
      font-size: 17px;
      font-weight: 900;
      letter-spacing: -0.03em;
      color: #0f172a;
      margin-bottom: 3px;
    }

    .hero-text p {
      font-size: 9.5px;
      color: #475569;
      max-width: 690px;
      line-height: 1.4;
    }

    .hero-badges {
      display: flex;
      flex-direction: column;
      gap: 4px;
      align-items: flex-end;
    }

    .p1-grid {
      display: grid;
      grid-template-columns: 1.15fr 0.85fr;
      gap: 10px;
      flex: 1;
      overflow: hidden;
    }

    .card {
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 9px 11px;
      background: #ffffff;
      display: flex;
      flex-direction: column;
    }

    .card-title {
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: -0.01em;
      color: #0f172a;
      margin-bottom: 6px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid #f1f5f9;
      padding-bottom: 4px;
      flex-shrink: 0;
    }

    .tech-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 8px;
      flex: 1;
    }

    .tech-table th {
      background: #f1f5f9;
      color: #0f172a;
      text-align: left;
      padding: 3.5px 5px;
      font-weight: 700;
      border: 1px solid #e2e8f0;
      font-family: 'JetBrains Mono', monospace;
      font-size: 7px;
    }

    .tech-table td {
      padding: 3.5px 5px;
      border: 1px solid #e2e8f0;
      color: #334155;
    }

    .tech-table tr:nth-child(even) {
      background: #fafafa;
    }

    .core-pillars-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 6px;
      margin-bottom: 6px;
    }

    .pillar-box {
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 6px 8px;
      background: #f8fafc;
    }

    .pillar-box h4 {
      font-size: 8.5px;
      font-weight: 800;
      color: #0f172a;
      margin-bottom: 2px;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .pillar-box p {
      font-size: 7.5px;
      color: #475569;
      line-height: 1.3;
    }

    /* ========================================================================= */
    /* PAGE 2 & 3: DIAGRAM WRAPPERS & FOOTER LEGENDS                            */
    /* ========================================================================= */
    .diagram-container {
      flex: 1;
      display: flex;
      flex-direction: column;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      background: #fafbfc;
      padding: 6px 8px;
      overflow: hidden;
      margin-bottom: 6px;
    }

    .diagram-legend-bar {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 7px;
      border-top: 1px solid #e2e8f0;
      padding-top: 5px;
      flex-shrink: 0;
    }

    .diagram-legend-bar-3col {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
      border-top: 1px solid #e2e8f0;
      padding-top: 5px;
      flex-shrink: 0;
    }

    .legend-box {
      font-size: 7.5px;
      color: #475569;
      line-height: 1.3;
    }

    .legend-box strong {
      color: #0f172a;
      display: block;
      margin-bottom: 1px;
      font-size: 8px;
    }
  </style>
</head>
<body>

  <!-- ========================================================================= -->
  <!-- PAGE 1: TITLE, SCOPE & DISCOVERED TECHNOLOGY STACK                       -->
  <!-- ========================================================================= -->
  <div class="page">
    <div class="header-bar">
      <div class="header-left">
        <div class="header-logo">IQ</div>
        <div class="header-title-group">
          <h1>ShikshaIQ — Adaptive Mathematics Learning Platform</h1>
          <p>Deterministic Prerequisite Knowledge Tracing & Socratic AI Companion &bull; NCERT Class 7</p>
        </div>
      </div>
      <div class="header-meta">
        <div>TECHNICAL ARCHITECTURE & SPECIFICATION</div>
        <div>DOCUMENT REF: SIQ-ARCH-2026-V1 &bull; NOVEMBER 2026</div>
      </div>
    </div>

    <!-- Hero Overview Banner -->
    <div class="hero-banner">
      <div class="hero-text">
        <h2>System Architecture & Application Workflow Specification</h2>
        <p>
          ShikshaIQ is an enterprise-grade adaptive learning platform engineered for Indian school education (NCERT Class 7 Mathematics: Fractions Chapter 2). In typical classrooms where one educator instructs 40 to 60 students, foundational deficits—such as Least Common Multiples (LCM) or Equivalent Fractions—often go undetected. ShikshaIQ resolves this bottleneck by integrating a <strong>transparent deterministic knowledge graph</strong> with an <strong>isolated Socratic AI companion</strong>, backed by real-time classroom telemetry and offline-first IndexedDB resilience.
        </p>
      </div>
      <div class="hero-badges">
        <span class="tag tag-black">NEXT.JS 16.4 APP ROUTER</span>
        <span class="tag tag-emerald">DETERMINISTIC MASTERY ENGINE</span>
        <span class="tag tag-blue">SUPABASE POSTGRESQL + RLS</span>
        <span class="tag tag-amber">SOCRATIC AI WITH ZERO KEY LEAK</span>
        <span class="tag tag-slate">OFFLINE-FIRST PWA ENGINE</span>
      </div>
    </div>

    <div class="p1-grid">
      <!-- Left Column: Discovered Technology Stack -->
      <div class="card">
        <div class="card-title">
          <span>Discovered Technology Stack & System Components</span>
          <span class="tag tag-slate">VERIFIED SOURCE BASE</span>
        </div>
        <table class="tech-table">
          <thead>
            <tr>
              <th style="width: 20%;">System Layer</th>
              <th style="width: 32%;">Technology / Framework</th>
              <th style="width: 48%;">Architectural Function in ShikshaIQ</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Frontend & UI</strong></td>
              <td>Next.js 16.4.3 (App Router), React 19.3, Tailwind CSS v4, Lucide Icons</td>
              <td>Server Components, Turbopack bundling, minimal monochrome Apple-style UI, sub-second route transitions.</td>
            </tr>
            <tr>
              <td><strong>Edge Security</strong></td>
              <td>Next.js Edge Middleware (<span style="font-family: monospace;">middleware.ts</span>), HTTP-only SameSite Cookies</td>
              <td>Enforces RBAC session validation via <span style="font-family: monospace;">@supabase/ssr</span>; routes unapproved teachers to <span style="font-family: monospace;">/pending-approval</span>.</td>
            </tr>
            <tr>
              <td><strong>Adaptive Engine</strong></td>
              <td>Deterministic DAG Engine (<span style="font-family: monospace;">lib/adaptive/</span>), TypeScript 5 (Strict)</td>
              <td>Calculates score ratios without double-counting; identifies prerequisite bottlenecks via DFS graph traversal.</td>
            </tr>
            <tr>
              <td><strong>AI / ML Service</strong></td>
              <td>Google Gemini / OpenAI SDK Abstraction (<span style="font-family: monospace;">lib/ai/</span>)</td>
              <td>Streaming Socratic companion with Indian cultural analogies (rotis, dosas, cricket). Answer keys strictly excluded.</td>
            </tr>
            <tr>
              <td><strong>Database & Auth</strong></td>
              <td>Supabase PostgreSQL (Managed Postgres 15+), Supabase Auth</td>
              <td>ACID relational integrity, Row Level Security (RLS) policies on every table, append-only immutable audit logs.</td>
            </tr>
            <tr>
              <td><strong>Real-Time Telemetry</strong></td>
              <td>PostgreSQL Realtime (Change Data Capture over WebSocket)</td>
              <td>Instant live synchronization of student test submissions directly to Teacher Copilot heatmap with zero reload.</td>
            </tr>
            <tr>
              <td><strong>Offline Storage</strong></td>
              <td>IndexedDB API (<span style="font-family: monospace;">syncManager.ts</span>), Client UUIDv4</td>
              <td>Local caching of 5 curriculum concepts; offline attempt queueing with idempotent background resynchronization.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Right Column: Core Architectural Principles -->
      <div class="card">
        <div class="card-title">
          <span>Core Engineering Principles & Separation Boundary</span>
          <span class="tag tag-emerald">STRICT CONSTRAINTS</span>
        </div>
        <div class="core-pillars-grid">
          <div class="pillar-box" style="border-left: 3px solid #000;">
            <h4>1. The Architectural Firewall</h4>
            <p><strong>The LLM is NEVER the Grader.</strong> Grading and mastery progression are 100% deterministic algorithms. The AI only provides Socratic conceptual hints.</p>
          </div>
          <div class="pillar-box" style="border-left: 3px solid #059669;">
            <h4>2. Zero Client-Side Grading</h4>
            <p>Clients submit raw selected options. Private answer keys remain on the server, eliminating inspection tool cheating and score tampering.</p>
          </div>
          <div class="pillar-box" style="border-left: 3px solid #d97706;">
            <h4>3. Minor Privacy & Isolation</h4>
            <p>Minor students' PII (names, emails) is never sent to LLM providers. Strict Row Level Security prevents cross-school data visibility.</p>
          </div>
          <div class="pillar-box" style="border-left: 3px solid #2563eb;">
            <h4>4. Real-World Classroom Fit</h4>
            <p>Designed for erratic connectivity (IndexedDB offline PWA) and actionable teacher oversight (systemic bottleneck detection alerts).</p>
          </div>
        </div>

        <div style="margin-top: auto; padding: 6px 8px; background: #fffbeb; border: 1px solid #fde68a; border-radius: 6px;">
          <div style="font-size: 8px; font-weight: 700; color: #92400e; margin-bottom: 2px;">Curriculum DAG Nodes (Class 7 Fractions):</div>
          <div style="font-size: 7.5px; color: #78350f; font-family: 'JetBrains Mono', monospace; line-height: 1.3;">
            C1: Fraction Basics &bull; C2: Common Multiples & Factors (LCM) &bull; C3: Equivalent Fractions (Req: C1)<br>
            C4: Adding Fractions (Req: C2 + C3) &bull; C5: Mixed Fraction Problems (Req: C4)
          </div>
        </div>
      </div>
    </div>

    <div class="footer-bar">
      <span>SHIKSHAIQ ENTERPRISE TECHNICAL DOCUMENTATION &bull; SYSTEM ARCHITECTURE &bull; CONFIDENTIAL</span>
      <span>PAGE 1 OF 3</span>
    </div>
  </div>

  <!-- ========================================================================= -->
  <!-- PAGE 2: COMPLETE SYSTEM ARCHITECTURE DIAGRAM                              -->
  <!-- ========================================================================= -->
  <div class="page">
    <div class="header-bar">
      <div class="header-left">
        <div class="header-logo">IQ</div>
        <div class="header-title-group">
          <h1>Diagram 1: ShikshaIQ End-to-End System Architecture</h1>
          <p>Layered Component Topology, Security Boundaries, Data Flows, and Decoupled AI Pipeline</p>
        </div>
      </div>
      <div class="header-meta">
        <div>ARCHITECTURE TOPOLOGY</div>
        <div>VECTOR TECHNICAL SPECIFICATION</div>
      </div>
    </div>

    <div class="diagram-container">
      <!-- High-Resolution Vector Architecture SVG Diagram -->
      <svg viewBox="0 0 1020 400" width="100%" height="100%" style="display: block; font-family: 'Inter', sans-serif;">
        <defs>
          <filter id="shadowP2" x="-2%" y="-2%" width="104%" height="106%" filterUnits="userSpaceOnUse">
            <feDropShadow dx="0" dy="1.5" stdDeviation="2" flood-color="#000000" flood-opacity="0.04"/>
          </filter>
          <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#475569"/>
          </marker>
          <marker id="arrowBlue" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#2563eb"/>
          </marker>
          <marker id="arrowEmerald" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#059669"/>
          </marker>
          <marker id="arrowAmber" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#d97706"/>
          </marker>
        </defs>

        <!-- 1. ACTORS & CLIENTS SWIMLANE -->
        <rect x="15" y="10" width="130" height="380" rx="7" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.2" filter="url(#shadowP2)"/>
        <rect x="15" y="10" width="130" height="24" rx="7" fill="#0f172a"/>
        <text x="80" y="26" fill="#ffffff" font-size="9" font-weight="800" text-anchor="middle" letter-spacing="0.04em">1. ACTORS & CLIENTS</text>

        <!-- Student -->
        <rect x="25" y="44" width="110" height="50" rx="5" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1"/>
        <text x="80" y="61" fill="#0f172a" font-size="8.5" font-weight="700" text-anchor="middle">Student Learner</text>
        <text x="80" y="73" fill="#64748b" font-size="7.5" text-anchor="middle">Diagnostic, Practice &</text>
        <text x="80" y="83" fill="#64748b" font-size="7.5" text-anchor="middle">Socratic Tutor Companion</text>

        <!-- Teacher -->
        <rect x="25" y="102" width="110" height="50" rx="5" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1"/>
        <text x="80" y="119" fill="#0f172a" font-size="8.5" font-weight="700" text-anchor="middle">Classroom Teacher</text>
        <text x="80" y="131" fill="#64748b" font-size="7.5" text-anchor="middle">Teacher Copilot, Heatmap,</text>
        <text x="80" y="141" fill="#64748b" font-size="7.5" text-anchor="middle">Interventions & Insights</text>

        <!-- Admin -->
        <rect x="25" y="160" width="110" height="50" rx="5" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1"/>
        <text x="80" y="177" fill="#0f172a" font-size="8.5" font-weight="700" text-anchor="middle">School Administrator</text>
        <text x="80" y="189" fill="#64748b" font-size="7.5" text-anchor="middle">Teacher Approval Queue,</text>
        <text x="80" y="199" fill="#64748b" font-size="7.5" text-anchor="middle">Curriculum & Audit Log</text>

        <!-- Offline PWA -->
        <rect x="25" y="218" width="110" height="50" rx="5" fill="#ecfdf5" stroke="#a7f3d0" stroke-width="1"/>
        <text x="80" y="235" fill="#065f46" font-size="8.5" font-weight="700" text-anchor="middle">Offline PWA Engine</text>
        <text x="80" y="247" fill="#047857" font-size="7.5" text-anchor="middle">IndexedDB Local Cache &</text>
        <text x="80" y="257" fill="#047857" font-size="7.5" text-anchor="middle">Idempotent Queue Token</text>

        <!-- Parent WhatsApp -->
        <rect x="25" y="276" width="110" height="50" rx="5" fill="#f0fdf4" stroke="#86efac" stroke-width="1"/>
        <text x="80" y="293" fill="#15803d" font-size="8.5" font-weight="700" text-anchor="middle">Parent Mobile Phone</text>
        <text x="80" y="305" fill="#166534" font-size="7.5" text-anchor="middle">WhatsApp Progress Card</text>
        <text x="80" y="315" fill="#166534" font-size="7.5" text-anchor="middle">Stars, Accuracy & Gaps</text>


        <!-- 2. PRESENTATION & EDGE ROUTING SWIMLANE -->
        <rect x="155" y="10" width="180" height="380" rx="7" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.2" filter="url(#shadowP2)"/>
        <rect x="155" y="10" width="180" height="24" rx="7" fill="#1e293b"/>
        <text x="245" y="26" fill="#ffffff" font-size="9" font-weight="800" text-anchor="middle" letter-spacing="0.04em">2. PRESENTATION & EDGE</text>

        <!-- App Router Pages -->
        <rect x="165" y="44" width="160" height="78" rx="5" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1"/>
        <text x="245" y="59" fill="#0f172a" font-size="8.5" font-weight="700" text-anchor="middle">Next.js 16.4 App Router</text>
        <text x="175" y="73" fill="#475569" font-size="7.5">&bull; <tspan font-family="monospace">/student</tspan> (Streaks & Badges)</text>
        <text x="175" y="85" fill="#475569" font-size="7.5">&bull; <tspan font-family="monospace">/student/assessment</tspan> (15 Qs)</text>
        <text x="175" y="97" fill="#475569" font-size="7.5">&bull; <tspan font-family="monospace">/student/learn/[id]</tspan> & <tspan font-family="monospace">practice</tspan></text>
        <text x="175" y="109" fill="#475569" font-size="7.5">&bull; <tspan font-family="monospace">/teacher</tspan> & <tspan font-family="monospace">/admin</tspan> Portals</text>

        <!-- Edge Middleware Guard -->
        <rect x="165" y="130" width="160" height="74" rx="5" fill="#eff6ff" stroke="#bfdbfe" stroke-width="1"/>
        <text x="245" y="145" fill="#1e3a8a" font-size="8.5" font-weight="800" text-anchor="middle">Edge Middleware (middleware.ts)</text>
        <text x="175" y="159" fill="#1e40af" font-size="7.5">&bull; Cookie Auth Check (@supabase/ssr)</text>
        <text x="175" y="171" fill="#1e40af" font-size="7.5">&bull; RBAC Route Access Filtering</text>
        <text x="175" y="183" fill="#1e40af" font-size="7.5">&bull; Zero-Trust Pending Teacher Gate</text>
        <text x="175" y="194" fill="#1e40af" font-size="7">&bull; Safe Relative Redirect Sanitizer</text>

        <!-- PWA Sync Manager -->
        <rect x="165" y="212" width="160" height="74" rx="5" fill="#ecfdf5" stroke="#a7f3d0" stroke-width="1"/>
        <text x="245" y="227" fill="#064e3b" font-size="8.5" font-weight="800" text-anchor="middle">PWA syncManager.ts</text>
        <text x="175" y="241" fill="#047857" font-size="7.5">&bull; IndexedDB Cache: 5 Concepts</text>
        <text x="175" y="253" fill="#047857" font-size="7.5">&bull; Attempt Outbox Queue Buffer</text>
        <text x="175" y="265" fill="#047857" font-size="7.5">&bull; UUIDv4 Idempotency Token</text>
        <text x="175" y="276" fill="#047857" font-size="7">&bull; Online Auto-Flush Sync Worker</text>

        <!-- Security Headers -->
        <rect x="165" y="294" width="160" height="84" rx="5" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1"/>
        <text x="245" y="309" fill="#0f172a" font-size="8.5" font-weight="800" text-anchor="middle">Security Headers (next.config)</text>
        <text x="175" y="323" fill="#475569" font-size="7.5">&bull; Strict CSP (Zero 3rd-party scripts)</text>
        <text x="175" y="335" fill="#475569" font-size="7.5">&bull; HSTS: max-age=63072000</text>
        <text x="175" y="347" fill="#475569" font-size="7.5">&bull; X-Frame-Options: DENY</text>
        <text x="175" y="359" fill="#475569" font-size="7.5">&bull; X-Content-Type-Options: nosniff</text>
        <text x="175" y="370" fill="#475569" font-size="7">&bull; Referrer-Policy: strict-origin</text>


        <!-- 3. API & SERVER ACTIONS SWIMLANE -->
        <rect x="345" y="10" width="185" height="380" rx="7" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.2" filter="url(#shadowP2)"/>
        <rect x="345" y="10" width="185" height="24" rx="7" fill="#334155"/>
        <text x="437" y="26" fill="#ffffff" font-size="9" font-weight="800" text-anchor="middle" letter-spacing="0.04em">3. API & SERVER ACTIONS</text>

        <!-- Route Handlers -->
        <rect x="355" y="44" width="165" height="92" rx="5" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1"/>
        <text x="437" y="59" fill="#0f172a" font-size="8.5" font-weight="700" text-anchor="middle">Server Route Handlers (API)</text>
        <text x="365" y="73" fill="#334155" font-size="7.5">&bull; <tspan font-family="monospace">POST /api/assessment/submit</tspan></text>
        <text x="375" y="83" fill="#64748b" font-size="7">Server grading & DAG calculation</text>
        <text x="365" y="95" fill="#334155" font-size="7.5">&bull; <tspan font-family="monospace">POST /api/practice/sync</tspan></text>
        <text x="375" y="105" fill="#64748b" font-size="7">Batch offline queue ingestion</text>
        <text x="365" y="117" fill="#334155" font-size="7.5">&bull; <tspan font-family="monospace">POST /api/tutor</tspan></text>
        <text x="375" y="127" fill="#64748b" font-size="7">Socratic streaming hint generation</text>

        <!-- Server Actions -->
        <rect x="355" y="144" width="165" height="110" rx="5" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1"/>
        <text x="437" y="159" fill="#0f172a" font-size="8.5" font-weight="700" text-anchor="middle">Next.js Server Actions</text>
        <text x="365" y="173" fill="#334155" font-size="7.5">&bull; <tspan font-family="monospace">signInUser / signUpUser</tspan></text>
        <text x="365" y="185" fill="#334155" font-size="7.5">&bull; <tspan font-family="monospace">createClassroomAction</tspan></text>
        <text x="375" y="195" fill="#64748b" font-size="7">Generates unguessable 6-char code</text>
        <text x="365" y="207" fill="#334155" font-size="7.5">&bull; <tspan font-family="monospace">createTeacherInterventionAction</tspan></text>
        <text x="375" y="217" fill="#64748b" font-size="7">Pedagogical assignment override</text>
        <text x="365" y="229" fill="#334155" font-size="7.5">&bull; <tspan font-family="monospace">approveTeacherAction</tspan></text>
        <text x="365" y="241" fill="#334155" font-size="7.5">&bull; <tspan font-family="monospace">getAdminMetrics / Profiles</tspan></text>

        <!-- Validation & Traffic Control -->
        <rect x="355" y="262" width="165" height="116" rx="5" fill="#fffbeb" stroke="#fde68a" stroke-width="1"/>
        <text x="437" y="277" fill="#92400e" font-size="8.5" font-weight="800" text-anchor="middle">Traffic Control & Validation</text>
        <text x="365" y="291" fill="#78350f" font-size="7.5">&bull; Strict Zod Input Schemas</text>
        <text x="365" y="303" fill="#78350f" font-size="7.5">&bull; Socratic Tutor Rate Limiter</text>
        <text x="375" y="313" fill="#b45309" font-size="7">Sliding window: 15 req/min per student</text>
        <text x="365" y="325" fill="#78350f" font-size="7.5">&bull; Question Deduplication Map</text>
        <text x="375" y="335" fill="#b45309" font-size="7">Deduplicates multiple student attempts</text>
        <text x="365" y="347" fill="#78350f" font-size="7.5">&bull; Anti-Spoof Role Verification</text>
        <text x="365" y="359" fill="#78350f" font-size="7.5">&bull; Minors' PII Sanitizer Filter</text>


        <!-- 4. CORE ADAPTIVE & SOCRATIC AI SWIMLANE -->
        <rect x="540" y="10" width="260" height="380" rx="7" fill="#ffffff" stroke="#000000" stroke-width="1.6" filter="url(#shadowP2)"/>
        <rect x="540" y="10" width="260" height="24" rx="7" fill="#000000"/>
        <text x="670" y="26" fill="#ffffff" font-size="9" font-weight="800" text-anchor="middle" letter-spacing="0.04em">4. ADAPTIVE CORE & SOCRATIC AI</text>

        <!-- Deterministic Graph & Scoring -->
        <rect x="550" y="44" width="240" height="136" rx="5" fill="#f0fdf4" stroke="#86efac" stroke-width="1"/>
        <text x="670" y="59" fill="#14532d" font-size="9" font-weight="900" text-anchor="middle">Deterministic Adaptive Engine (lib/adaptive)</text>

        <!-- Mini DAG Visualization -->
        <g transform="translate(560, 68)">
          <rect x="0" y="0" width="46" height="17" rx="3" fill="#ffffff" stroke="#16a34a" stroke-width="1"/>
          <text x="23" y="11" font-size="6.5" font-weight="700" fill="#15803d" text-anchor="middle">C1 Basics</text>

          <rect x="76" y="0" width="56" height="17" rx="3" fill="#ffffff" stroke="#16a34a" stroke-width="1"/>
          <text x="104" y="11" font-size="6.5" font-weight="700" fill="#15803d" text-anchor="middle">C3 Equivalent</text>

          <rect x="0" y="28" width="46" height="17" rx="3" fill="#ffffff" stroke="#16a34a" stroke-width="1"/>
          <text x="23" y="39" font-size="6.5" font-weight="700" fill="#15803d" text-anchor="middle">C2 LCM</text>

          <rect x="76" y="28" width="56" height="17" rx="3" fill="#ffffff" stroke="#d97706" stroke-width="1"/>
          <text x="104" y="39" font-size="6.5" font-weight="700" fill="#b45309" text-anchor="middle">C4 Adding</text>

          <rect x="155" y="14" width="52" height="17" rx="3" fill="#ffffff" stroke="#2563eb" stroke-width="1"/>
          <text x="181" y="25" font-size="6.5" font-weight="700" fill="#1d4ed8" text-anchor="middle">C5 Mixed</text>

          <line x1="46" y1="8" x2="74" y2="8" stroke="#16a34a" stroke-width="1.2" marker-end="url(#arrowEmerald)"/>
          <line x1="132" y1="8" x2="153" y2="19" stroke="#16a34a" stroke-width="1.2" marker-end="url(#arrowEmerald)"/>
          <line x1="46" y1="36" x2="74" y2="36" stroke="#16a34a" stroke-width="1.2" marker-end="url(#arrowEmerald)"/>
          <line x1="132" y1="36" x2="153" y2="26" stroke="#d97706" stroke-width="1.2" marker-end="url(#arrowAmber)"/>
        </g>

        <text x="560" y="128" fill="#166534" font-size="7.5">&bull; <strong>Mastery Ratio Formula:</strong> M(c) = Correct / ValidAttempts</text>
        <text x="560" y="140" fill="#166534" font-size="7.5">&bull; <strong>Mastered:</strong> &ge; 80% (N&ge;2) &bull; <strong>Needs Revision:</strong> &lt; 50%</text>
        <text x="560" y="152" fill="#166534" font-size="7.5">&bull; <strong>Prerequisite Gap Traversal:</strong> DFS upstream scan</text>
        <text x="560" y="164" fill="#166534" font-size="7.5">&bull; <strong>Root Deficit Routing:</strong> Assigns C2 before C4!</text>

        <!-- THE ARCHITECTURAL FIREWALL DIVIDER -->
        <line x1="550" y1="188" x2="790" y2="188" stroke="#dc2626" stroke-width="1.8" stroke-dasharray="4,3"/>
        <rect x="585" y="181" width="170" height="14" rx="3" fill="#dc2626"/>
        <text x="670" y="191" fill="#ffffff" font-size="7" font-weight="900" text-anchor="middle" letter-spacing="0.04em">FIREWALL: LLM NEVER GRADES</text>

        <!-- Socratic AI Companion -->
        <rect x="550" y="202" width="240" height="176" rx="5" fill="#fffbeb" stroke="#fde68a" stroke-width="1"/>
        <text x="670" y="217" fill="#92400e" font-size="9" font-weight="900" text-anchor="middle">Socratic AI Companion (lib/ai)</text>
        <text x="560" y="232" fill="#78350f" font-size="7.5">&bull; <strong>Provider Abstraction:</strong> Gemini 2.0 Flash / OpenAI</text>
        <text x="560" y="244" fill="#78350f" font-size="7.5">&bull; <strong>Indian Cultural Analogies:</strong></text>
        <text x="570" y="255" fill="#b45309" font-size="7">Sharing rotis, dividing dosas, cricket over run-rates</text>
        <text x="560" y="267" fill="#78350f" font-size="7.5">&bull; <strong>Strict Socratic Pedagogical Guardrails:</strong></text>
        <text x="570" y="278" fill="#b45309" font-size="7">Asks probing questions; refuses answer spoon-feeding</text>
        <text x="560" y="290" fill="#78350f" font-size="7.5">&bull; <strong>Zero Answer Key Leakage:</strong></text>
        <text x="570" y="301" fill="#b45309" font-size="7">Private keys excluded from AI prompt context</text>
        <text x="560" y="313" fill="#78350f" font-size="7.5">&bull; <strong>Zero Student PII Transmission:</strong></text>
        <text x="570" y="324" fill="#b45309" font-size="7">Names, emails, and school IDs withheld from prompts</text>
        <text x="560" y="336" fill="#78350f" font-size="7.5">&bull; <strong>Multilingual:</strong> English, Hindi & Marathi prompts</text>
        <text x="560" y="348" fill="#78350f" font-size="7.5">&bull; <strong>Rate-Limited:</strong> 15 requests per minute threshold</text>
        <text x="560" y="360" fill="#78350f" font-size="7.5">&bull; <strong>Anti-Hallucination:</strong> Never computes student scores</text>


        <!-- 5. DATABASE & REALTIME CDC SWIMLANE -->
        <rect x="810" y="10" width="195" height="380" rx="7" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.2" filter="url(#shadowP2)"/>
        <rect x="810" y="10" width="195" height="24" rx="7" fill="#0f172a"/>
        <text x="907" y="26" fill="#ffffff" font-size="9" font-weight="800" text-anchor="middle" letter-spacing="0.04em">5. SUPABASE POSTGRESQL</text>

        <!-- Core Relational Tables -->
        <rect x="820" y="44" width="175" height="150" rx="5" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1"/>
        <text x="907" y="59" fill="#0f172a" font-size="8.5" font-weight="700" text-anchor="middle">Relational Database Tables</text>
        <text x="830" y="74" fill="#334155" font-size="7.5">&bull; <tspan font-family="monospace">public.profiles</tspan> (Role, Status)</text>
        <text x="830" y="87" fill="#334155" font-size="7.5">&bull; <tspan font-family="monospace">public.classrooms</tspan> (Join Code)</text>
        <text x="830" y="100" fill="#334155" font-size="7.5">&bull; <tspan font-family="monospace">public.classroom_students</tspan></text>
        <text x="830" y="113" fill="#334155" font-size="7.5">&bull; <tspan font-family="monospace">public.student_mastery</tspan></text>
        <text x="830" y="126" fill="#334155" font-size="7.5">&bull; <tspan font-family="monospace">public.student_attempts</tspan></text>
        <text x="830" y="139" fill="#334155" font-size="7.5">&bull; <tspan font-family="monospace">public.teacher_interventions</tspan></text>
        <text x="830" y="152" fill="#334155" font-size="7.5">&bull; <tspan font-family="monospace">public.audit_logs</tspan> (Immutable)</text>
        <text x="830" y="165" fill="#334155" font-size="7.5">&bull; <tspan font-family="monospace">public.question_answer_keys</tspan></text>
        <text x="840" y="176" fill="#64748b" font-size="7">Protected server private keys table</text>

        <!-- Row Level Security -->
        <rect x="820" y="202" width="175" height="88" rx="5" fill="#eff6ff" stroke="#bfdbfe" stroke-width="1"/>
        <text x="907" y="217" fill="#1e3a8a" font-size="8.5" font-weight="800" text-anchor="middle">Row Level Security (RLS)</text>
        <text x="830" y="232" fill="#1e40af" font-size="7.5">&bull; <strong>Students:</strong> View own records only</text>
        <text x="830" y="245" fill="#1e40af" font-size="7.5">&bull; <strong>Teachers:</strong> View assigned classes</text>
        <text x="830" y="258" fill="#1e40af" font-size="7.5">&bull; <strong>Admins:</strong> Manage approval queue</text>
        <text x="830" y="271" fill="#1e40af" font-size="7.5">&bull; <strong>Audit Log:</strong> Insert only; zero update</text>

        <!-- Realtime Engine -->
        <rect x="820" y="298" width="175" height="80" rx="5" fill="#ecfdf5" stroke="#a7f3d0" stroke-width="1"/>
        <text x="907" y="313" fill="#064e3b" font-size="8.5" font-weight="800" text-anchor="middle">PostgreSQL Realtime CDC</text>
        <text x="830" y="328" fill="#047857" font-size="7.5">&bull; WebSocket Telemetry Broadcast</text>
        <text x="830" y="341" fill="#047857" font-size="7.5">&bull; <tspan font-family="monospace">postgres_changes</tspan> on Mastery</text>
        <text x="830" y="354" fill="#047857" font-size="7.5">&bull; Auto-syncs Teacher Heatmap Matrix</text>
        <text x="830" y="367" fill="#047857" font-size="7.5">&bull; Sub-second latency without polling</text>


        <!-- INTER-TIER CONNECTING ARROWS -->
        <!-- Actors -> Presentation -->
        <line x1="135" y1="69" x2="163" y2="69" stroke="#475569" stroke-width="1.2" marker-end="url(#arrow)"/>
        <text x="149" y="64" font-size="6" fill="#64748b" text-anchor="middle">HTTPS</text>

        <line x1="135" y1="127" x2="163" y2="127" stroke="#475569" stroke-width="1.2" marker-end="url(#arrow)"/>
        <line x1="135" y1="185" x2="163" y2="185" stroke="#475569" stroke-width="1.2" marker-end="url(#arrow)"/>

        <!-- Offline PWA -> Sync Manager -->
        <line x1="135" y1="243" x2="163" y2="243" stroke="#059669" stroke-width="1.2" marker-end="url(#arrowEmerald)"/>
        <text x="149" y="238" font-size="6" fill="#059669" text-anchor="middle">IndexedDB</text>

        <!-- Presentation -> API -->
        <line x1="325" y1="78" x2="353" y2="78" stroke="#475569" stroke-width="1.2" marker-end="url(#arrow)"/>
        <text x="339" y="73" font-size="6" fill="#64748b" text-anchor="middle">POST JSON</text>

        <line x1="325" y1="168" x2="353" y2="168" stroke="#475569" stroke-width="1.2" marker-end="url(#arrow)"/>
        <text x="339" y="163" font-size="6" fill="#64748b" text-anchor="middle">Actions</text>

        <!-- API -> Adaptive Core -->
        <line x1="520" y1="90" x2="548" y2="90" stroke="#059669" stroke-width="1.4" marker-end="url(#arrowEmerald)"/>
        <text x="534" y="84" font-size="6" font-weight="700" fill="#059669" text-anchor="middle">Evaluate</text>

        <!-- API -> AI Tutor -->
        <line x1="520" y1="120" x2="548" y2="230" stroke="#d97706" stroke-width="1.2" marker-end="url(#arrowAmber)"/>
        <text x="530" y="175" font-size="6" font-weight="700" fill="#d97706" text-anchor="middle">Prompt</text>

        <!-- Adaptive Core -> Supabase DB -->
        <line x1="790" y1="110" x2="818" y2="110" stroke="#2563eb" stroke-width="1.4" marker-end="url(#arrowBlue)"/>
        <text x="804" y="103" font-size="6" font-weight="700" fill="#2563eb" text-anchor="middle">UPSERT</text>

        <!-- Supabase Realtime -> Teacher App -->
        <path d="M 820 340 L 535 385 L 325 105" fill="none" stroke="#059669" stroke-width="1.2" stroke-dasharray="3,3" marker-end="url(#arrowEmerald)"/>
        <text x="575" y="380" font-size="6.5" font-weight="700" fill="#059669" text-anchor="middle">WebSocket CDC Live Telemetry Stream to Teacher Dashboard</text>
      </svg>
    </div>

    <!-- Architecture Layer Breakdown Legend -->
    <div class="diagram-legend-bar">
      <div class="legend-box">
        <strong>Tier 1: Client & Presentation</strong>
        React 19 Server Components with Next.js 16 Turbopack. Offline resilience through IndexedDB PWA attempt queueing and single-click WhatsApp progress reports.
      </div>
      <div class="legend-box">
        <strong>Tier 2: Edge Routing & Security</strong>
        Edge middleware session cookie verification. Restricts unverified teachers to <span style="font-family: monospace;">/pending-approval</span>; prevents client score tampering.
      </div>
      <div class="legend-box">
        <strong>Tier 3: Core Adaptive & AI Companion</strong>
        Decoupled architecture: deterministic DAG knowledge tracing calculates mastery ratios; Socratic AI provides scaffolding with culturally resonant Indian analogies.
      </div>
      <div class="legend-box">
        <strong>Tier 4: Relational Persistence & CDC</strong>
        Supabase PostgreSQL enforces Row Level Security (RLS) on all 8 tables. Realtime CDC pushes live student mastery changes straight to the Teacher Copilot matrix.
      </div>
    </div>

    <div class="footer-bar">
      <span>SHIKSHAIQ ENTERPRISE TECHNICAL DOCUMENTATION &bull; SYSTEM ARCHITECTURE &bull; CONFIDENTIAL</span>
      <span>PAGE 2 OF 3</span>
    </div>
  </div>

  <!-- ========================================================================= -->
  <!-- PAGE 3: COMPLETE SYSTEM WORKFLOW / FLOWCHART                              -->
  <!-- ========================================================================= -->
  <div class="page">
    <div class="header-bar">
      <div class="header-left">
        <div class="header-logo">IQ</div>
        <div class="header-title-group">
          <h1>Diagram 2: Complete ShikshaIQ Application Execution Flowchart</h1>
          <p>End-to-End Execution Sequence: Authentication, Server-Side Grading, DAG Gap Traversal, Three-Way Branching & Closed-Loop Telemetry</p>
        </div>
      </div>
      <div class="header-meta">
        <div>EXECUTION LIFECYCLE</div>
        <div>ALGORITHMIC DECISION FLOW</div>
      </div>
    </div>

    <div class="diagram-container">
      <!-- High-Resolution Vector Workflow SVG Diagram -->
      <svg viewBox="0 0 1020 400" width="100%" height="100%" style="display: block; font-family: 'Inter', sans-serif;">
        <defs>
          <filter id="shadowP3" x="-2%" y="-2%" width="104%" height="106%" filterUnits="userSpaceOnUse">
            <feDropShadow dx="0" dy="1" stdDeviation="1.5" flood-color="#000000" flood-opacity="0.05"/>
          </filter>
        </defs>

        <!-- STAGE 1: AUTH & ROLE DISPATCH -->
        <!-- START OVAL -->
        <ellipse cx="65" cy="40" rx="42" ry="16" fill="#0f172a" stroke="#000" stroke-width="1.2"/>
        <text x="65" y="44" fill="#ffffff" font-size="8.5" font-weight="800" text-anchor="middle">START</text>

        <!-- Parallelogram: Credentials Input -->
        <polygon points="20,85 125,85 110,115 5,115" fill="#f8fafc" stroke="#64748b" stroke-width="1"/>
        <text x="65" y="100" font-size="7.5" font-weight="700" fill="#0f172a" text-anchor="middle">User Submits</text>
        <text x="65" y="110" font-size="6.5" fill="#64748b" text-anchor="middle">Email & Password</text>

        <line x1="65" y1="56" x2="65" y2="83" stroke="#475569" stroke-width="1.2" marker-end="url(#arrow)"/>

        <!-- Decision Diamond: Teacher Verification -->
        <polygon points="65,145 115,175 65,205 15,175" fill="#eff6ff" stroke="#3b82f6" stroke-width="1.2"/>
        <text x="65" y="171" font-size="7" font-weight="800" fill="#1e3a8a" text-anchor="middle">Teacher</text>
        <text x="65" y="181" font-size="7" font-weight="800" fill="#1e3a8a" text-anchor="middle">Approved?</text>

        <line x1="65" y1="115" x2="65" y2="143" stroke="#475569" stroke-width="1.2" marker-end="url(#arrow)"/>

        <!-- No -> Pending Approval Process -->
        <rect x="5" y="240" width="120" height="32" rx="4" fill="#fff1f2" stroke="#f43f5e" stroke-width="1"/>
        <text x="65" y="254" font-size="7.5" font-weight="700" fill="#9f1239" text-anchor="middle">Route to /pending-approval</text>
        <text x="65" y="264" font-size="6.5" fill="#881337" text-anchor="middle">Student records isolated</text>

        <line x1="65" y1="205" x2="65" y2="238" stroke="#f43f5e" stroke-width="1.2" marker-end="url(#arrow)"/>
        <text x="73" y="222" font-size="7" font-weight="700" fill="#f43f5e">No</text>

        <!-- Admin approves -> Unlock -->
        <rect x="5" y="300" width="120" height="30" rx="4" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1"/>
        <text x="65" y="314" font-size="7.5" font-weight="700" fill="#0f172a" text-anchor="middle">Admin Approves in /admin</text>
        <text x="65" y="324" font-size="6.5" fill="#64748b" text-anchor="middle">Updates account_status to 'active'</text>
        <line x1="65" y1="272" x2="65" y2="298" stroke="#475569" stroke-width="1" stroke-dasharray="2,2" marker-end="url(#arrow)"/>


        <!-- Yes / Student -> Authenticated Access -->
        <rect x="155" y="157" width="115" height="36" rx="5" fill="#f0fdf4" stroke="#86efac" stroke-width="1"/>
        <text x="212" y="172" font-size="8" font-weight="700" fill="#14532d" text-anchor="middle">Authenticated Access</text>
        <text x="212" y="184" font-size="7" fill="#166534" text-anchor="middle">Student (/student) or Teacher (/teacher)</text>

        <line x1="115" y1="175" x2="153" y2="175" stroke="#059669" stroke-width="1.4" marker-end="url(#arrowEmerald)"/>
        <text x="133" y="168" font-size="7.5" font-weight="800" fill="#059669">Yes</text>


        <!-- STAGE 2: DIAGNOSTIC & DETERMINISTIC EVALUATION -->
        <!-- Process: Diagnostic Quiz -->
        <rect x="155" y="65" width="115" height="42" rx="5" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.2"/>
        <text x="212" y="81" font-size="8" font-weight="800" fill="#0f172a" text-anchor="middle">Diagnostic Assessment</text>
        <text x="212" y="92" font-size="7" fill="#64748b" text-anchor="middle">15 Questions (3 per node)</text>
        <text x="212" y="102" font-size="6.5" fill="#64748b" text-anchor="middle">Single-question timer runner</text>

        <line x1="212" y1="157" x2="212" y2="109" stroke="#475569" stroke-width="1.2" marker-end="url(#arrow)"/>

        <!-- Process: Server Evaluation API -->
        <rect x="300" y="65" width="130" height="42" rx="5" fill="#eff6ff" stroke="#93c5fd" stroke-width="1.2"/>
        <text x="365" y="80" font-size="8" font-weight="800" fill="#1e3a8a" text-anchor="middle">Server Evaluation API</text>
        <text x="365" y="91" font-size="7" fill="#1e40af" text-anchor="middle">Validates against ANSWER_KEYS</text>
        <text x="365" y="101" font-size="6.5" fill="#1e40af" text-anchor="middle">Deduplicates by question ID</text>

        <line x1="270" y1="86" x2="298" y2="86" stroke="#2563eb" stroke-width="1.2" marker-end="url(#arrowBlue)"/>

        <!-- Process: Deterministic Tracing -->
        <rect x="300" y="145" width="130" height="50" rx="5" fill="#ffffff" stroke="#059669" stroke-width="1.4"/>
        <text x="365" y="160" font-size="8" font-weight="900" fill="#065f46" text-anchor="middle">Deterministic Tracing</text>
        <text x="365" y="172" font-size="7.5" font-family="monospace" fill="#0f172a" text-anchor="middle">M(c) = Correct / ValidN</text>
        <text x="365" y="183" font-size="6.5" fill="#047857" text-anchor="middle">Mastered: &ge;80% (N&ge;2) &bull; Needs Rev: &lt;50%</text>
        <text x="365" y="192" font-size="6.5" fill="#047857" text-anchor="middle">Persists to student_mastery table</text>

        <line x1="365" y1="107" x2="365" y2="143" stroke="#059669" stroke-width="1.4" marker-end="url(#arrowEmerald)"/>


        <!-- STAGE 3: PREREQUISITE TRAVERSAL & DECISION -->
        <!-- Decision Diamond: Prerequisite Gap Check -->
        <polygon points="505,135 565,170 505,205 445,170" fill="#fffbeb" stroke="#d97706" stroke-width="1.4"/>
        <text x="505" y="166" font-size="7" font-weight="900" fill="#92400e" text-anchor="middle">Any Upstream</text>
        <text x="505" y="176" font-size="7" font-weight="900" fill="#92400e" text-anchor="middle">Prereq &lt; 80%?</text>
        <text x="505" y="185" font-size="6.5" fill="#b45309" text-anchor="middle">DFS Transitive Scan</text>

        <line x1="430" y1="170" x2="443" y2="170" stroke="#d97706" stroke-width="1.4" marker-end="url(#arrowAmber)"/>


        <!-- STAGE 4: THREE-WAY ADAPTIVE BRANCHING -->

        <!-- BRANCH C: Root Gap Remediation (Yes) -->
        <line x1="505" y1="205" x2="505" y2="255" stroke="#f43f5e" stroke-width="1.4" marker-end="url(#arrow)"/>
        <text x="512" y="228" font-size="7" font-weight="800" fill="#f43f5e">Yes (Gap Found)</text>

        <rect x="440" y="257" width="135" height="58" rx="5" fill="#fff1f2" stroke="#fecdd3" stroke-width="1.2"/>
        <text x="507" y="271" font-size="7.5" font-weight="900" fill="#9f1239" text-anchor="middle">Branch C: Prerequisite Bridge</text>
        <text x="507" y="283" font-size="7" font-weight="700" fill="#881337" text-anchor="middle">Student: Rohan Sharma (48%)</text>
        <text x="507" y="294" font-size="6.5" fill="#881337" text-anchor="middle">Struggles with Adding Fractions (C4)</text>
        <text x="507" y="304" font-size="6.5" font-weight="800" fill="#e11d48" text-anchor="middle">ROUTED TO C2 (LCM) FIRST!</text>

        <!-- BRANCH B: Guided Scaffolding (No -> Target not mastered) -->
        <line x1="565" y1="170" x2="605" y2="170" stroke="#475569" stroke-width="1.4" marker-end="url(#arrow)"/>
        <text x="583" y="163" font-size="7" font-weight="800" fill="#475569">No</text>

        <polygon points="650,145 695,170 650,195 605,170" fill="#f8fafc" stroke="#64748b" stroke-width="1.2"/>
        <text x="650" y="167" font-size="7" font-weight="800" fill="#0f172a" text-anchor="middle">Target Node</text>
        <text x="650" y="176" font-size="7" font-weight="800" fill="#0f172a" text-anchor="middle">&ge; 80%?</text>

        <!-- Target < 80%: Branch B -->
        <line x1="650" y1="195" x2="650" y2="257" stroke="#d97706" stroke-width="1.4" marker-end="url(#arrowAmber)"/>
        <text x="657" y="224" font-size="7" font-weight="800" fill="#d97706">No (&lt;80%)</text>

        <rect x="590" y="257" width="125" height="58" rx="5" fill="#fffbeb" stroke="#fde68a" stroke-width="1.2"/>
        <text x="652" y="271" font-size="7.5" font-weight="900" fill="#92400e" text-anchor="middle">Branch B: Guided Scaffolding</text>
        <text x="652" y="283" font-size="7" font-weight="700" fill="#78350f" text-anchor="middle">Student: Diya Patel (72%)</text>
        <text x="652" y="294" font-size="6.5" fill="#78350f" text-anchor="middle">Prerequisites intact; occasional errors</text>
        <text x="652" y="304" font-size="6.5" font-weight="700" fill="#b45309" text-anchor="middle">Visual fraction bars + practice</text>

        <!-- Target >= 80%: Branch A -->
        <line x1="695" y1="170" x2="745" y2="170" stroke="#059669" stroke-width="1.4" marker-end="url(#arrowEmerald)"/>
        <text x="718" y="163" font-size="7" font-weight="800" fill="#059669">Yes (&ge;80%)</text>

        <rect x="747" y="146" width="115" height="48" rx="5" fill="#ecfdf5" stroke="#a7f3d0" stroke-width="1.2"/>
        <text x="804" y="160" font-size="7.5" font-weight="900" fill="#065f46" text-anchor="middle">Branch A: Accelerated</text>
        <text x="804" y="171" font-size="7" font-weight="700" fill="#047857" text-anchor="middle">Aarav Gupta (94%)</text>
        <text x="804" y="181" font-size="6.5" fill="#047857" text-anchor="middle">Advance straight to Mixed</text>
        <text x="804" y="189" font-size="6.5" fill="#047857" text-anchor="middle">Fraction Word Problems (C5)</text>


        <!-- STAGE 5: SOCRATIC TUTOR INTERACTION -->
        <!-- Decision: Ask AI Tutor? -->
        <polygon points="795,235 840,260 795,285 750,260" fill="#eff6ff" stroke="#3b82f6" stroke-width="1.2"/>
        <text x="795" y="257" font-size="7" font-weight="800" fill="#1e3a8a" text-anchor="middle">Stuck on Problem?</text>
        <text x="795" y="267" font-size="7" font-weight="800" fill="#1e3a8a" text-anchor="middle">Request Hint?</text>

        <!-- Connectors from Branches B & C -->
        <path d="M 575 286 L 748 260" fill="none" stroke="#64748b" stroke-width="1" stroke-dasharray="3,2" marker-end="url(#arrow)"/>
        <path d="M 715 286 L 748 260" fill="none" stroke="#64748b" stroke-width="1" stroke-dasharray="3,2" marker-end="url(#arrow)"/>

        <!-- Yes -> Socratic AI Guidance -->
        <rect x="880" y="235" width="125" height="52" rx="5" fill="#fffbeb" stroke="#fde68a" stroke-width="1.2"/>
        <text x="942" y="250" font-size="8" font-weight="800" fill="#92400e" text-anchor="middle">Socratic AI Drawer</text>
        <text x="942" y="261" font-size="7" fill="#78350f" text-anchor="middle">Provides step hints &</text>
        <text x="942" y="271" font-size="7" fill="#78350f" text-anchor="middle">Indian analogies (rotis/cricket)</text>
        <text x="942" y="281" font-size="6.5" font-weight="700" fill="#b45309" text-anchor="middle">Zero answers revealed</text>

        <line x1="840" y1="260" x2="878" y2="260" stroke="#d97706" stroke-width="1.2" marker-end="url(#arrowAmber)"/>
        <text x="858" y="253" font-size="7" font-weight="800" fill="#d97706">Yes</text>


        <!-- STAGE 6: CLOSED LOOP RE-EVALUATION -->
        <!-- Process: Solve & Re-evaluate -->
        <rect x="880" y="315" width="125" height="40" rx="5" fill="#f0fdf4" stroke="#86efac" stroke-width="1.2"/>
        <text x="942" y="330" font-size="8" font-weight="800" fill="#14532d" text-anchor="middle">Mastery Re-evaluated</text>
        <text x="942" y="341" font-size="7" fill="#166534" text-anchor="middle">M(c) updated dynamically</text>
        <text x="942" y="350" font-size="6.5" fill="#166534" text-anchor="middle">Prereq cleared? Unlock next</text>

        <line x1="942" y1="287" x2="942" y2="313" stroke="#059669" stroke-width="1.2" marker-end="url(#arrowEmerald)"/>
        <line x1="795" y1="285" x2="878" y2="325" stroke="#475569" stroke-width="1" stroke-dasharray="2,2" marker-end="url(#arrow)"/>
        <text x="825" y="310" font-size="6.5" fill="#64748b">No (Solve)</text>

        <!-- Realtime Telemetry Broadcast Loop -->
        <path d="M 880 345 L 365 345 L 365 197" fill="none" stroke="#2563eb" stroke-width="1.3" stroke-dasharray="3,3" marker-end="url(#arrowBlue)"/>
        <text x="610" y="355" font-size="7" font-weight="800" fill="#2563eb" text-anchor="middle">Realtime CDC Broadcast: Updates Teacher Copilot Heatmap & Parent WhatsApp Card</text>

        <!-- END NODE -->
        <ellipse cx="942" cy="385" rx="38" ry="12" fill="#0f172a" stroke="#000" stroke-width="1.2"/>
        <text x="942" y="389" fill="#ffffff" font-size="8" font-weight="800" text-anchor="middle">END: MASTERY</text>

        <line x1="942" y1="355" x2="942" y2="371" stroke="#0f172a" stroke-width="1.2" marker-end="url(#arrow)"/>

      </svg>
    </div>

    <!-- Workflow Execution Bar Explanation -->
    <div class="diagram-legend-bar-3col">
      <div class="legend-box">
        <strong>1. Diagnostic Baseline & Server Validation</strong>
        Student initiates a 15-question baseline quiz. The client never computes score percentages; responses post to <span style="font-family: monospace;">/api/assessment/submit</span> where raw answers match against private server keys and deduplicate by question.
      </div>
      <div class="legend-box">
        <strong>2. DFS Prerequisite Gap Traversal</strong>
        The adaptive algorithm performs a topological DFS scan on target node prerequisites. If any prerequisite has <span style="font-family: monospace;">status !== 'mastered'</span>, it flags a <strong>Root Gap</strong> and routes learners to foundational bridge modules (e.g. C2 LCM before C4 Addition).
      </div>
      <div class="legend-box">
        <strong>3. Socratic Scaffolding & Realtime Telemetry</strong>
        When learners struggle, the Socratic AI Companion provides hints with Indian cultural analogies (rotis, dosas, cricket), refusing to reveal answers. Re-evaluation updates the Teacher Copilot matrix live via PostgreSQL CDC WebSocket.
      </div>
    </div>

    <div class="footer-bar">
      <span>SHIKSHAIQ ENTERPRISE TECHNICAL DOCUMENTATION &bull; SYSTEM WORKFLOW &bull; CONFIDENTIAL</span>
      <span>PAGE 3 OF 3</span>
    </div>
  </div>

</body>
</html>
`;

async function generateMasterPDF() {
  console.log("Launching headless browser for master architecture & workflow PDF...");
  const browser = await chromium.launch({
    headless: true,
    executablePath: "/usr/bin/google-chrome",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  await page.setContent(htmlContent, { waitUntil: "networkidle" });

  console.log("Generating 3-Page Landscape A4 Architectural Master PDF...");
  await page.pdf({
    path: OUTPUT_PDF_DOCS,
    format: "A4",
    landscape: true,
    printBackground: true,
    margin: {
      top: "6mm",
      bottom: "6mm",
      left: "8mm",
      right: "8mm",
    },
  });

  // Copy to root and public directories for universal accessibility
  fs.copyFileSync(OUTPUT_PDF_DOCS, OUTPUT_PDF_ROOT);
  fs.copyFileSync(OUTPUT_PDF_DOCS, OUTPUT_PDF_PUBLIC);

  await browser.close();
  console.log(`✓ Generated: ${OUTPUT_PDF_DOCS}`);
  console.log(`✓ Copied to: ${OUTPUT_PDF_ROOT}`);
  console.log(`✓ Copied to: ${OUTPUT_PDF_PUBLIC}`);
}

generateMasterPDF().catch(console.error);
