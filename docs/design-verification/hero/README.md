# Connected culture hero verification

The homepage now leads with “Every culture. Connected.” and a single composition showing the same vessel, its VitrOS record and its parent lineage. Category copy remains visible above the headline; the supporting paragraph explains the technician's work. The old lower-page vessel/record section was moved here to avoid repetition.

The vessel photograph remains visibly labeled as an AI photo illustration. Screenshots show actual application UI with demonstration data. Their CSS viewports emphasize the record and lineage; keyboard-accessible links open the complete source images. Mobile shows the complete record overview and adds a readable vessel-ID caption.

## Verified locally against the production build

- Production build, TypeScript and all 64 tests pass; changed source and verification scripts pass ESLint without warnings.
- 24 responsive checks cover Chromium and WebKit, light/dark mode, and widths of 320, 375, 414, 768, 1280 and 1440px.
- All three hero images decode; no horizontal overflow or browser page errors were observed.
- Four interaction groups verify keyboard access to both full screenshots and working navigation to signup and demo.
- 13 SEO release checks pass, including server-rendered headline/category copy, a single H1, canonicals/indexing, sitemap/robots, and the signed-in Today dashboard.

Evidence: [browser results](verification.json), [light desktop](chromium-light-1440.png), [dark desktop in WebKit](webkit-dark-1440.png), [mobile](webkit-light-375.png), and [SEO results](../../seo/release-verification.json).

Reproduce with a local server running:

```sh
DESIGN_BASE_URL=http://127.0.0.1:3101 node scripts/design-hero-check.cjs
DESIGN_BASE_URL=http://127.0.0.1:3101 node scripts/seo-release-check.cjs
```

The harness accepts localhost only and intercepts API requests with demonstration fixtures. Each viewport is loaded separately so WebKit media queries and viewport units settle before measurements. These checks cover the marketing change; physical scanners, printers and production data mutations are outside this release's verification.
