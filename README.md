# VitrOS

**Lab operations software for tissue culture and plant-propagation labs.**

VitrOS replaces the spreadsheets and paper logs that most tissue-culture labs still run on. Labs tracking tens of thousands of vessels through subculture cycles use it to keep genealogy, contamination history, and batch context intact — at scan speed.

> 🔗 **Website:** [vitroslabs.com](https://vitroslabs.com)
> 🔗 **Live app:** [app-psi-six-95.vercel.app](https://app-psi-six-95.vercel.app)

<img width="1494" height="816" alt="Screenshot 2026-06-09 at 5 38 08 PM" src="https://github.com/user-attachments/assets/4d96a4cf-064e-4a60-a4f1-464518eb69e5" />
<img width="1493" height="814" alt="Screenshot 2026-06-09 at 5 39 16 PM" src="https://github.com/user-attachments/assets/44edf7f9-f488-4094-873d-00006afbec79" />
<img width="1496" height="814" alt="Screenshot 2026-06-09 at 5 43 58 PM" src="https://github.com/user-attachments/assets/6e52d370-8acc-40da-9e4d-371dd55def0f" />

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

## Run locally

```bash
npm install
cp .env.example .env.local   # set DATABASE_URL and the other values
npx prisma generate
npm run dev                  # http://localhost:3000
```

## Status

In production development under Endless BioTech. Built from an empty repo to a working multitenant platform and demoed directly with laboratory directors.

## Author

York Sims — [yorksims.com](https://yorksims.com) · [github.com/theblockchainbaby](https://github.com/theblockchainbaby)
