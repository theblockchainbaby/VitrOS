# Connected Culture Hero Implementation Plan

**Goal:** Implement the three approved homepage hero improvements and verify the live release.

**Architecture:** A focused ConnectedCultureHero component and CSS module own the introductory copy and connected image composition. LandingPage places it first and removes the duplicate physical-record section. Existing screenshot assets, navigation, design tokens and SEO metadata remain the foundation.

**Tech Stack:** Next.js, React, TypeScript, CSS modules, next/image, Playwright.

- [ ] Create `src/components/connected-culture-hero.tsx` and its CSS module. Use “Every culture. Connected.”, tissue culture category copy, signup/demo links, and the matching vessel/record/lineage assets. Crop screenshots in CSS viewports and link to originals; keep disclosure captions visible.
- [ ] Integrate into `src/components/landing-page.tsx`, moving `physical-record` to the hero and removing its duplicated lower section.
- [ ] Update `scripts/seo-release-check.cjs` to verify the new headline and server-rendered category copy without changing the indexing contract.
- [ ] Inspect desktop/mobile screenshots and refine layout. Check Chromium/WebKit in light/dark, six widths, image loading, H1, anchors, CTA destinations and keyboard access. Confirm the authenticated homepage remains Today.
- [ ] Run `npx eslint` on changed source, `npx tsc --noEmit --pretty false`, `npm test`, and `npm run build`. Run public/SEO browser checks against the final production build.
- [ ] Commit, push, merge and confirm Vercel production success. Verify the live hero and show it in Safari.

Scope review: the plan covers the approved copy, composition and spacing changes. It does not add new software capabilities or invent customer outcomes. Screenshot fixtures and photo illustrations remain clearly identified.
