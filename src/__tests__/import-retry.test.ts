import { describe, expect, it } from "vitest";
import { failedRowsCsv } from "@/app/import/failed-rows";

describe("failed CSV row recovery", () => {
  it("retains the failed row when barcode overrides an earlier id alias", () => {
    const csv = "id,barcode\nsourceA,TC0001\nsourceB,TC0002";
    expect(failedRowsCsv(csv, new Set(["TC0002"])) ).toBe("id,barcode\nsourceB,TC0002");
  });
  it("uses the last nonempty alias, including code after barcode", () => {
    const csv = "barcode,code,id,notes\nTC0001,,sourceA,first\nTC0002,TC0003,,failed";
    expect(failedRowsCsv(csv, new Set(["TC0003"])) ).toBe("barcode,code,id,notes\nTC0002,TC0003,,failed");
  });
  it("keeps an earlier barcode when later aliases are empty", () => {
    const csv = "barcode,code,id\nTC0001,,\nTC0002,,";
    expect(failedRowsCsv(csv, new Set(["TC0002"])) ).toBe("barcode,code,id\nTC0002,,");
  });
  it("normalizes aliases as the API does while preserving the original row", () => {
    const csv = "Record Barcode,ID,notes\r\nsource, TC0002 ,Keep original whitespace\r\n";
    expect(failedRowsCsv(csv, new Set(["TC0002"])) ).toBe("Record Barcode,ID,notes\nsource, TC0002 ,Keep original whitespace");
  });
});
