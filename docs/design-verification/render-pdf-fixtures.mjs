// Offline fixture generation against the actual report components. No API or DB.
// Run from the repository root: node docs/design-verification/render-pdf-fixtures.mjs
import { readFile, writeFile, unlink } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { renderToBuffer } from "@react-pdf/renderer";

const compiledPath = new URL("./.pdf-templates-fixture.mjs", import.meta.url);
const source = await readFile(new URL("../../src/lib/pdf-templates.tsx", import.meta.url), "utf8");
await writeFile(compiledPath, ts.transpileModule(source, {
  compilerOptions: { jsx: ts.JsxEmit.React, module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText);

try {
  const { VesselReport, ActivityReport } = await import(compiledPath.href);
  const shared = {
    orgName: "Demonstration Tissue Culture Laboratory - Pacific Northwest Propagation and Conservation Research",
    date: "October 5, 2026",
  };
  const vessels = Array.from({ length: 72 }, (_, index) => ({
    barcode: `V${String(index + 1).padStart(3, "0")}-LONG-BARCODE-2026-10`,
    cultivar: index % 3 === 0 ? "Pacific Northwest Conservation Selection Alpha 2026" : "Demonstration cultivar",
    species: "Demonstration species",
    stage: "multiplication",
    status: "ready_to_multiply",
    health: index % 7 === 0 ? "slow_growth" : "healthy",
    location: "Research Wing / Chamber 12 / Rack 04 / Shelf 03",
    explants: 1234,
    generation: 12,
    subcultureNum: 24,
    mediaRecipe: "Modified MS basal medium with multiplication supplements",
    created: "Oct 5, 2026",
  }));
  const activities = Array.from({ length: 44 }, (_, index) => ({
    date: "Oct 5, 2026, 10:45 AM",
    type: "subculture_health_check_completed",
    category: "quality_assurance",
    vessel: `A${String(index + 1).padStart(3, "0")}-LONG-VESSEL-BARCODE`,
    user: "Alexandria Demonstration Research Technician",
    notes: `Row ${index + 1}. ` + "Checked culture appearance and recorded observations for the next shift. Confirmed the shelf location and media recipe against the vessel record. ".repeat(index % 4 === 0 ? 5 : 2),
  }));
  const reports = [
    ["vessel-report-long-rows.pdf", VesselReport({ ...shared, vessels })],
    ["activity-report-long-rows.pdf", ActivityReport({ ...shared, activities })],
    ["activity-report-long-note.pdf", ActivityReport({ ...shared, activities: [{ ...activities[0], notes: "LONGNOTE_START " + Array.from({ length: 60 }, (_, index) => `NOTE${String(index + 1).padStart(3, "0")} Extended handover observations for this culture, with preserved operational context and review instructions. `).join("") + " LONGNOTE_END" }] })],
  ];
  for (const [filename, document] of reports) {
    if (process.env.PDF_FIXTURE && !filename.includes(process.env.PDF_FIXTURE)) continue;
    const buffer = await renderToBuffer(document);
    const target = new URL(filename, import.meta.url);
    await writeFile(target, buffer);
    console.log(`${fileURLToPath(target)} (${buffer.length} bytes)`);
  }
} finally {
  await unlink(compiledPath);
}
