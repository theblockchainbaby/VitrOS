# VitrOS keyword research and page plan

Research date: 2026-10-05. Market assumption: English-language plant tissue culture and micropropagation labs; no country-specific demand claim. Companion: [keyword mapping CSV](2026-10-05-keyword-map.csv).

## Recommendation

Make **plant tissue culture software** and **tissue culture lab management software** the homepage's main category language, with **micropropagation software** as a close secondary term. Support this with concrete vessel tracking, barcode labeling, subculture scheduling, lineage, media, and production workflows on `/features`. Keep pricing, demo, spreadsheet replacement, and educational intent on their existing dedicated pages.

This prioritization reflects product fit, purchasing intent, and the ability to improve existing pages. It does **not** indicate measured search volume, keyword difficulty, a current Google rank, or a promised traffic increase. Google explicitly says SEO does not guarantee first place or even inclusion in its index. [Google SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide)

## Method and evidence limits

- Reviewed the June 8 competitive brief and the public-page source in `src/app` and `src/components/landing-page.tsx` without editing application code.
- Ran live web searches on October 5 and opened official vendor pages. Search results show which terminology and types of pages are discoverable; their ordering is not a controlled Google ranking test. Location, device, and personalization were not controlled.
- Search Console and DataForSEO were not connected. Monthly volume, difficulty, CPC, clicks, impressions, CTR, and average position remain **not measured**, including for apparent long-tail phrases. No paid API was used.
- Vendor pages verify what a vendor publicly describes, not independent product performance. VitrOS source establishes copy and feature context, not a completed functional audit.
- The retrieved [VitrOS blog](https://www.vitroslabs.com/blog) displayed no posts. Proposed guide URLs below are content plans, not pages verified as published. Inspect the CMS again before creating any slug.

Searches included `"plant tissue culture" software lab management`, `micropropagation software`, `"plant propagation software"`, `"tissue culture" "LIMS" software`, `"tissue culture software" pricing`, `"tissue culture" "subculture" "tracking software"`, `"tissue culture" barcode labels software vessel tracking`, `"tissue culture" spreadsheet software alternative`, `"tissue culture" "contamination tracking" software`, `"plant tissue culture" "media" management software`, and `"Lab Planner" tissue culture software`.

## What the current market establishes

| Official source checked | Verified public positioning | Implication for VitrOS, an inference |
| --- | --- | --- |
| [IVS laboratory software](https://www.invitrosoft.com/laboratory.html) | Plant production software with micropropagation stages, barcode traceability, media records, and planning; distinguishes its scope from analytical LIMS. | Use both tissue culture and micropropagation language. Explain production workflows before claiming a generic LIMS category. |
| [MeristemLab](https://meristemlab.com/) and [pricing](https://meristemlab.com/pricing) | Production records, labels, subculture timing, and spreadsheet migration. Public plans: free Solo and A$49, A$159, A$375 monthly, including GST; early-access conditions also appear. | Pricing transparency and a free entry path are no longer unique positioning. Compare scope, limits, support, and deployment with dated evidence. |
| [TissueCulture Pro](https://tissueculturepro.com/) and [pricing](https://tissueculturepro.com/pricing/) | Plant lab management with self-hosting, perpetual licensing, public prices, and a 30-day trial. | Cloud versus customer-managed hosting is a useful buyer decision. Do not claim VitrOS is the only transparent-price option. |
| [TissueCulture Pro tracking solution](https://tissueculturepro.com/solutions/plant-tissue-culture-tracking-software/) | Dedicated page connects culture records, mother plants, stages, and subculture history. | Show the complete record workflow with VitrOS screenshots. A list of generic features is insufficient differentiation. |
| [PAT tissue culture software](https://pat-horticulture.com/laboratory-tissue-culture/) | Horticulture ERP covering media recipes, workstation actions, vessel records, and greenhouse handoff. | Broad plant propagation queries may imply ERP and greenhouse operations outside the current lab-focused scope. |
| [TCTrak](https://www.2ndsightbio.com/en/inventory-management/tctrak-tissue-cell-culture-tracking-system) | Barcode, QR, and RFID identification, parent-child lineage, Android workflows, and web reporting. | Vessel traceability and barcode workflow are established category needs, not exclusive features. |
| [Hoodflow](https://hoodflow.subculturelabs.com/?source=plant_tissue_culture_software) | Batch-first inventory with optional vessel detail, subculture timing, media demand, and shelf context. | Explain when VitrOS tracks individual vessels versus batch actions; use real screens and a worked example. |
| [Phyto Labs Lab Manager](https://phytolabs.in/lab-manager/) | Plant TC lab software with bottle tracking, contamination logs, planning, and public plan information. | Maintain a broader competitor watchlist than the June brief. |
| [ProtoLab](https://protolab.gravityfarms.ai/about) | Describes itself as a plant tissue culture research LIMS focused on protocol management. | LIMS is a mixed-intent cluster. A requirements guide is more appropriate than changing VitrOS's category claim. |
| [Qdiasys products](https://qdiasys.com/products/) | A product called Lab Planner addresses pharmaceutical and manufacturing laboratory requests and tasks. | The name alone does not identify the legacy TC application in the pipeline. Defer a named alternative page. |

The searches also surfaced [xPlant Pro](https://www.xplantpro.com/en) and [Fred BioSystems](https://fredbiosystems.com/), both describing plant tissue culture software. These are watchlist candidates, not fully audited comparisons.

## Corrections to the June strategy

1. Remove unsupported claims of “very low competition,” “highest volume,” and a comparison hub automatically outranking vendors. None was backed by demand or ranking data.
2. Retire the statement that all named competitors lack public pricing. MeristemLab now has an explicit public pricing page; other newly observed vendors do too. Old observations must remain dated, not carried forward as current facts.
3. Do not lead the SEO program with `lab planner alternative`. The customer anecdote can inform migration content, but the exact vendor/version and keyword demand are unresolved. Avoid general claims that all legacy applications lack cloud access or fail on Windows 11.
4. Do not launch a second spreadsheet-switch page while `/why-vitros` already serves that intent. Strengthen the current URL first.
5. Keep comparison content useful to evaluation-stage buyers. A “best” query is commercial investigation, not automatically top-of-funnel. Publish a dated buyer guide only after checking each product's current official sources and stating VitrOS authorship.
6. The June brief's VitrOS prices differ from the reviewed local pricing source (Solo $49, Growth $99, Pro $199 monthly). Use the approved billing configuration as the source of truth before publishing numerical comparisons. Suggested metadata below intentionally omits amounts.

## Keyword clusters and ownership

Priority: **P1** = implement on existing pages now; **P2** = develop after the foundation and baseline; **P3** = conditional or deferred. These are business priorities, not SEO difficulty scores. Software-query rows use observed vendor language plus proposed buyer query variants; guide-query rows are editorial hypotheses requiring Search Console validation.

| ID | Priority | Cluster and example queries | Intent | Owning URL | Content action |
| --- | --- | --- | --- | --- | --- |
| K01 | P1 | plant tissue culture software; tissue culture lab management software; tissue culture software | Commercial category | `/` | Clear plant-specific title, H1, definition, workflow proof, demo CTA. |
| K02 | P1 | micropropagation software; micropropagation lab management software | Commercial category | `/` | Use naturally in lifecycle copy; same category owner as K01. |
| K03 | P3 | plant propagation software; plant propagation management software | Broad commercial | `/` | Supporting language only; qualify the tissue culture scope. |
| K04 | P1 | tissue culture software features; tissue culture workflow software | Commercial evaluation | `/features` | Explain and demonstrate the integrated workflow. |
| K05 | P1 | tissue culture vessel tracking software; plant culture tracking software | Commercial workflow | `/features` | Show an identified vessel, stage, location, and event history. |
| K06 | P1 | tissue culture barcode software; tissue culture label printing; vessel barcode tracking | Commercial workflow | `/features` | Show scan, record, and label steps with verified hardware support. |
| K07 | P1 | subculture tracking software; tissue culture scheduling software | Commercial workflow | `/features` | Explain due work, stage timing, transfer history, and exceptions. |
| K08 | P1 | plant culture lineage tracking; tissue culture traceability software | Commercial workflow | `/features` | Use one parent-child vessel example with a visible lineage screen. |
| K09 | P1 | tissue culture contamination tracking software; contamination records | Commercial workflow | `/features` | Show logged evidence and review dimensions; avoid prevention guarantees. |
| K10 | P1 | tissue culture media management software; media batch tracking | Commercial workflow | `/features` | Connect recipe, preparation batch, and vessels. |
| K11 | P1 | tissue culture production planning software; micropropagation forecasting | Commercial workflow | `/features` | Explain forecast inputs and scheduling assumptions. |
| K12 | P2 | plant tissue culture inventory software; lab culture inventory management | Commercial workflow | `/features` | Distinguish active culture inventory from consumables. |
| K13 | P2 | tissue culture audit trail; tissue culture lab records software | Commercial workflow | `/features` | Describe person/time/action history; only claim supported exports and controls. |
| K14 | P1 | tissue culture software pricing; micropropagation software cost; VitrOS pricing | Transactional | `/pricing` | Accurate plans, billing basis, limits, and trial terms. |
| K15 | P1 | tissue culture software demo; VitrOS demo | Transactional | `/demo` | Show a real workflow and explain the demo/booking next step. |
| K16 | P1 | tissue culture software vs spreadsheets; replace tissue culture spreadsheets; Excel alternative for tissue culture | Switching evaluation | `/why-vitros` | A balanced comparison and practical migration checklist. |
| K17 | P2 | tissue culture lab management guides; tissue culture operations guides | Informational navigation | `/blog` | Editorial hub with descriptive summaries once articles exist. |
| K18 | P2 | how to label tissue culture vessels; tissue culture barcode labeling workflow | Informational task | `/blog/tissue-culture-vessel-labeling` (proposed) | Worked ID, record, label, scan, and transfer example. |
| K19 | P2 | how to track subcultures; tissue culture subculture schedule | Informational task | `/blog/subculture-scheduling-and-records` (proposed) | Required records, due dates, overdue review, and worked example. |
| K20 | P2 | LIMS for plant tissue culture; tissue culture LIMS vs production software | Commercial education | `/blog/plant-tissue-culture-lims-requirements` (proposed) | Requirements matrix for production versus analytical/research needs. |
| K21 | P2 | best tissue culture software; tissue culture software comparison | Commercial investigation | `/compare/tissue-culture-software` (proposed) | Source-based buyer guide with deployment, workflows, pricing basis, and migration criteria. |
| K22 | P2 | tissue culture record keeping template; tissue culture spreadsheet template | Informational resource | `/blog/tissue-culture-record-keeping-template` (proposed) | A usable downloadable template and field dictionary before any migration pitch. |

The CSV includes source URLs and explicit unmeasured fields. Some clusters share a page because they describe one buyer task; these are not requests to create 22 pages.

## Titles, H1s, and descriptions for the foundation

These are recommended copy, not a claim that deployment has happened. Keep title, visible heading, page content, and social metadata consistent. Google can choose title links from several page signals and may rewrite them. [Google title-link guidance](https://developers.google.com/search/docs/appearance/title-link)

| Page | Title | H1 |
| --- | --- | --- |
| `/` | Plant Tissue Culture Lab Management Software \| VitrOS | Plant tissue culture software for a connected lab. |
| `/features` | Vessel Tracking & Tissue Culture Software Features \| VitrOS | Vessel tracking and tissue culture lab tools |
| `/pricing` | Tissue Culture Software Pricing & Plans \| VitrOS | Tissue culture software pricing |
| `/demo` | Tissue Culture Software Demo \| VitrOS | See VitrOS tissue culture software in action |
| `/why-vitros` | Replace Tissue Culture Spreadsheets with VitrOS | Tissue culture records beyond spreadsheets |
| `/blog` | Tissue Culture Lab Management Guides \| VitrOS | Tissue culture lab management guides |

- **Homepage description:** Manage plant tissue culture vessels, track lineage, schedule subcultures, and review contamination in one connected lab workspace. Explore VitrOS.
- **Features description:** Explore VitrOS tools for vessel tracking, barcode labels, subculture scheduling, media records, contamination review, and tissue culture production planning.
- **Pricing description:** Compare VitrOS plans for tissue culture labs, including vessel limits, team access, and lab management features. Choose a plan for your operation.
- **Demo description:** See VitrOS vessel tracking, barcode scanning, culture lineage, and production planning in action. Explore the demo or request a guided lab walkthrough.
- **Why description:** Move tissue culture records from spreadsheets and paper logs into connected vessel tracking, lineage, media records, and shared lab workflows with VitrOS.
- **Blog description:** Practical guides to tissue culture records, vessel labeling, subculture planning, contamination tracking, and running a connected plant laboratory.

Descriptions summarize the page rather than list keyword variations. Adding terms to `meta keywords` is not the implementation: Google ignores that tag for indexing and ranking. [Google supported meta tags](https://developers.google.com/search/docs/crawling-indexing/special-tags)

## Page plan that avoids overlapping intent

1. Keep `/` as the broad category owner. Do not create near-duplicate `/tissue-culture-software`, `/plant-tissue-culture-software`, and `/micropropagation-software` pages.
2. Keep commercial workflow capabilities on `/features` initially, using descriptive sections and links. Only split a workflow into its own public product page when it has substantial product evidence and a distinct buyer need. Move the target cluster then and leave a short linked summary on `/features`.
3. `/why-vitros` owns spreadsheet replacement. If a future `/compare/vitros-vs-spreadsheets` replaces it, plan a consolidation and redirect rather than publishing both versions of the same argument.
4. Guides own how-to questions. A vessel-labeling guide should teach the process and link to `/features`; it should not restate the features page with a different title. Commercial pages may briefly explain the workflow and link back to the guide.
5. `/pricing` owns cost and plan questions; `/demo` owns product trial and walkthrough intent. Do not make either another generic software landing page.
6. The comparison guide owns category evaluation. Use evergreen URLs, visible verification dates, sources per claim, and transparent selection criteria. Recheck prices and deployment details before publication and on material vendor changes. Avoid one thin page per competitor.
7. Use `/blog` as navigation to substantive articles. Publish a useful article before treating an empty hub as a meaningful organic acquisition page. Do not put proposed or unpublished URLs in the sitemap.

Internal links: homepage to features, pricing, demo, and why; feature sections to matching guides when published; guides to the relevant product section and demo; buyer guide to pricing and demo; why page to the migration/template resource. Use descriptive anchor text. Prefer natural topic coverage and original operational examples to repeating every variant verbatim. [Google SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide)

Defer generic `lab management software`, `LIMS software`, `tissue culture equipment`, clinical tissue tracking, consumer plant trackers, and unrelated nursery ERP terms as primary targets. They broaden the audience beyond the demonstrated product. Crop-specific pages need real crop-specific workflow evidence, not species names swapped into one template.

## 90-day execution plan

| Window | Action | Reviewable output |
| --- | --- | --- |
| Days 1-7 | Apply six-page metadata/H1 map and clear category language; verify rendered HTML, chosen canonical host, public sitemap, robots behavior, and exclusion of private app content. Audit all quantified product claims and pricing against approved sources. | Six coherent public pages, technical verification record, dated change log. |
| Days 1-14 | Obtain Search Console baseline through an authorized owner export or connection. Record deployment date and organic demo/signup measurement definitions. | Baseline CSVs and measurement sheet; no fabricated zero values. |
| Days 8-30 | Publish the vessel-labeling guide and subculture-records guide with an actual worked VitrOS example and named reviewer. Add useful screenshots and related links. | Two substantive guides; all example data clearly identified. |
| Days 31-60 | Add the usable record-keeping template and improve `/why-vitros` around migration steps. Inspect early query/page data and correct mismatched intent. | Template, field dictionary, migration checklist, first performance review. |
| Days 61-90 | Choose between the LIMS requirements guide and the software buyer guide using sales questions and observed search impressions. Refresh vendor evidence before any comparison. | One evidence-based evaluation guide; revised cluster priorities and next-quarter plan. |

Success criteria are operational: public pages are accessible and internally linked; metadata matches content; guides help an actual lab task; measurement is available; qualified organic inquiries can be traced to landing pages. No ranking position, traffic volume, or lead-count target is defensible until a baseline exists.

## Search Console baseline and follow-up

Current baseline status: **not available in this session**. Search-result sightings of VitrOS show discoverability only, not its Google performance.

An authorized owner should export the last complete 28 days and preceding 28 days, plus roughly 90 days for context, with clicks, impressions, CTR, and average position. Save query and page exports; segment by country/device where useful. Keep brand queries (VitrOS and spelling/domain variants) separate from nonbrand queries. The metric meanings and available dimensions are documented in [Search Console Performance reporting](https://support.google.com/webmasters/answer/7576553?hl=en).

Inspect the six public URLs for indexing status and Google-selected canonical; compare the live test with the indexed version when diagnosing discrepancies. A successful live test does not guarantee indexing. [Google URL Inspection](https://support.google.com/webmasters/answer/9012289?hl=en)

Suggested baseline sheet columns: `snapshot_date`, `date_from`, `date_to`, `country_filter`, `device_filter`, `query`, `landing_page`, `brand_or_nonbrand`, `cluster_id`, `clicks`, `impressions`, `ctr`, `average_position`, `organic_demo_requests`, `organic_workspace_creations`, `notes`. Record whether each conversion is a real completed action or only a CTA click. A mailto click is not a confirmed demo request.

Review technical coverage after deployment, then performance after approximately 28, 60, and 90 days. Look for relevant impressions, the intended landing page per query family, CTR in context, and qualified downstream actions. Investigate persistent splitting of the same intent across pages before making new ones. Do not read normal fluctuations, small samples, or average position as a fixed ranking. If no data exists yet, leave the baseline blank with its reason and begin collecting it.

## Research status

Completed: live category/competitor research, critical review of the earlier brief, six-page copy recommendations, 22-cluster map, phased content plan, and measurement follow-up. Open dependencies: Search Console performance, reliable demand estimates if later desired, approved billing/claims verification, and editorial review before publishing the proposed guides. No connector was installed, no account was changed, and this research did not publish content.
