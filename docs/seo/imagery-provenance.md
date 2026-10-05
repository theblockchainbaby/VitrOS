# VitrOS imagery provenance

Recorded 2026-10-05. These files are the approved PNG assets from the local [imagery review](../../../research/VitrOS_Imagery_Preview_20261005/README.md). All eight shipped PNGs were compared with their review sources and matched byte for byte during packaging. This packaging step did not regenerate or modify the images.

## Product screenshots

These are screenshots of the actual VitrOS application rendered locally with **synthetic demonstration data**. They are not customer records or evidence of a particular lab's scale or performance. The fixed demonstration time is `2026-10-05T17:00:00Z`; the display timezone is `America/Los_Angeles`.

| Shipped asset | Original review asset | Displayed workflow |
| --- | --- | --- |
| [tissue-culture-dashboard.png](../../public/images/product/tissue-culture-dashboard.png) | `assets/today.png` | Today dashboard: 1,248 active vessels, four cultures ready to multiply, stage and health summaries, and recent activity. All values are demonstration data. |
| [vessel-record.png](../../public/images/product/vessel-record.png) | `assets/vessel.png` | Vessel `TC-2026-0042`, Monstera deliciosa, multiplication stage, three explants, media and location context, and activity history. |
| [culture-lineage.png](../../public/images/product/culture-lineage.png) | `assets/lineage.png` | Nine demonstration vessels across three generations, with `TC-2026-0042` selected. |
| [vessel-scanning.png](../../public/images/product/vessel-scanning.png) | `assets/scan.png` | The actual scan interface after entering demonstration barcode `TC-2026-0042` in Scanner / type mode. |
| [label-printing.png](../../public/images/product/label-printing.png) | `assets/labels.png` | The actual label-printing interface with the demonstration vessel selected and QR Code format chosen. |
| [vessel-label-preview.png](../../public/images/product/vessel-label-preview.png) | `assets/label-preview.png` | A crop of the application's generated QR-label preview for the same vessel. |

The reviewed screenshots were captured at a 1,440 × 1,080 CSS-pixel viewport with device scale factor 2. The label-printing view uses a 1,440 × 1,300 CSS-pixel viewport. The label preview is an element crop. Original capture evidence and fixture snapshots remain in [capture-report.json](../../../research/VitrOS_Imagery_Preview_20261005/capture-report.json) and [demo-data.json](../../../research/VitrOS_Imagery_Preview_20261005/demo-data.json).

## AI photo illustrations

| Shipped asset | Original review asset | Provenance |
| --- | --- | --- |
| [labeled-culture-vessel-ai.png](../../public/images/homepage/labeled-culture-vessel-ai.png) | `assets/label-concept.png` | AI-generated photo illustration of a culture vessel bearing the demonstration identifier. Generated, then refined to depict small juvenile Monstera plantlets with entire leaves and clean translucent medium. |
| [tissue-culture-bench-ai.png](../../public/images/homepage/tissue-culture-bench-ai.png) | `assets/bench-concept.png` | AI-generated photo illustration of a technician scanning a vessel beside a laptop. The approved vessel concept and actual vessel screenshot were supplied as visual references. |

Both illustrations were produced with the built-in `image_gen` tool. They depict a conceptual laboratory scene, not an actual customer, facility, technician, or observed scanning event. Keep the visible **AI photo illustration** captions and matching alt text. The QR graphic inside an AI illustration is illustrative; the product label-preview screenshot separately shows actual application output.

The original generation and refinement prompts are preserved verbatim in [image-prompts.json](image-prompts.json), copied without changes from the review. `labelInitial` describes the first vessel concept, `labelFinalEdit` describes the approved refinement, and `bench` describes the final bench composition. The initial vessel iteration is not a shipped asset. Prompt wording reflects its original private-review context; the approved illustrations are now used on the public marketing pages with their disclosure captions.

The existing [homepage shelf photograph](../../public/images/homepage/tc-verticals.jpg) remains an existing project asset. This work did not generate it or establish new provenance for it.

## Reproducing the product views

The repository's [capture script](../../scripts/design-product-image.cjs) now carries the approved richer fixture records and the six shipped filenames. It imports local [design fixtures](../../scripts/design-fixtures.cjs) for the authentication fixture, localhost restriction, and API interception, then overlays the imagery-specific responses. It no longer captures only the previous two-row Today fixture.

With a local VitrOS instance already serving, run from the repository root:

```sh
DESIGN_BASE_URL=http://127.0.0.1:3100 node scripts/design-product-image.cjs
```

`DESIGN_BASE_URL` may select another localhost port. The imported fixture rejects non-localhost hosts. Every `/api/` request is intercepted: explicit imagery responses take precedence, and other API requests fall back to the shared fixture. Service workers are blocked so they cannot bypass request interception. No production API or database is used by the capture workflow.

The script freezes the demonstration clock, selects light mode, disables capture animations, and checks page overflow and page errors. It writes the six PNGs to `public/images/product/`, plus capture evidence to `docs/design-verification/product-image-capture.json` and fixture data to `docs/design-verification/product-image-demo-data.json`.

Run the script only when intentionally refreshing the approved screenshots: it overwrites those PNGs. The fixtures reproduce the approved content and navigation steps; later application or font changes can alter pixels and require visual review. Generative photo illustrations are retained source assets, not regenerated by this script.

Packaging verification: JavaScript syntax and scoped ESLint only. The capture script was not executed during this step, and the approved PNGs were left intact.
