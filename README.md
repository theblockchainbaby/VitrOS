# VitrOS

Multi-tenant SaaS platform for tissue-culture laboratory operations. Built for plant-propagation and tissue-culture labs that track tens of thousands of vessels through subculture cycles and need to keep genealogy, contamination history, and batch context intact, instead of managing it on spreadsheets and paper.

> Developed under Endless BioTech.

## What it does

- **Vessel tracking** — every vessel followed through its lifecycle, with barcode scanning for fast intake and movement
- **Contamination tracing** — flag contamination events and trace them across related vessels and batches
- **Genealogy chains** — full parent-to-clone lineage for every cultivar
- **Batch management** — group, move, and operate on vessels in batches
- **Role-based access control** — scoped permissions per lab
- **Multi-tenancy** — isolated per-lab environments with automated provisioning

## Stack

- **App:** Next.js, React, TypeScript
- **Database:** PostgreSQL (Neon)
- **Access:** role-based access control, per-tenant isolation
- **Deploy:** Vercel

## Status

Built from an empty repo to a working multi-tenant platform and demoed directly with laboratory directors. Active development.

## Author

York Sims — [github.com/theblockchainbaby](https://github.com/theblockchainbaby) · [yorksims.com](https://yorksims.com)
