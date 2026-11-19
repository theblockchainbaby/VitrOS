// Client helper: ask the server for the lab's next numbered barcodes.
export async function fetchNextBarcodes(count = 1, reserved: string[] = []): Promise<string[]> {
  const params = new URLSearchParams({ count: String(count) });
  reserved.forEach((code) => params.append("reserved", code));
  const res = await fetch(`/api/vessels/next-barcodes?${params}`);
  if (!res.ok) throw new Error("Could not get a vessel number. Try again.");
  const data = await res.json();
  if (!Array.isArray(data.barcodes) || data.barcodes.length === 0) throw new Error("Could not get a vessel number. Try again.");
  return data.barcodes;
}
