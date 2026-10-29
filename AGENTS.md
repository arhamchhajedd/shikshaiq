<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Design & UI System Rule: White & Black Minimal Apple-Like Aesthetic

- **Design Philosophy:** Clean, ultra-minimal, high-contrast, Apple-inspired interface across the entire website.
- **Color Palette:**
  - Backgrounds: Pure white (`#ffffff`) and subtle light neutral surfaces (`#fbfbfd`, `#f5f5f7`, `#f9fafb`).
  - Text & Elements: Deep jet black (`#000000`, `#111827`, `#1d1d1f`) for crisp, high-contrast typography; refined neutral grays (`#6b7280`, `#86868b`) for secondary copy and labels.
  - Borders & Dividers: Crisp hairline borders (`#e5e7eb`, `#ebebf0`, `border-black/5` to `border-black/10`).
  - Actions & Buttons: Minimalist solid black pills/rounded buttons (`bg-black text-white hover:bg-neutral-800 active:scale-[0.98]`), sleek white secondary buttons (`bg-white text-black border border-black/10 hover:bg-neutral-50`).
  - Status Indicators: Minimalist, refined micro-badges (emerald for Mastered, amber for Developing, rose/red for Root Gap) on crisp white/light gray backgrounds.
- **Typography & Layout:**
  - Clean sans-serif typography with tight tracking (`tracking-tight`), generous padding and whitespace, rounded cards (`rounded-2xl` / `rounded-3xl`), delicate Apple-like box shadows (`shadow-sm`, `shadow-[0_4px_20px_rgba(0,0,0,0.04)]`).
  - No loud multi-color gradients, neon glows, or heavy dark-mode gamer palettes.
- **Branding:**
  - Consistent ShikshaIQ wordmark in sleek, bold minimal typography with high-contrast monochrome badge.

## Code Quality Rule: Always Top-Tier

- Code quality must always be the highest achievable. Never ship hacks, dead code, or half-finished work.
- **TypeScript:** `strict` mode always. No `any`, no unjustified `@ts-ignore`/`@ts-expect-error`, no unchecked type assertions. Validate external data at runtime (e.g. with Zod) and infer types from schemas.
- **Architecture:** Small, single-responsibility modules and components. Business logic lives in `lib/` (framework-independent, unit-testable), never inside React components. No duplicated logic; extract reusable code.
- **Naming & style:** Descriptive names, consistent conventions, no magic numbers or strings (use named constants), early returns over deep nesting.
- **Lint & format:** `npm run lint` must pass with **0 errors and 0 warnings**. Remove unused imports, variables, and files.
- **Testing:** Add unit tests for all business logic (mastery engine, recommendations, validation). Fix failing tests rather than weakening them.
- **Error handling:** Handle loading, empty, and error states explicitly. Never swallow errors silently; show safe, user-friendly messages.
- **Accessibility & performance:** Semantic HTML, labelled controls, visible focus, keyboard support, reduced-motion support, and AA contrast. Prefer Server Components, avoid unnecessary client JS, optimize images/fonts, and avoid needless re-renders.
- **Dependencies:** Add only what is necessary; prefer maintained, well-known packages; keep them updated and audited.
- **Definition of done:** `npm run lint`, `npx tsc --noEmit`, tests, and `npm run build` all pass before work is reported complete. Never claim a check passed unless it was actually run.

## Security Rule: Secure by Default, Prevent All Known Vulnerabilities

Security is a hard requirement on every change. Follow OWASP Top 10 and OWASP ASVS principles.

- **Secrets:** Never commit or hard-code secrets. Keep `.env*` files out of git (maintain `.env.example` with placeholders only). Server-only secrets (service-role keys, LLM API keys) must never be prefixed `NEXT_PUBLIC_` or imported into client code. Use `import "server-only"` in server-only modules.
- **AuthN/AuthZ:** Use Supabase Auth with server-side sessions in HTTP-only, Secure, SameSite cookies. Verify the user on the server (`getUser()`) for every protected route, Server Action, and API route. Never trust client-submitted roles, user IDs, scores, or mastery values; derive them server-side.
- **Database:** Enable Row Level Security on every table with least-privilege policies. Use parameterized queries / the Supabase client only (no string-built SQL). Never use the service-role key for user-initiated requests. Never run destructive migrations without explicit approval.
- **Input validation:** Validate and sanitize all input (body, params, query, headers, cookies) on the server with strict schemas. Enforce size/length limits and allow-lists.
- **Injection & XSS:** Never use `dangerouslySetInnerHTML` with untrusted data. Escape/sanitize all rendered user and LLM output. Never use `eval`/`new Function`. Prevent SQL, NoSQL, command, header, and prompt injection.
- **CSRF & request integrity:** Use Server Actions or same-site protections; verify `Origin`/`Host` for state-changing API routes; no state changes via GET.
- **Security headers:** Configure in `next.config.ts`: strict Content-Security-Policy (nonce-based where possible), `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `X-Frame-Options`/`frame-ancestors`, `Referrer-Policy`, `Permissions-Policy`, and disable `X-Powered-By`.
- **Rate limiting & abuse:** Rate-limit auth, assessment-submission, and AI tutor endpoints. Cap LLM input/output size and cost per user.
- **AI/LLM safety:** LLM calls are server-side only. Treat all LLM output as untrusted text. The LLM must never decide mastery, change roles, or override adaptive rules. Defend against prompt injection (separate system instructions from user content, never pass secrets or other students' data into prompts).
- **Privacy of minors:** Collect only the minimum data needed. No third-party trackers. Never log PII, passwords, tokens, or full request bodies. Return generic error messages to clients and log details server-side only.
- **Dependencies & supply chain:** Run `npm audit` regularly and fix high/critical issues. Commit the lockfile. Avoid abandoned or unnecessary packages.
- **Open redirects & links:** Validate redirect targets against an allow-list; use `rel="noopener noreferrer"` on external links.
- **Files & uploads:** If ever added, validate type/size/content, store outside the web root, and never trust client filenames or MIME types.
- **Security review:** Before completing any feature, review it for the above and document residual risks in `docs/SECURITY.md`.

## Documentation Rule: Always Documented Properly

- Documentation is part of the work, not an afterthought. Update docs in the same change as the code.
- Maintain these files and keep them accurate:
  - `docs/SHIKSHAIQ_CONTEXT.md` — product and architecture context.
  - `docs/SHIKSHAIQ_PHASES.md` — phased checklist and completion status.
  - `docs/SECURITY.md` — threat model, security controls, headers, RLS policy summary, known risks.
  - `docs/DECISIONS.md` — short Architecture Decision Records (what, why, alternatives).
  - `README.md` — setup, environment variables, scripts, project structure, deployment (Vercel), and troubleshooting.
  - `.env.example` — every required variable with description and no real values.
- Add TSDoc comments to exported functions, types, and non-obvious logic explaining *why*, not just *what*. Preserve existing comments unrelated to your change.
- Document every database table, RLS policy, API route (inputs, outputs, auth, errors), and adaptive-engine rule/threshold.
- Keep a `CHANGELOG.md` of notable changes per phase.

## Workflow & Honesty Rule

- Inspect existing code and docs first; preserve working code; implement only the requested phase.
- Never fabricate functionality, test results, statistics, testimonials, or partnerships. Demo data must be clearly labelled as demo.
- No dead buttons: every visible action must work or lead to a valid route.
- Never perform destructive operations (data deletion, force-push, dropping tables) without explicit user authorization.
- Report accurately: list changed files, checks actually run, failures, and any manual configuration still required.
