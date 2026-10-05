# VitrOS design review package

Review the implemented calm lab workspace in the [screenshot gallery](review.html), then use the linked evidence for behavior and layout checks. Captures use synthetic lab records on a local server. They are not production screenshots or evidence of real device connectivity.

## Verification status

- **Confirmed:** 51 tests across 7 files pass; TypeScript and the production build pass.
- **Browser checks passed:** 37 workspace contexts and 13 public/account contexts at six widths; no page-level overflow or browser page errors. Twelve interaction, eight bench and five media-pour checks pass. Thirty dark viewport checks and eight core text contrast pairs pass (lowest ratio 4.58:1).
- **Changed-file lint passed:** application changes and verification scripts have zero warnings. Repository-wide lint still reports 6 errors and 15 warnings in unchanged seed, API and legacy component files; that pre-existing gate is not green.
- **PDF fixtures:** vessel and activity reports passed the targeted rendering/coordinate checks documented in [PDF verification](pdf-verification.md).

The [implementation plan](../superpowers/plans/2026-10-05-vitros-design-system.md) records the completed workstreams. The [original audit](../superpowers/plans/design-audit.md) describes the earlier baseline, not the current implementation.

## Evidence

| Evidence | Scope |
|---|---|
| [Product browser results](local-smoke.json) | Workspace routes, viewport dimensions, page errors and selected failure checks |
| [Public browser results](public-smoke.json) | Marketing, account and system pages, including unavailable blog content |
| [Interaction regressions](interaction-regressions.json) | Selection, report type, scanner failure, partial retry, sidebar and billing navigation |
| [Bench regressions](bench-regressions.json) / [pour regressions](pour-regressions.json) | Unicode QR recovery, partial create/multiply/pour retries and setup failure preservation |
| [Theme checks](theme-smoke.json) | Representative dark views and computed core text contrast |
| [PDF verification](pdf-verification.md) / [coordinate results](pdf-layout-verification.json) | Long vessel rows, long activity rows and multipage notes |
| [Screenshots](screenshots/) / [PDF contact sheet](pdf-report-contact-sheet.png) | Visual review of rendered local fixtures |
| [Lint log](lint.txt) | Changed-file lint result |

Browser checks cover widths of 320, 375, 414, 768, 1280 and 1440px. Dark checks use representative routes at 375, 768 and 1440px. These are scoped automated checks, not an exhaustive accessibility certification or a test of every account/record combination.

## Reproduce

Run from the repository root with the branch's dependencies installed. Browser scripts require Playwright and its Chromium browser. Use a local environment; no production `.env` file is required for these intercepted fixtures.

```sh
npm test
npx tsc --noEmit --pretty false
npm run build
npm run lint # Reports the existing unrelated repository-wide findings noted above.
```

Start the local application in one terminal:

```sh
npm run dev -- --hostname 127.0.0.1 --port 3100
```

Run the fixture checks in another:

```sh
node scripts/design-smoke.cjs
node scripts/design-public-smoke.cjs
node scripts/design-interactions.cjs
node scripts/design-bench-regressions.cjs
node scripts/design-theme-smoke.cjs
node scripts/design-pour-regressions.cjs
```

The harness defaults to `http://127.0.0.1:3100`; `DESIGN_BASE_URL` can select another localhost port. It rejects non-local hosts. Browser API requests are fulfilled with fixtures, including a synthetic session and explicit failures. This validates the rendered interface and client behavior; it does not validate authentication, database mutations, billing checkout, operational email delivery or external integrations.

For report layout, with Poppler's `pdftotext` available:

```sh
node docs/design-verification/render-pdf-fixtures.mjs
python3 docs/design-verification/verify-pdf-layout.py
```

## Remaining real-world acceptance

- Pair each supported USB/Bluetooth scanner in keyboard mode with an Enter suffix; scan an existing label and verify the expected vessel opens. Test camera permission denial and recovery on a bench phone.
- Print a test label at actual size on the intended printer/media. Check margins and scan both QR and Code128 output before printing a batch. A print dialog or downloaded label does not prove a successful print.
- Complete scan → inspect → multiply/transfer → label with a technician, and urgent work → scoped report with a manager. Record practical friction and check long names, large counts, failed saves and partial results.
- Production and Contamination PDF pagination, arbitrary font scripts and physical printed output remain outside the targeted Vessel/Activity PDF fixture verification.

Report CSV and PDF endpoints retain their existing scope differences and limits, which are now disclosed in the UI. No production deployment is included in this review package.
