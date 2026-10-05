import { afterEach, describe, expect, it, vi } from "vitest";
import { forecastParameters, loadCultivarStageCounts } from "@/app/forecasting/forecast-inputs";

const defaults = { weeks: "8", multiplication: "3", lossPercent: "5", advancePercent: "70", interval: "2" };

afterEach(() => vi.unstubAllGlobals());

describe("forecast inputs", () => {
  it("converts displayed percentages to model fractions", () => {
    expect(forecastParameters(defaults)).toMatchObject({ lossRate: 0.05, advanceRate: 0.7 });
  });
  it("preserves deliberate zero loss and zero advancement", () => {
    expect(forecastParameters({ ...defaults, lossPercent: "0", advancePercent: "0" })).toMatchObject({ lossRate: 0, advanceRate: 0 });
  });
  it("rejects blank, negative and contradictory assumptions", () => {
    expect(forecastParameters({ ...defaults, lossPercent: "" })).toBeNull();
    expect(forecastParameters({ ...defaults, lossPercent: "-1" })).toBeNull();
    expect(forecastParameters({ ...defaults, advancePercent: "99" })).toBeNull();
    expect(forecastParameters({ ...defaults, interval: "1.5" })).toBeNull();
  });
  it("uses total counts for only the selected cultivar and active stages", async () => {
    const fetchMock = vi.fn(async (url: string) => {
      const params = new URL(url, "http://localhost").searchParams;
      expect(params.get("cultivarId")).toBe("cultivar-42");
      expect(params.get("excludeStatuses")).toBe("media_filled,multiplied,disposed");
      expect(params.get("limit")).toBe("1");
      return { ok: true, json: async () => ({ total: params.get("stage") === "multiplication" ? 180 : 0, vessels: [] }) };
    });
    vi.stubGlobal("fetch", fetchMock);
    const counts = await loadCultivarStageCounts("cultivar-42");
    expect(counts).toEqual({ initiation: 0, multiplication: 180, rooting: 0, acclimation: 0, hardening: 0 });
    expect(fetchMock).toHaveBeenCalledTimes(5);
  });
  it("does not report an empty cultivar when a count request fails", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => ({ ok: false })));
    await expect(loadCultivarStageCounts("cultivar-42")).rejects.toThrow("Could not load");
  });
});
