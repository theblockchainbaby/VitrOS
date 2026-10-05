# VitrOS design system implementation plan

Goal: implement the approved calm lab workspace across all customer-facing route families and repair the interface defects recorded in design-audit.md.

Architecture: retain Next.js routes and existing API contracts. Establish shared neutral/forest tokens, semantic workspace navigation, responsive page controls and consistent async states. Apply these foundations to collections, records, bench workflows, analysis, settings and acquisition. No production credentials, database writes or deployment are needed to review this branch.

Tech stack: Next.js 16, React 19, Tailwind 4, Radix, Recharts, Vitest and isolated Playwright browser verification.

## Workstreams and ownership

- [x] Foundation (root): globals.css, app-layout, app-sidebar, page-header, ui components, status-badge, dashboard, tasks, shared chart/status utilities. Persistent mobile navigation, explicit shell boundaries, truthful loading, action-first dashboard.
- [x] Operational workflows (lab agent): vessels, scan, labels, batch, multiply, cultivars, clone-lines, media, inventory, locations, protocols, lineage and their dedicated components. Fix selection and preserve partial failures. Preserve scan/print contracts.
- [x] Analysis/setup (analysis agent): analytics, forecast, demand, team-performance, reports, environment, notifications, activity, integrations, import, admin, onboarding, assistant and PDF templates. Correct scope/units, responsive controls and honest save/error states.
- [x] Acquisition (brand agent): landing page, public routes, auth/recovery, blog, offline/unsubscribe, email presentation. Shared public/auth components, supported claims, responsive navigation and plan context. Preserve email dispatch guards.
- [x] Verification/integration (root): focused behavior regressions, typecheck, production build, browser desktop/mobile/light/dark checks, keyboard and load/partial failure checks, independent review.

## Acceptance

All existing customer routes remain available. No root overflow hiding, fake data in production UI, auth bypass, speculative device connectivity or operational-email enablement. Public/auth pages do not mount workspace onboarding. Every workspace route has accessible mobile navigation. Tasks failures never report healthy. Label selection toggles once. Report quick actions use the requested report type. Partial batch failures retain retryable rows. The documented physical-device acceptance remains required before claiming hardware compatibility.

## Baseline

Base 4daef6f. Original app workspace and its .env.example edit are untouched. Existing test suite: 6 passed / 10 failed due to stale mocks; investigate and update mocks against real route contracts as part of regression verification. New worktree uses the existing dependency install; no production .env files copied.

## Completion evidence

Implementation is complete across the four workstreams above. See the [review package](../../design-verification/README.md) and [screenshot gallery](../../design-verification/review.html) for representative local captures and reproduction commands.

- [x] 51 tests across 7 files pass, including forecast percentages/counts, failed CSV alias recovery, selection and notification regressions.
- [x] TypeScript and the production build pass.
- [x] Independent review follow-ups implemented: pending forms lock against lost edits; onboarding drafts are account-scoped; assistant retries preserve new drafts; partial import/bench queues remain recoverable.
- [x] Vessel/Activity PDF fixtures rendered and inspected, including long rows and multipage notes. [Evidence](../../design-verification/pdf-verification.md).
- [x] Final product/public browser sweep: 50 contexts at six widths, no page overflow or page errors; 12 interaction, 8 bench and 5 pour checks pass; 30 dark viewport checks and 8 contrast pairs pass. Changed-file lint is clean. Repository-wide lint has 6 errors / 15 warnings in unchanged files.
- [ ] Physical scanner/printer and representative technician/manager workflow acceptance. Browser fixture checks do not establish hardware compatibility.

All browser captures use local intercepted fixtures. No production credentials were copied, and this review did not deploy the branch. CSV/PDF endpoint scope differences are preserved and disclosed. The targeted PDF check does not cover Production/Contamination pagination or physical output.
