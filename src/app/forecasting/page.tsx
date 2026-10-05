"use client";

import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { Download } from "lucide-react";
import { generateForecast, type ForecastPoint } from "@/lib/forecasting";
import { PageLoading, PageError } from "@/components/page-state";
import { STAGE_COLORS } from "@/lib/design-tokens";
import { forecastParameters, loadCultivarStageCounts } from "./forecast-inputs";
import { STAGE_LABELS } from "@/lib/constants";
import type { DashboardStats } from "@/lib/types";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

interface CultivarOption {
  id: string;
  name: string;
  stageConfig?: {
    stages: { name: string; durationWeeks: number; multiplicationRate: number; survivalRate: number }[];
  } | null;
}

export default function ForecastingPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [cultivars, setCultivars] = useState<CultivarOption[]>([]);
  const [selectedCultivar, setSelectedCultivar] = useState("all");
  const [cultivarInventory, setCultivarInventory] = useState<{ id: string; counts: Record<string, number> } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);
  const [weeks, setWeeks] = useState("8");
  const [multRate, setMultRate] = useState("3.0");
  const [lossRate, setLossRate] = useState("5");
  const [advanceRate, setAdvanceRate] = useState("70");
  const [subcultureWeeks, setSubcultureWeeks] = useState("2");

  useEffect(() => {
    const controller = new AbortController();
    Promise.all([fetch("/api/stats", { signal: controller.signal }), fetch("/api/cultivars", { signal: controller.signal })])
      .then(async (responses) => {
        if (responses.some((response) => !response.ok)) throw new Error("Could not load forecast inputs.");
        const [statsData, cultivarData] = await Promise.all(responses.map((response) => response.json()));
        setStats(statsData);
        setCultivars(Array.isArray(cultivarData) ? cultivarData : cultivarData.cultivars || []);
      }).catch((err) => { if (!controller.signal.aborted) setError(err.message); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [revision]);

  useEffect(() => {
    if (selectedCultivar === "all") return;
    const controller = new AbortController();
    loadCultivarStageCounts(selectedCultivar, controller.signal)
      .then((counts) => setCultivarInventory({ id: selectedCultivar, counts }))
      .catch((err) => { if (!controller.signal.aborted) setError(err.message); });
    return () => controller.abort();
  }, [selectedCultivar, revision]);

  const currentByStage = useMemo(() => selectedCultivar === "all"
    ? stats ? Object.fromEntries(stats.vesselsByStage.map((stage) => [stage.stage, stage.count])) : null
    : cultivarInventory?.id === selectedCultivar ? cultivarInventory.counts : null, [stats, selectedCultivar, cultivarInventory]);

  // When a cultivar with stageConfig is selected, pre-fill parameters
  const handleCultivarChange = (value: string) => {
    setError("");
    setSelectedCultivar(value);
    if (value !== "all") {
      const cv = cultivars.find((c) => c.id === value);
      if (cv?.stageConfig?.stages?.length) {
        const multStage = cv.stageConfig.stages.find((s) => s.name === "multiplication");
        if (multStage) {
          setMultRate(String(multStage.multiplicationRate));
          setLossRate(String(Math.round((1 - multStage.survivalRate) * 10000) / 100));
        }
      }
    }
  };

  const parameters = forecastParameters({ weeks, multiplication: multRate, lossPercent: lossRate, advancePercent: advanceRate, interval: subcultureWeeks });
  const forecast: ForecastPoint[] = useMemo(() => {
    const params = forecastParameters({ weeks, multiplication: multRate, lossPercent: lossRate, advancePercent: advanceRate, interval: subcultureWeeks });
    return currentByStage && params ? generateForecast({ currentByStage, ...params }) : [];
  }, [currentByStage, weeks, multRate, lossRate, advanceRate, subcultureWeeks]);

  const finalPoint = forecast[forecast.length - 1];

  function handleExportCSV() {
    if (forecast.length === 0) return;
    const header = "Week,Date,Initiation,Multiplication,Rooting,Acclimation,Hardening,Total";
    const rows = forecast.map((p) =>
      [p.week, p.date, p.initiation, p.multiplication, p.rooting, p.acclimation, p.hardening, p.total].join(",")
    );
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `forecast-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader
          title="Production Forecasting"
          description="Project vessel counts by stage over time"
        />
        {forecast.length > 0 && !error && !loading && (
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <Download className="size-4 mr-1.5" /> Export CSV
          </Button>
        )}
      </div>

      {/* Parameters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Forecast Parameters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-6 gap-4">
            <div>
              <Label>Cultivar</Label>
              <Select value={selectedCultivar} onValueChange={handleCultivarChange}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cultivars</SelectItem>
                  {cultivars.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}{c.stageConfig ? " *" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Weeks Ahead</Label>
              <Select value={weeks} onValueChange={setWeeks}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="4">4 weeks</SelectItem>
                  <SelectItem value="8">8 weeks</SelectItem>
                  <SelectItem value="12">12 weeks</SelectItem>
                  <SelectItem value="20">20 weeks (5 mo)</SelectItem>
                  <SelectItem value="30">30 weeks (7 mo)</SelectItem>
                  <SelectItem value="44">44 weeks (10 mo)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Mult. Rate</Label>
              <Input type="number" min="1" step="0.1" aria-label="Multiplication rate" value={multRate} onChange={(e) => setMultRate(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label>Loss Rate (%)</Label>
              <Input type="number" min="0" max="100" step="0.1" aria-label="Loss rate percent" value={lossRate} onChange={(e) => setLossRate(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label>Advance Rate (%)</Label>
              <Input type="number" min="0" max="100" step="1" aria-label="Advance rate percent" value={advanceRate} onChange={(e) => setAdvanceRate(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label>Subculture (wks)</Label>
              <Input type="number" min="1" aria-label="Subculture interval in weeks" value={subcultureWeeks} onChange={(e) => setSubcultureWeeks(e.target.value)} className="mt-1" />
            </div>
          </div>
        </CardContent>
      </Card>

      <p className="text-sm text-muted-foreground">Starting inventory: {currentByStage ? Object.values(currentByStage).reduce((sum, count) => sum + count, 0).toLocaleString() : "—"} active vessels · {selectedCultivar === "all" ? "All cultivars" : cultivars.find((cultivar) => cultivar.id === selectedCultivar)?.name}. Media preparation, multiplied and disposed vessels are excluded. Projections use your assumptions; they are not a production commitment.</p>
      {!parameters && <p role="alert" className="text-sm text-destructive">Enter valid rates. Loss and advance must each be 0–100%, with a combined maximum of 100%. Multiplication and the whole-week interval must be at least 1.</p>}
      {error ? <PageError message={error} retry={() => { setLoading(true); setError(""); setCultivarInventory(null); setRevision((value) => value + 1); }} /> : (loading || !currentByStage) && <PageLoading label="Loading starting inventory…" />}
      {/* Chart */}
      {forecast.length > 0 && !error && !loading && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Projected Vessel Counts
              {finalPoint && (
                <span className="text-muted-foreground font-normal ml-2">
                  (Week {finalPoint.week}: {finalPoint.total.toLocaleString()} total)
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer minWidth={0} width="100%" height={350}>
              <AreaChart data={forecast}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(d) => d.slice(5)} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  labelFormatter={(label) => `Date: ${label}`}
                  formatter={(value, name) => [
                    Number(value).toLocaleString(),
                    STAGE_LABELS[name as string] || name,
                  ]}
                />
                <Legend formatter={(value) => STAGE_LABELS[value] || value} />
                <Area type="monotone" dataKey="initiation" stackId="1" stroke={STAGE_COLORS.initiation} fill={STAGE_COLORS.initiation} fillOpacity={0.6} />
                <Area type="monotone" dataKey="multiplication" stackId="1" stroke={STAGE_COLORS.multiplication} fill={STAGE_COLORS.multiplication} fillOpacity={0.6} />
                <Area type="monotone" dataKey="rooting" stackId="1" stroke={STAGE_COLORS.rooting} fill={STAGE_COLORS.rooting} fillOpacity={0.6} />
                <Area type="monotone" dataKey="acclimation" stackId="1" stroke={STAGE_COLORS.acclimation} fill={STAGE_COLORS.acclimation} fillOpacity={0.6} />
                <Area type="monotone" dataKey="hardening" stackId="1" stroke={STAGE_COLORS.hardening} fill={STAGE_COLORS.hardening} fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Week-by-week breakdown */}
      {forecast.length > 0 && !error && !loading && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Week-by-Week Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 pr-4">Week</th>
                    <th className="text-left py-2 pr-4">Date</th>
                    {Object.keys(STAGE_LABELS).map((s) => (
                      <th key={s} className="text-right py-2 px-2">{STAGE_LABELS[s]}</th>
                    ))}
                    <th className="text-right py-2 pl-4 font-bold">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {forecast.map((p) => (
                    <tr key={p.week} className="border-b last:border-0">
                      <td className="py-2 pr-4 font-mono">{p.week}</td>
                      <td className="py-2 pr-4 text-muted-foreground">{p.date.slice(5)}</td>
                      <td className="text-right py-2 px-2 font-mono">{p.initiation}</td>
                      <td className="text-right py-2 px-2 font-mono">{p.multiplication}</td>
                      <td className="text-right py-2 px-2 font-mono">{p.rooting}</td>
                      <td className="text-right py-2 px-2 font-mono">{p.acclimation}</td>
                      <td className="text-right py-2 px-2 font-mono">{p.hardening}</td>
                      <td className="text-right py-2 pl-4 font-mono font-bold">{p.total.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
