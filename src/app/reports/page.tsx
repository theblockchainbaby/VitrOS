"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/page-header";
import { exportToCSV, flattenVesselForExport, flattenActivityForExport } from "@/lib/csv-export";
import { toast } from "sonner";

type ReportType = "vessels" | "activity" | "production" | "contamination";

export default function ReportsPage() {
  const [reportType, setReportType] = useState<ReportType>("vessels");
  const [generatingCSV, setGeneratingCSV] = useState(false);
  const [generatingPDF, setGeneratingPDF] = useState(false);

  const generateCSV = async (type: ReportType) => {
    setGeneratingCSV(true);
    try {
      switch (type) {
        case "vessels": {
          const res = await fetch("/api/vessels?limit=10000");
          if (!res.ok) throw new Error("Report data is unavailable. Please try again.");
          const data = await res.json();
          const rows = (data.vessels || []).map((v: Record<string, unknown>) => flattenVesselForExport(v));
          exportToCSV(rows, `vessels-report-${new Date().toISOString().split("T")[0]}`);
          toast.success(`Exported ${rows.length} vessels`);
          break;
        }
        case "activity": {
          const res = await fetch("/api/activities?limit=10000");
          if (!res.ok) throw new Error("Report data is unavailable. Please try again.");
          const data = await res.json();
          const activities = Array.isArray(data) ? data : data.activities || [];
          const rows = activities.map((a: Record<string, unknown>) => flattenActivityForExport(a));
          exportToCSV(rows, `activity-report-${new Date().toISOString().split("T")[0]}`);
          toast.success(`Exported ${rows.length} activities`);
          break;
        }
        case "production": {
          const [statsRes, analyticsRes] = await Promise.all([
            fetch("/api/stats"),
            fetch("/api/stats/analytics?period=month"),
          ]);
          if (!statsRes.ok || !analyticsRes.ok) throw new Error("Report data is unavailable");
          const stats = await statsRes.json();
          const analytics = await analyticsRes.json();

          const rows = [
            { metric: "Active Vessels", value: stats.activeVessels },
            { metric: "Total Vessels", value: stats.totalVessels },
            { metric: "Total Explants", value: stats.totalExplants },
            { metric: "Contamination Rate (%)", value: analytics.contaminationRate },
            { metric: "Multiplication Rate (%)", value: analytics.multiplicationRate },
            ...(stats.vesselsByStage || []).map((s: { stage: string; count: number }) => ({
              metric: `Stage: ${s.stage}`,
              value: s.count,
            })),
            ...(stats.vesselsByCultivar || []).map((c: { cultivarName: string; vesselCount: number; explantCount: number }) => ({
              metric: `Cultivar: ${c.cultivarName}`,
              value: `${c.vesselCount} vessels / ${c.explantCount} explants`,
            })),
          ];
          exportToCSV(rows, `production-summary-${new Date().toISOString().split("T")[0]}`);
          toast.success("Production summary exported");
          break;
        }
        case "contamination": {
          const analyticsRes = await fetch("/api/stats/analytics?period=quarter");
          if (!analyticsRes.ok) throw new Error("Report data is unavailable");
          const analytics = await analyticsRes.json();

          const rows = [
            { category: "Overall Contamination Rate", detail: "", count: `${analytics.contaminationRate}%` },
            ...analytics.contaminationByType.map((c: { type: string; count: number }) => ({
              category: "By Type",
              detail: c.type,
              count: c.count,
            })),
            ...analytics.contaminationByCultivar.map((c: { cultivar: string; count: number }) => ({
              category: "By Cultivar",
              detail: c.cultivar,
              count: c.count,
            })),
          ];
          exportToCSV(rows, `contamination-report-${new Date().toISOString().split("T")[0]}`);
          toast.success("Contamination report exported");
          break;
        }
      }
    } catch {
      toast.error("Failed to generate report");
    } finally {
      setGeneratingCSV(false);
    }
  };

  const generatePDF = async (type: ReportType) => {
    setGeneratingPDF(true);
    try {
      const res = await fetch(`/api/reports/pdf?type=${type}`);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to generate PDF");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `vitros-${type}-report-${new Date().toISOString().split("T")[0]}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success("PDF report downloaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to generate PDF");
    } finally {
      setGeneratingPDF(false);
    }
  };

  const reportDescriptions: Record<ReportType, string> = {
    vessels: "Vessel inventory with cultivar, stage, status, health, and location data.",
    activity: "Recent vessel operations with timestamps and user attribution.",
    production: "Summary of active vessels, pipeline stages, cultivar breakdown, and key metrics.",
    contamination: "Contamination breakdown by type and cultivar; reporting scope depends on format.",
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title="Reports"
        description="Generate and download reports as CSV or PDF"
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Generate Report</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Select value={reportType} onValueChange={(v) => setReportType(v as ReportType)}>
              <SelectTrigger aria-label="Report type"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="vessels">Vessel Report</SelectItem>
                <SelectItem value="activity">Activity Log</SelectItem>
                <SelectItem value="production">Production Summary</SelectItem>
                <SelectItem value="contamination">Contamination Report</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <p className="text-sm text-muted-foreground">{reportDescriptions[reportType]}</p>
          <div className="rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground space-y-1">
            {(reportType === "vessels" || reportType === "activity") ? <p>CSV includes up to 10,000 records. PDF includes the latest 500 records. Both use your workspace scope.</p> : reportType === "production" ? <><p>CSV: current planted pipeline, current contamination ratio, and multiplication events from the past month.</p><p>PDF: current inventory, including media preparation, and lifetime contamination/multiplication ratios. These scopes differ.</p></> : <><p>CSV: current active contamination rate and lifetime breakdown by type and cultivar.</p><p>PDF: contamination recorded in the last three months, relative to vessels created in that period. These scopes differ.</p></>}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button onClick={() => generateCSV(reportType)} disabled={generatingCSV || generatingPDF} variant="outline" className="flex-1">
              {generatingCSV ? "Generating..." : "Download CSV"}
            </Button>
            <Button onClick={() => generatePDF(reportType)} disabled={generatingCSV || generatingPDF} className="flex-1">
              {generatingPDF ? "Generating..." : "Download PDF"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quick Download</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <ReportOption
              disabled={generatingCSV || generatingPDF}
              title="Vessel Report"
              description="Inventory with metadata; export limits apply"
              onCSV={() => { setReportType("vessels"); generateCSV("vessels"); }}
              onPDF={() => { setReportType("vessels"); generatePDF("vessels"); }}
            />
            <ReportOption
              disabled={generatingCSV || generatingPDF}
              title="Activity Log"
              description="Recent vessel operations; export limits apply"
              onCSV={() => { setReportType("activity"); generateCSV("activity"); }}
              onPDF={() => { setReportType("activity"); generatePDF("activity"); }}
            />
            <ReportOption
              disabled={generatingCSV || generatingPDF}
              title="Production Summary"
              description="KPIs, pipeline stages, and cultivar metrics"
              onCSV={() => { setReportType("production"); generateCSV("production"); }}
              onPDF={() => { setReportType("production"); generatePDF("production"); }}
            />
            <ReportOption
              disabled={generatingCSV || generatingPDF}
              title="Contamination Report"
              description="Contamination rates by type and cultivar"
              onCSV={() => { setReportType("contamination"); generateCSV("contamination"); }}
              onPDF={() => { setReportType("contamination"); generatePDF("contamination"); }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ReportOption({
  title,
  description,
  disabled,
  onCSV,
  onPDF,
}: {
  title: string;
  description: string;
  disabled: boolean;
  onCSV: () => void;
  onPDF: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-4 rounded-lg border">
      <div>
        <p className="font-medium text-sm">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <div className="flex gap-1.5 shrink-0">
        <Button variant="outline" size="sm" disabled={disabled} aria-label={`Download ${title} as CSV`}
          onClick={onCSV}
          className="text-xs px-2 py-1 rounded border hover:bg-accent transition-colors"
        >
          CSV
        </Button>
        <Button size="sm" disabled={disabled} aria-label={`Download ${title} as PDF`}
          onClick={onPDF}
          className="text-xs px-2 py-1 rounded bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          PDF
        </Button>
      </div>
    </div>
  );
}
