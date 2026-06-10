# VitrOS

**Lab operations software for tissue culture and plant-propagation labs.**

VitrOS replaces the spreadsheets and paper logs that most tissue-culture labs still run on. Labs tracking tens of thousands of vessels through subculture cycles use it to keep genealogy, contamination history, and batch context intact — at scan speed.

> 🔗 **Website:** [vitroslabs.com](https://vitroslabs.com)
> 🔗 **App:** [app.vitroslabs.com](#) <!-- TODO: point the app at a vitroslabs.com subdomain — the app-psi-six-95.vercel.app URL undermines credibility. In Vercel: Project Settings → Domains → add app.vitroslabs.com -->
> 🎥 **2-min walkthrough:** [video link](#) <!-- TODO: reuse the VitrOS walkthrough video from your Apr 16 investor update -->

![VitrOS dashboard](docs/screenshots/dashboard.png)
<!-- TODO: add 2-3 screenshots: dashboard, vessel genealogy view, contamination trace. Visual proof is the highest-ROI 20 minutes you can spend on this repo. -->

## Why it exists

A mid-size propagation lab moves thousands of vessels a week. One untraced contamination event can wipe out months of work, and on paper systems nobody can answer "which clones came from this mother vessel?" without an afternoon of archaeology. VitrOS makes that answer instant.

## What it does

- **Vessel tracking** — every vessel followed through its full lifecycle, barcode scanning for intake and movement
- **Contamination tracing** — flag an event, trace exposure across related vessels and batches in seconds
- **Genealogy chains** — complete parent-to-clone lineage for every cultivar
- **Batch operations** — group, move, and operate on vessels in bulk
- **Multi-tenant by design** — isolated per-lab environments, automated provisioning, role based access per lab

## Stack

Next.js · React · TypeScript · Prisma · PostgreSQL (Neon) · Sentry · Vitest · Vercel

## Status

In production development under Endless BioTech. Built from an empty repo to a working multitenant platform and demoed directly with laboratory directors. <!-- TODO: if any lab is actively piloting/paying, say so here in one sentence — it's the strongest line in the file -->

## Author

York Sims — [yorksims.com](https://yorksims.com) · [github.com/theblockchainbaby](https://github.com/theblockchainbaby)
