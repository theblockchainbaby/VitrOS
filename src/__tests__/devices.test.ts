import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { classifyKeystrokes, SCAN_MAX_KEY_GAP_MS, type KeyStroke } from "@/lib/use-hardware-scanner";
import { generateVesselZPL, getLabelStock, labelPrintCSS, zplSafe, LABEL_STOCKS } from "@/lib/label-generator";

const strokes = (text: string, gapMs: number): KeyStroke[] => [...text].map((key, i) => ({ key, time: 1000 + i * gapMs }));

describe("telling a scanner from typing", () => {
  it("accepts a fast burst as a scan", () => {
    expect(classifyKeystrokes(strokes("RS-00012", 8))).toEqual({ kind: "scan", code: "RS-00012", durationMs: 56 });
  });
  it("accepts a slower Bluetooth scanner", () => {
    expect(classifyKeystrokes(strokes("RIVE-0001", 45)).kind).toBe("scan");
  });
  it("treats human-speed keys as typing", () => {
    expect(classifyKeystrokes(strokes("RS-00012", 140))).toEqual({ kind: "typed", code: "RS-00012" });
  });
  it("treats one slow gap inside a burst as typing", () => {
    const keys = strokes("ABCDEF", 10);
    keys[3].time += SCAN_MAX_KEY_GAP_MS + 50;
    expect(classifyKeystrokes(keys).kind).toBe("typed");
  });
  it("ignores stray keys too short to be a barcode", () => {
    expect(classifyKeystrokes(strokes("s", 5)).kind).toBe("too_short");
    expect(classifyKeystrokes([]).kind).toBe("too_short");
  });
});

describe("label output", () => {
  it("removes ZPL command characters from label data", () => {
    expect(zplSafe("Blue^XA~JR Dream\nline")).toBe("Blue XA JR Dream line");
    const zpl = generateVesselZPL({ barcode: "RS-1^XZ", cultivar: "Bad~Name^FS" });
    expect(zpl).toContain("^FDRS-1 XZ^FS");
    expect(zpl).toContain("^FDBad Name FS^FS");
  });
  it("sizes the ZPL label to the chosen stock at 203 dpi", () => {
    expect(generateVesselZPL({ barcode: "A1" })).toContain("^PW457");
    const zpl = generateVesselZPL({ barcode: "A1" }, getLabelStock("2x1"));
    expect(zpl).toContain("^PW406");
    expect(zpl).toContain("^LL203");
  });
  it("prints roll labels one per page at the real label size", () => {
    const css = labelPrintCSS(getLabelStock("2.25x1.25"));
    expect(css).toContain("@page { size: 2.25in 1.25in; margin: 0; }");
    expect(css).toContain("page-break-after: always");
  });
  it("keeps plain paper as a multi-label sheet", () => {
    const css = labelPrintCSS(getLabelStock("sheet"));
    expect(css).not.toContain("@page { size");
    expect(css).toContain("inline-block");
  });
  it("falls back to a known stock for an unknown id", () => {
    expect(getLabelStock("nope")).toBe(LABEL_STOCKS[0]);
  });
});

describe("GET /api/vessels/next-barcodes", () => {
  const findMany = vi.fn();
  beforeEach(() => {
    findMany.mockReset().mockResolvedValue([{ barcode: "GURU-0003" }]);
    const p = prisma as unknown as Record<string, Record<string, unknown>>;
    p.organization.findUnique = vi.fn().mockResolvedValue({ name: "Gurudeva Bioplants" });
    p.vessel.findMany = findMany;
  });
  const get = async (query: string) => {
    const { GET } = await import("@/app/api/vessels/next-barcodes/route");
    return GET(new NextRequest(`http://localhost:3000/api/vessels/next-barcodes${query}`));
  };

  it("continues after the lab's highest number", async () => {
    const res = await get("?count=2");
    expect(await res.json()).toEqual({ barcodes: ["GURU-0004", "GURU-0005"] });
    expect(findMany.mock.calls[0][0].where).toMatchObject({ organizationId: "test-org-id" });
  });
  it("skips numbers the form already holds", async () => {
    const res = await get("?count=1&reserved=GURU-0004&reserved=GURU-0005");
    expect(await res.json()).toEqual({ barcodes: ["GURU-0006"] });
  });
  it("rejects a bad count", async () => {
    expect((await get("?count=0")).status).toBe(400);
    expect((await get("?count=9999")).status).toBe(400);
  });
});
