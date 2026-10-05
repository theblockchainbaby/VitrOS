PDF report verification — October 5, 2026

The actual `VesselReport` and `ActivityReport` components were rendered locally with `@react-pdf/renderer`, using synthetic data only. No database or network access was used.

The first render reproduced two defects: inherited numeric `lineHeight` grew during react-pdf pagination, removing footers and eventually causing a numeric overflow exception; an unbreakable activity row clipped a note longer than a page. The template now uses the renderer’s default line spacing. Long activity notes are split into bounded, labeled continuation rows that repeat the record’s date, action, category, vessel, and operator. Ordinary rows stay together.

Final fixtures:

| PDF | Data | Pages | Minimum body/footer gap |
| --- | --- | --- | --- |
| `vessel-report-long-rows.pdf` | 72 vessels with long barcodes, cultivar, location and media fields | 7 | 45.48 pt |
| `activity-report-long-rows.pdf` | 44 activities with long action, operator, barcode and notes | 7 | 30.88 pt |
| `activity-report-long-note.pdf` | One note with 60 uniquely marked observation segments | 3 | 83.28 pt |

Poppler text coordinates confirm every page has table headings and the correct numbered footer, every record/note marker is present, and no word lies outside its page. Raster inspection of the first pages, continuation pages and long-note ending found no heading, column or footer overlap. `pdf-report-contact-sheet.png` preserves representative rendered pages; `pdf-layout-verification.json` contains the coordinate results. TypeScript, targeted ESLint and `git diff --check` passed.

To reproduce from the repository root:

```sh
node docs/design-verification/render-pdf-fixtures.mjs
python3 docs/design-verification/verify-pdf-layout.py
```

The coordinate check requires Poppler’s `pdftotext`. Physical printer output, arbitrary font scripts and Production/Contamination report pagination were outside this targeted verification. These synthetic fixtures do not exercise report API filtering or authorization.
