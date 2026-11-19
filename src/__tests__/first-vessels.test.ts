import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { barcodePrefix, nextBarcodes } from "@/lib/starter-barcodes";

describe("starter barcodes", () => {
  it("builds a prefix from the lab name", () => {
    expect(barcodePrefix("Gurudeva Bioplants")).toBe("GURU");
    expect(barcodePrefix("Sunshine and Lollipops")).toBe("SUNS");
    expect(barcodePrefix("ab")).toBe("ABX");
    expect(barcodePrefix("実験室")).toBe("LAB");
  });

  it("starts at 0001 when the prefix is unused", () => {
    expect(nextBarcodes("GURU", [], 3)).toEqual(["GURU-0001", "GURU-0002", "GURU-0003"]);
  });

  it("continues after the highest number taken by any lab", () => {
    expect(nextBarcodes("GURU", ["GURU-0002", "GURU-0010", "GURU-X1", "GURUDEV-0050"], 2)).toEqual(["GURU-0011", "GURU-0012"]);
  });
});

function makeRequest(body: unknown): NextRequest {
  return new NextRequest("http://localhost:3000/api/onboarding/first-vessels", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

describe("POST /api/onboarding/first-vessels", () => {
  const mocks = {
    orgFind: vi.fn(),
    cultivarFindFirst: vi.fn(),
    cultivarCreate: vi.fn(),
    vesselFindMany: vi.fn(),
    createManyAndReturn: vi.fn(),
    activityCreateMany: vi.fn(),
  };

  beforeEach(() => {
    Object.values(mocks).forEach((m) => m.mockReset());
    mocks.orgFind.mockResolvedValue({ name: "Gurudeva Bioplants", plan: "free", planStatus: "trialing", vesselLimitOverride: null });
    mocks.cultivarFindFirst.mockResolvedValue(null);
    mocks.cultivarCreate.mockResolvedValue({ id: "cult-1", name: "Banana G9" });
    mocks.vesselFindMany.mockResolvedValue([]);
    mocks.createManyAndReturn.mockImplementation(async ({ data }: { data: { barcode: string }[] }) => data.map((d, i) => ({ id: `v${i}`, barcode: d.barcode })));
    const p = prisma as unknown as Record<string, Record<string, unknown>>;
    p.organization.findUnique = mocks.orgFind;
    p.cultivar.findFirst = mocks.cultivarFindFirst;
    p.cultivar.create = mocks.cultivarCreate;
    p.vessel.findMany = mocks.vesselFindMany;
    p.vessel.createManyAndReturn = mocks.createManyAndReturn;
    p.vessel.count = vi.fn().mockResolvedValue(0);
    p.activity.createMany = mocks.activityCreateMany;
  });

  it("creates the cultivar and numbered vessels with no barcode input", async () => {
    const { POST } = await import("@/app/api/onboarding/first-vessels/route");
    const res = await POST(makeRequest({ cultivarName: "Banana G9", count: 3, stage: "multiplication" }));
    const data = await res.json();
    expect(res.status).toBe(201);
    expect(data.barcodes).toEqual(["GURU-0001", "GURU-0002", "GURU-0003"]);
    expect(mocks.cultivarCreate).toHaveBeenCalledOnce();
    expect(mocks.createManyAndReturn.mock.calls[0][0].data[0]).toMatchObject({ cultivarId: "cult-1", organizationId: "test-org-id", stage: "multiplication" });
    expect(mocks.activityCreateMany.mock.calls[0][0].data).toHaveLength(3);
  });

  it("reuses an existing cultivar with the same name", async () => {
    mocks.cultivarFindFirst.mockResolvedValue({ id: "cult-9", name: "Banana G9" });
    const { POST } = await import("@/app/api/onboarding/first-vessels/route");
    const res = await POST(makeRequest({ cultivarName: "banana g9", count: 1 }));
    expect(res.status).toBe(201);
    expect(mocks.cultivarCreate).not.toHaveBeenCalled();
  });

  it("refuses a count larger than the plan's remaining room", async () => {
    (prisma as unknown as { vessel: { count: unknown } }).vessel.count = vi.fn().mockResolvedValue(995);
    const { POST } = await import("@/app/api/onboarding/first-vessels/route");
    const res = await POST(makeRequest({ cultivarName: "Banana", count: 10 }));
    expect(res.status).toBe(403);
    expect((await res.json()).error).toContain("room for 5 more vessels");
    expect(mocks.createManyAndReturn).not.toHaveBeenCalled();
  });

  it("looks for taken numbers only inside the lab", async () => {
    const { POST } = await import("@/app/api/onboarding/first-vessels/route");
    await POST(makeRequest({ cultivarName: "Banana", count: 1 }));
    expect(mocks.vesselFindMany.mock.calls[0][0].where).toMatchObject({ organizationId: "test-org-id" });
  });

  it("rejects a missing name and an oversized count", async () => {
    const { POST } = await import("@/app/api/onboarding/first-vessels/route");
    expect((await POST(makeRequest({ cultivarName: "  ", count: 5 }))).status).toBe(400);
    expect((await POST(makeRequest({ cultivarName: "Banana", count: 5000 }))).status).toBe(400);
    expect(mocks.createManyAndReturn).not.toHaveBeenCalled();
  });
});
