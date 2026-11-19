// Barcodes for labs that have no labels yet. A generated code carries a prefix
// from the lab's name and continues after the highest number the lab has used.

// Typo guard for the setup form. The plan's vessel limit is enforced separately.
export const MAX_STARTER_VESSELS = 500;

export function barcodePrefix(orgName: string): string {
  const letters = orgName.toUpperCase().replace(/[^A-Z0-9]/g, "");
  return (letters.slice(0, 4) || "LAB").padEnd(3, "X");
}

export function nextBarcodes(prefix: string, taken: string[], count: number): string[] {
  const pattern = new RegExp(`^${prefix}-(\\d+)$`);
  let highest = 0;
  for (const code of taken) {
    const match = pattern.exec(code);
    if (match) highest = Math.max(highest, parseInt(match[1], 10));
  }
  return Array.from({ length: count }, (_, i) => `${prefix}-${String(highest + i + 1).padStart(4, "0")}`);
}
