<!-- Hallmark · pre-emit critique: P5 H5 E4 S5 R5 V4 -->
# VitrOS design review

October 5, 2026 · Product, brand, and workflow design

> **Historical baseline:** this is the original audit, retained as the implementation brief. Its screenshots, interactive proposal and JSON attachments live in the original workspace package, `research/VitrOS_Design_Review_20261005`, outside this Git worktree. Unbundled attachments below are identified by filename rather than broken relative links. For the implemented branch and current verification status, use the [review package](../../design-verification/README.md).

**VitrOS has the functional breadth of a serious product, but the experience does not yet feel designed as one system.** The biggest opportunity is consistent hierarchy and behavior across the whole journey: website → account → setup → daily work → reports. Changing colors alone will leave the main problems intact.

I recommend a **calm, precise lab workspace**: warm neutral surfaces, restrained forest-green actions, legible typography, compact records, and clear exceptions. Use larger controls and a focused queue at the bench. Keep the botanical identity and domain specificity. Make the actual product the strongest evidence on the website.

Open the interactive visual proposal (`design-direction.html`, original audit package). It contains three representative screens—Today, Vessels, and Scan—plus the rationale. Search, filters, record previews, and sample barcode lookup work locally. All records and metrics are illustrative; the proposal is not connected to production. It is a design direction, not a completed implementation.

## What was reviewed

- Indexed all **50 page entry files** and reviewed the route families in the coverage matrix below, plus shared layout, navigation, tokens, controls, email templates and PDF styles.
- Captured **24 screen contexts** at 1440px desktop and 375px mobile: seven public/account contexts and seventeen authenticated demo contexts. Home is represented both signed out and signed in. Detail screens and other states received source review, not exhaustive live testing.
- Used the publicly advertised demo account. Application write requests were blocked. Logging in itself updates the demo account's normal login metadata; no culture, order, inventory, billing or user records were edited.
- Reproduced selection, export, and failed-loading issues in the browser. Export data and failed requests were intercepted locally; no production failure was induced.
- Source baseline: `63cd417`. During the audit, `main` advanced to redeploy-only `4daef6f`, with no source diff from that baseline. The existing `.env.example` change was left alone.
- The live review used light product mode and the homepage's default dark mode. This is not a full contrast certification, hardware test, or exhaustive dark-mode audit. Physical scanner/printer validation remains a separate acceptance step.

The visual proposal passed 29 viewport checks across its four views and the report, including 320, 375, 414 and 768px. Search, filter reset, record preview/focus return, sample lookup and recoverable no-match behavior passed isolated browser checks. See proposal verification (`proposal-verification.json`, original audit package).

Evidence files: public screens (`public-screen-evidence.json`, original audit package), product screens (`product-screen-evidence.json`, original audit package), interaction checks (`interaction-evidence.json`, original audit package), and the linked screenshots.

## The most important changes

The priorities below describe design and usability impact, not security severity.

| Priority | Finding | Evidence | What I would do |
|---|---|---|---|
| P1 | The brand changes between pages | Homepage has its own tokens, fonts and dark-theme preference; secondary marketing pages and product use a separate global system. | One brand foundation, shared public navigation/footer, consistent typography and action styles. Light/dark variants should feel related. |
| P1 | Public/account pages get the wrong shell | Live `/forgot-password` and `/blog` show the logged-out app sidebar and Welcome modal. Billing has no visible mobile sidebar control. | Explicit public, auth and workspace layouts. Put navigation controls in the persistent workspace shell. |
| P1 | Several real mobile screens overflow | At a 375px viewport: dashboard 587px document width; vessels 433px; analytics 415px; demand planning 612px; team performance 811px. Public demo is 405px. | Fix intrinsic grid widths, chart containment and responsive toolbars. Keep horizontal scrolling inside intentional data-table regions. Do not hide inaccessible controls with root clipping. |
| P1 | Important interface states are misleading | A locally failed Tasks load displays “All Clear” and 0% contamination. Labels checkbox remains unchecked after a click. Activity Log quick download requests vessel data. | Repair these interaction contracts first. A polished surface must tell the truth about loading, selection and results. |
| P1 | Page hierarchy does not follow the work | Six equally prominent dashboard KPIs and several chart rows precede the working queue. Vessel actions follow a full SOP; planning actions follow two charts. | Lead with identity, exceptions and the next action. Put deeper analysis, protocol detail and secondary tools behind predictable navigation. |
| P2 | Cards, padding and badges compete for attention | Spacious nested cards surround ordinary filters. Healthy records repeatedly use saturated green; stage, status and health badges all compete. | Use flat toolbars and bordered sections where appropriate; one clear primary action; quiet routine states, prominent exceptions. |
| P2 | Related screens use different interaction patterns | Record pages are narrow stacks; collections vary; Team/Billing add extra padding; operation forms reset differently. | Standardize Collection, Record, Workbench, Analysis, Settings and Setup templates. |
| P2 | Navigation feels like a feature directory | 24 destinations; CSV Import is primary navigation, Labels under Admin, Protocols under Intelligence. Some groups are pointer-only disclosures. | Organize around Today/Scan, Cultures, Lab Operations, Planning & Insights, Settings. Keep import/export beside the relevant records. Preserve route functionality while reorganizing access. |
| P2 | Color and metric meanings drift | “Stable” changes color between vessel badges, cultivar detail and analytics. Stage charts use different palettes. Export scope and percentages are not consistently explained. | Shared status maps, chart tokens, units, time scopes and explicit zero/no-data states. Keep text labels as well as color. |
| P2 | Onboarding and integrations do not explain readiness | Onboarding progress is unnamed and not resumable; API documentation dominates Integrations; scanning and label device setup have no unified journey. | Named setup steps, editable progress, explicit connection states and a short test workflow. Distinguish device recognition, lookup success and successful label printing. |
| P2 | Marketing proof needs stronger presentation | Static product demos are labelled Live, performance figures lack adjacent substantiation, service status is hardcoded, and “last 30 days” contains May/June releases. | Label demonstration data, substantiate measured claims, link real status if available, and publish maintained customer-facing release notes. |
| P2 | Accessibility and small-screen finishing are incomplete | Clickable div disclosures, unnamed bell, inconsistent table-row links, weak sidebar secondary text, variable form/error conventions. | Semantic controls, keyboard paths, surface-specific contrast tokens, stable feedback and touch-sized bench actions. |

The existing foundations are worth keeping: shared React/Radix controls, Lucide icons, tokenized themes, Geist/Geist Mono assets, working desktop tables, vessel identity and lineage, and real lab-specific workflows. This is a system refinement, not a reason to rebuild the application.

## What to borrow from strong SaaS brands

These are transferable practices observed on official public sources. They are not claims about conversion uplift, and the authenticated products were not benchmarked hands-on.

| Reference | Practice worth borrowing | VitrOS application |
|---|---|---|
| [Linear](https://linear.app/) and its [brand guidance](https://linear.app/brand) | Product workflows are central to the public story; identity usage is documented. | Show actual vessel, lineage and scanning experiences. Define logo variants, type, spacing and component rules once. |
| [Linear pricing](https://linear.app/pricing) | Explicit plan limits, billing basis and comparison. | Keep vessel/user limits visible, carry selected plan and interval into signup, and explain the immediate next step. |
| [Stripe](https://stripe.com/nz) | Customer proof is tied to named organizations and linked stories; reliability claims have supporting context. | Publish one credible lab case study with a measured workflow result instead of repeating an unsourced percentage. |
| [Vercel signup](https://vercel.com/signup) | Focused entry task, clear hierarchy and trust context. | One coherent auth shell with a clear heading, home path, trial context and accessible feedback. Social login is a separate product decision. |
| [Benchling](https://www.benchling.com/) and [demo request](https://www.benchling.com/request-demo) | Scientific workflows and implementation context support the product story. | Explain how a real tissue-culture lab gets running, imports its data and trains technicians. Keep VitrOS's narrower domain focus. |

My recommendation combines that discipline with VitrOS's own identity. Copying another company's gradients, typography or navigation verbatim would not solve the workflow problems.

## Three possible directions

| Direction | Character | Tradeoff |
|---|---|---|
| **Calm lab workspace — recommended** | Neutral surfaces, deep green actions, quiet data, strong task hierarchy. Product-led website using the same system. | Requires disciplined consistency across ordinary screens and error states; fewer decorative opportunities. |
| Technical dark | Dark surfaces and brighter signals, closer to the current homepage. | Distinctive marketing presence, but long tables and brightly lit bench use need a carefully designed light counterpart. |
| Bright scientific | More white space, softer colors, larger explanatory illustrations. | Approachable onboarding and marketing; can become inefficient for experienced technicians and dense production work. |

The proposal uses the first direction. It retains the existing logo mark and uses the already available Geist family. It does not introduce a new logo or claim to finish the brand identity.

## Design system I would establish

**Typography.** Explicitly apply the chosen sans family throughout the product. The live body's computed font currently resolves to the system sans stack despite Geist assets being loaded; the homepage uses its own font declarations. Use approximately 28–32px page headings, 16px section titles, 14px working text, and 12px secondary text. Keep important labels out of 9–10px microtype. Use tabular numerals for quantities and a mono face for barcodes, not whole paragraphs.

**Surfaces and spacing.** One neutral canvas, one raised surface, one soft selected surface. A 4px spacing scale, normally 24–32px page gutters on desktop and 16px on phones. Use 6–8px control radii and 8–12px panels. Borders should group related content; shadows should signal elevation, not decorate every box.

**Color.** Green communicates primary action and successful/healthy status; amber means attention; red means critical or destructive. Keep lifecycle categories quieter and consistent. Do not use three saturated pills to describe every healthy vessel. Add sidebar-specific muted text rather than placing page-muted text on a dark surface.

**Two densities.** Desk mode supports readable tables, stable alignment and compact filters. Bench mode uses at least 44px practical touch targets for primary controls, a prominent scan field, minimal competing actions and a persistent working queue. Do not simply shrink the desk layout.

**Navigation.** Keep the workspace identity and mobile navigation available on every app route. Make current location obvious. Retain useful shortcuts and provide genuine links for records. Add a command/search interface only after deciding what it can reliably search; avoid a decorative nonfunctional command bar.

**States.** Standardize initial loading, refreshing, empty, filtered-empty, unavailable, saving, partial success and completed states. Keep entered/scanned work after failure. Successful provider submission, completed operation and real-world delivery are different events and should be labelled accurately.

**Motion.** Use short transitions for state changes and disclosure. Avoid animated numbers, moving borders and decorative particles in the operational workspace. Respect reduced motion.

## Full product coverage and proposed treatment

“Rendered” means desktop/mobile live demo review; “source” means implementation review without a complete live walkthrough. Families can contain both.

| Surface | Coverage | Proposed treatment |
|---|---|---|
| Homepage | Rendered + source | Actual product evidence, clearer lab outcomes, supported proof, maintained releases; simplify future-vertical messaging. |
| Features / Why VitrOS | Features rendered; both source | Organize around log → investigate → plan workflows; replace repeated generic icon inventories with relevant screenshots. |
| Pricing / Demo | Rendered + source | Consistent navigation; transparent plan/trial context; direct explore-demo and guided-demo paths. |
| Blog / articles | Listing rendered; article source | Correct public shell, featured operational guide, readable article typography and related resources. |
| Login / signup / recovery / reset | Login/recovery rendered; all source | One auth shell, clear heading, home link, accessible errors, password reveal and plan context where relevant. |
| Dashboard / daily tasks | Rendered + source | Today’s work and exceptions first; fewer headline metrics; analysis below or in a separate view; honest failures. |
| Vessel collection | Rendered + source | Compact filter toolbar, filter reset, explicit result/export scope, selection actions, responsive record list. |
| Vessel detail / lineage | Source | Identity/status/next action at top; Overview, History, Lineage and Protocol sections; stable related-record navigation. |
| Scan | Rendered + source | Dedicated bench workbench; distinguish lookup from save; preserve record/form during save; explicit scanner modes. |
| Single multiply / bulk create / bulk multiply / batch | Source | Shared queue → review → submit → results model; keep failed rows and offer retry. |
| Labels | Rendered + source | Selection first, live label preview, printer/paper settings, explicit print status; repair checkbox behavior. |
| Cultivars / clone lines / testing history | Lists rendered; details source | Connected collection/detail hierarchy; accessible card links; simpler metrics; clear testing and release state. |
| Media recipes / recipe detail / media batches | Media list rendered; all source | Recipe/batch relationships, quality and expiry emphasis; persistent pour workflow; mobile batch view. |
| Inventory / stock detail | List rendered; detail source | Stock, threshold and next action; clear restock/use interactions; scoped history; less prominent destructive actions. |
| Locations / location detail | List rendered; detail source | Navigable facility hierarchy, capacity with consistent units, related vessels and deliberate empty states. |
| Environment | Source | Freshness, sensor/source and location scope; separate series by location; distinguish no readings from failed loading. |
| Protocols | Source | Searchable stage-linked instructions, clear version/safety information, consistent detail drawer or page. |
| Notifications / activity | Source | Link alerts to affected records and next actions; show scope, read/dismiss state and history limits. |
| Analytics / forecasting | Analytics rendered; both source | Consistent tabs and scope controls; annotated assumptions/units; coherent charts with detail tables and empty states. |
| Demand planning | Rendered + source | Orders and scheduling actions before exploratory charts; responsive controls and consistent stage mapping. |
| Team performance | Rendered + source | Separate view tabs from time range; remove double padding; designed no-activity and individual-selection states. |
| Reports / PDF exports | Reports rendered; PDF source | One report chooser with type, period, scope and format; matching download action; branded readable exported tables. |
| Integrations / API keys | Rendered + source | Integration cards with configuration and readiness states; key management before dense docs; copyable examples and test feedback. |
| Import | Source | Upload → validate → review → results; preserve failed rows; disclose preview and export limits. |
| Settings / users / billing | Rendered + source | Separate workspace, team, personal and billing settings; persistent shell; explicit save/retry and billing state. |
| Onboarding | Source | Named resumable steps; review/edit before completion; setup checklist covering data, team, scanner and label printer. |
| Assistant | Source | Familiar conversation layout, useful source/record links, readable responses and retry; hide internal tool identifiers. |
| Offline / unsubscribe / system states | Source | Consistent status-page shell and truthful recovery guidance. Unsubscribe currently has a separate hardcoded navy identity. |
| Transactional email / printed labels | Source | Shared wordmark, heading/spacing and CTA rules for email; prioritize contrast, scanability, dimensions and essential metadata on labels. Preserve barcode/QR integrity. |
| Studio / content management | Route indexed | Treat vendor CMS as an internal editorial tool; keep customer-facing navigation and branding changes out of its internals. |

## Confirmed interaction defects to fix alongside design

These are small behavioral repairs that support the design work. They are separate from any wider backend roadmap.

1. **Labels checkbox double-toggles.** On the live demo, clicking the first unchecked checkbox leaves it unchecked and the count at zero. Both the row click and checkbox change call the selection toggle. [Source](https://github.com/theblockchainbaby/VitrOS/blob/63cd417/src/app/labels/page.tsx#L349).
2. **Activity Log CSV can request vessel data.** Starting from the default report selection, clicking the Activity Log quick CSV action requested `/api/vessels?limit=10000` in the isolated browser check. The handler sets state and immediately calls a generator reading the previous state. Pass the intended report type directly. [Source](https://github.com/theblockchainbaby/VitrOS/blob/63cd417/src/app/reports/page.tsx#L178).
3. **Failed Tasks loading becomes “All Clear.”** Locally aborting `/api/stats` produced zero/default metrics and an All Clear message. Keep an explicit load failure and retry action; never infer health from unavailable data. [Load handling](https://github.com/theblockchainbaby/VitrOS/blob/63cd417/src/app/tasks/page.tsx#L45), [empty condition](https://github.com/theblockchainbaby/VitrOS/blob/63cd417/src/app/tasks/page.tsx#L317).
4. **Recovery and blog show onboarding chrome.** Observed signed out in a fresh browser: the app sidebar and Welcome dialog appear on password recovery and blog. Correct the layout boundary. [Source](https://github.com/theblockchainbaby/VitrOS/blob/63cd417/src/components/app-layout.tsx#L14).

Other source-supported follow-ups: bulk-operation failures clear working queues; clone-line list cards lack a detail link; billing loading failure can render a blank page; forecast loss-rate labels show fractional values despite a percentage label. These were not all reproduced end-to-end and should receive targeted checks during implementation.

## Recommended delivery sequence

| Batch | Deliverable | Completion criterion |
|---|---|---|
| 1. Foundation and trust | Fix shell assignments, persistent mobile navigation, confirmed interaction defects, font application, tokens and status semantics. | Public/auth/app shells are correct; mobile navigation always works; truthful load/result states; no regression to scan/print/auth. |
| 2. Reference workflows | Implement Today, Vessels, Scan and Labels using shared templates. | Agree on desktop and phone reference screens; scanning/selection/print/error flows work with realistic records. |
| 3. Repeated operational pages | Apply Collection/Record/Workbench patterns to cultivars, clone lines, media, inventory, locations, multiplication, batches and import. | Consistent identity, action placement, queue/result handling and record navigation. |
| 4. Analysis and administration | Analytics, forecasting, demand, team, reports, integrations, settings, assistant and setup. | Clear scope/units, responsive controls, consistent saving and failure states; setup checks accurately reflect hardware/integration status. |
| 5. Acquisition and finishing | Marketing, demo, pricing, auth, blog, emails and report/label outputs. | One identity across the journey; substantiated claims; clear next steps and accessible outputs. |
| 6. Cross-product verification | Light/dark, keyboard, phones/tablets, long content, empty/failed/partial/success states and real bench devices. | Acceptance checklist below passes with evidence. |

Start with shared patterns and reference screens so the rest of the redesign has a stable standard. Keep API contracts, tenant boundaries, quarantine rules and production data behavior outside visual refactoring except for explicitly scoped interface bug repairs. Stage the work on a reviewable branch and preview before production deployment.

## Acceptance checklist

- Check 320, 375, 414, 768, 1280 and 1440px; no page-level overflow, clipped primary actions or lost navigation.
- Test long cultivar names, long barcodes, large counts, missing values and real localized dates.
- Verify light and dark themes, selected/hover/focus/disabled controls and reduced motion.
- Use keyboard-only navigation through sidebar, filters, tables, dialogs and destructive-action confirmation. Ensure sensible focus return.
- Measure text/control contrast. Use practical 44px targets for bench controls; do not depend on color alone.
- Verify distinct initial loading, refresh, empty, no matches, partial data, network failure, submission failure and success states.
- Preserve scan queues and form data on recoverable failure. Confirm one user action produces one intended operation.
- Validate USB/Bluetooth keyboard-wedge scanners with Enter suffix, phone camera permission/recovery, browser printing and the supported Zebra path on real hardware. Design previews do not prove hardware compatibility.
- Confirm printed QR/Code128 scanability at actual sizes; report headings, periods, scopes, pagination and long rows remain readable.
- Have a technician complete scan → inspect → multiply/transfer → label without guidance, and a manager find urgent work and prepare a scoped report. Record completion problems rather than judging appearance alone.

## Evidence gallery

### The current product and proposed direction

Current dashboard, desktop (`screenshots/dashboard-app-desktop.png`, original audit package) · Current vessel list, desktop (`screenshots/vessels-app-desktop.png`, original audit package) · Current scan, phone (`screenshots/scan-app-mobile.png`, original audit package) · Interactive proposed direction (`design-direction.html`, original audit package)

### Reproduced issues

Recovery with welcome overlay (`screenshots/forgot-password-desktop.png`, original audit package) · Team performance phone overflow (`screenshots/team-performance-app-mobile.png`, original audit package) · Billing without mobile navigation (`screenshots/admin-billing-app-mobile.png`, original audit package) · Locally failed task load (`screenshots/tasks-failed-load.png`, original audit package)

### Public surfaces

Homepage (`screenshots/home-desktop.png`, original audit package) · Features (`screenshots/features-mobile.png`, original audit package) · Pricing (`screenshots/pricing-desktop.png`, original audit package) · Demo mobile (`screenshots/demo-mobile.png`, original audit package) · Login (`screenshots/login-desktop.png`, original audit package) · Blog (`screenshots/blog-desktop.png`, original audit package)

## Implementation evidence index

- [Global tokens](https://github.com/theblockchainbaby/VitrOS/blob/63cd417/src/app/globals.css#L50), [root font/theme setup](https://github.com/theblockchainbaby/VitrOS/blob/63cd417/src/app/layout.tsx#L102), [homepage's independent system](https://github.com/theblockchainbaby/VitrOS/blob/63cd417/src/components/landing-page.tsx#L11).
- [Shared page header](https://github.com/theblockchainbaby/VitrOS/blob/63cd417/src/components/page-header.tsx#L16), [sidebar grouping](https://github.com/theblockchainbaby/VitrOS/blob/63cd417/src/components/app-sidebar.tsx#L61), [sidebar disclosure](https://github.com/theblockchainbaby/VitrOS/blob/63cd417/src/components/app-sidebar.tsx#L171).
- [Dashboard order](https://github.com/theblockchainbaby/VitrOS/blob/63cd417/src/components/dashboard.tsx#L89), [vessel filters/actions](https://github.com/theblockchainbaby/VitrOS/blob/63cd417/src/app/vessels/page.tsx#L138), [team controls](https://github.com/theblockchainbaby/VitrOS/blob/63cd417/src/app/team-performance/page.tsx#L270).
- [Shared health badges](https://github.com/theblockchainbaby/VitrOS/blob/63cd417/src/components/status-badge.tsx#L13), [analytics chart colors](https://github.com/theblockchainbaby/VitrOS/blob/63cd417/src/app/analytics/page.tsx#L19).
- [Batch create results](https://github.com/theblockchainbaby/VitrOS/blob/63cd417/src/app/batch/create/page.tsx#L120), [batch multiply results](https://github.com/theblockchainbaby/VitrOS/blob/63cd417/src/app/batch/multiply/page.tsx#L191), [clone-line cards](https://github.com/theblockchainbaby/VitrOS/blob/63cd417/src/app/clone-lines/page.tsx#L314).
- [Homepage mobile navigation](https://github.com/theblockchainbaby/VitrOS/blob/63cd417/src/components/landing-page.tsx#L147), [fixed changelog](https://github.com/theblockchainbaby/VitrOS/blob/63cd417/src/components/landing-page.tsx#L1272), [hardcoded service status](https://github.com/theblockchainbaby/VitrOS/blob/63cd417/src/components/landing-page.tsx#L1362).
- [PDF styles](https://github.com/theblockchainbaby/VitrOS/blob/63cd417/src/lib/pdf-templates.tsx#L4), [email templates](https://github.com/theblockchainbaby/VitrOS/blob/63cd417/src/lib/email.ts#L66), [unsubscribe visual system](https://github.com/theblockchainbaby/VitrOS/blob/63cd417/src/app/unsubscribed/page.tsx#L18).

No application implementation or deployment was performed in this design pass. The report and concept are review artifacts, with source evidence and live observations separated throughout.

Hallmark design rubric: **5 critical · 7 major · 0 minor** across the twelve prioritized findings above. These labels describe design/usability impact, not security severity.
