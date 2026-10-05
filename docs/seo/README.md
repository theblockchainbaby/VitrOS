# VitrOS SEO and imagery release package

Prepared 2026-10-05. This package records the implemented SEO foundation and approved imagery, along with local verification. Production deployment requires separate live confirmation.

## Implemented foundation

- Distinct titles, descriptions, and visible H1s for the homepage, features, pricing, demo, spreadsheet-replacement, and blog pages. Plant tissue culture and micropropagation are the category focus.
- Public-page canonical URLs on `https://vitroslabs.com`, consistent social-preview metadata, and a homepage available in the initial HTML while signed-in users retain the Today dashboard.
- Homepage Organization and SoftwareApplication structured data without unsupported pricing offers. Account/system pages and the unavailable-article state carry `noindex`; the sitemap contains public pages. Robots directives allow public crawling and disallow API paths.
- Approved richer product screenshots and two explicitly disclosed AI photo illustrations, with preserved source prompts and a reproducible local capture script.

## Research and evidence

| File | Contents |
| --- | --- |
| [Keyword research](2026-10-05-keyword-research.md) | Current official vendor evidence, corrections to the June brief, page ownership, and a 90-day content plan |
| [Keyword map](2026-10-05-keyword-map.csv) | 22 prioritized clusters with intent, owning page, evidence, and unmeasured metrics identified |
| [Imagery provenance](imagery-provenance.md) | Shipped assets, synthetic demonstration records, AI disclosures, and capture instructions |
| [Original image prompts](image-prompts.json) | Verbatim generation and refinement prompts |
| [Release verification](release-verification.json) | Local metadata, canonical, robots, schema, sitemap, and authenticated-dashboard observations |
| [Image loading](image-loading-verification.json) | Thirteen rendered images across home and features decoded successfully |
| [Design verification](../design-verification/README.md) | Current release results, earlier design evidence, and remaining hardware acceptance checks |

## Local release results

The production build passes, all **64 tests across 9 files** pass, and changed-file ESLint reports zero warnings. Browser verification passes **81 public checks** and **12 interaction checks**. The SEO release script passes **13 checks** with no browser errors; `/sitemap.xml` and `/robots.txt` both return HTTP 200.

The repository-wide lint gate retains pre-existing findings: 6 errors and 15 warnings in unchanged files. Physical scanner, camera, and printer acceptance remains separate from the local fixture checks; the design verification document records those limits.

## Measurement limits and next steps

Search Console and DataForSEO were not connected during research. Search volume, keyword difficulty, current Google rankings, organic clicks, impressions, and conversion baselines remain unmeasured. The implementation supports crawlability and clear page intent; it does not establish indexing, rankings, or traffic gains.

The guide and comparison URLs in the research are proposals, not published release content. Next, collect an authorized Search Console baseline, inspect the public URLs after deployment, and review results at roughly 28, 60, and 90 days. Use completed demo requests or workspace creations for conversion measurement; a CTA click alone is not a completed inquiry.
