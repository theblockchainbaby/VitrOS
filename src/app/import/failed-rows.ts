/** Match the import API: each nonempty barcode/code/id alias replaces the previous value. */
export function failedRowsCsv(csv: string, failedBarcodes: ReadonlySet<string>): string {
  const lines = csv.split(/\r?\n/).filter((line) => line.trim());
  if (!lines.length) return "";
  const headers = lines[0].split(",").map((header) => header.trim().toLowerCase().replace(/[^a-z_]/g, ""));
  const barcodeColumns = headers.flatMap((header, index) => header.includes("barcode") || header === "code" || header === "id" ? [index] : []);
  const failedLines = lines.slice(1).filter((line) => {
    const values = line.split(",").map((value) => value.trim());
    const barcode = barcodeColumns.reduce((current, index) => values[index] || current, "");
    return failedBarcodes.has(barcode);
  });
  return [lines[0], ...failedLines].join("\n");
}
