import { STAGES } from "@/lib/constants";

export function forecastParameters(values: { weeks: string; multiplication: string; lossPercent: string; advancePercent: string; interval: string }) {
  const weeks = Number(values.weeks);
  const multiplication = Number(values.multiplication);
  const loss = Number(values.lossPercent);
  const advance = Number(values.advancePercent);
  const interval = Number(values.interval);
  if (Object.values(values).some((value) => !value.trim()) || ![weeks, multiplication, loss, advance, interval].every(Number.isFinite) || weeks < 1 || weeks > 52 || multiplication < 1 || loss < 0 || loss > 100 || advance < 0 || advance > 100 || loss + advance > 100 || interval < 1 || !Number.isInteger(interval)) return null;
  return { weeksToForecast: weeks, multiplicationRate: multiplication, lossRate: loss / 100, advanceRate: advance / 100, subcultureIntervalWeeks: interval };
}

export async function loadCultivarStageCounts(cultivarId: string, signal?: AbortSignal) {
  const entries = await Promise.all(STAGES.map(async (stage) => {
    const params = new URLSearchParams({ cultivarId, stage, excludeStatuses: "media_filled,multiplied,disposed", limit: "1" });
    const response = await fetch(`/api/vessels?${params}`, { signal });
    if (!response.ok) throw new Error("Could not load this cultivar’s active vessels.");
    const data = await response.json();
    if (typeof data.total !== "number") throw new Error("Vessel counts are unavailable.");
    return [stage, data.total] as const;
  }));
  return Object.fromEntries(entries);
}
