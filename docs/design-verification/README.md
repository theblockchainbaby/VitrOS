# VitrOS design review package

Review the implemented calm lab workspace in the [screenshot gallery](review.html), then use the linked evidence for behavior and layout checks. Captures use synthetic lab records on a local server. They are not production screenshots or evidence of real device connectivity.

## Current imagery and SEO release verification

The current local release checks on 2026-10-05 confirm:

- **Automated tests and build:** 64 tests across 9 files pass; the production build passes.
- **Public browser checks:** 81 checks pass with no page-level overflow, failed checks, or browser page errors. All 12 interaction checks pass.
- **SEO release checks:** 13 checks pass, covering the six public pages, account/system indexing directives, the unavailable-article state, and preservation of the authenticated dashboard. Both `/sitemap.xml` and `/robots.txt` return HTTP 200. See [release evidence](../seo/release-verification.json) and the [SEO package](../seo/README.md).
- **Changed-file lint:** changed source files and verification scripts pass ESLint with zero warnings. Repository-wide lint still has the previously recorded 6 errors and 15 warnings in unchanged seed, API and legacy component files; that pre-existing gate is not green.
- **Approved imagery:** product screenshots show synthetic demonstration data. The two new photo illustrations are AI-generated and disclosed in the interface. The capture script and original prompts are documented in [imagery provenance](../seo/imagery-provenance.md).

These results verify a local release candidate. Production deployment is not established by this package and requires a separate live check.

## Earlier design verification

The original design pass also verified TypeScript, 37 workspace contexts and 13 public/account contexts at six widths, eight bench checks, and five media-pour checks. Thirty dark viewport checks and eight core text contrast pairs passed (lowest ratio 4.58:1). Vessel and activity report fixtures passed the targeted rendering/coordinate checks documented in [PDF verification](pdf-verification.md).

Those workspace, bench, theme, and PDF artifacts document the earlier design pass; they were not all rerun for the imagery and SEO release. The current public-browser and interaction results above supersede their earlier runs. The gallery includes historical design captures as well as refreshed public-page captures.

The [implementation plan](../superpowers/plans/2026-10-05-vitros-design-system.md) records the completed workstreams. The [original audit](../superpowers/plans/design-audit.md) describes the earlier baseline, not the current implementation.

## Evidence

| Evidence | Scope |
|---|---|
| [Public browser results](public-smoke.json) | Current: 81 marketing, account and system checks, including unavailable blog content |
| [Interaction regressions](interaction-regressions.json) | Current: 12 selection, report type, scanner failure, partial retry, sidebar and billing checks |
| [SEO release results](../seo/release-verification.json) | Current: metadata, canonical URLs, robots directives, structured data, sitemap and dashboard preservation |
| [Imagery provenance](../seo/imagery-provenance.md) | Current: approved product screenshots, AI illustrations, source prompts and regeneration instructions |
| [Product browser results](local-smoke.json) | Earlier design pass: workspace routes, viewport dimensions, page errors and selected failure checks |
| [Bench regressions](bench-regressions.json) / [pour regressions](pour-regressions.json) | Earlier design pass: Unicode QR recovery, partial create/multiply/pour retries and setup failure preservation |
| [Theme checks](theme-smoke.json) | Earlier design pass: representative dark views and computed core text contrast |
| [PDF verification](pdf-verification.md) / [coordinate results](pdf-layout-verification.json) | Earlier design pass: long vessel rows, long activity rows and multipage notes |
| [Screenshots](screenshots/) / [PDF contact sheet](pdf-report-contact-sheet.png) | Local fixture captures; the gallery also contains earlier design evidence |
| [Lint log](lint.txt) | Current changed-file lint result |

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
node scripts/seo-release-check.cjs
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

Report CSV and PDF endpoints retain their existing scope differences and limits, which are now disclosed in the UI. Local verification does not confirm production deployment.
