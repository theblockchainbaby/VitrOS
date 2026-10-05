"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/page-header";
import { StageBadge } from "@/components/status-badge";
import { generateBarcodeSVG, generateQRCodeDataURL, printLabels, generateVesselZPL, printZPLViaBrowserPrint, getZebraPrinters } from "@/lib/label-generator";
import type { Vessel } from "@/lib/types";
import { toast } from "sonner";
import { format } from "date-fns";

type LabelFormat = "barcode" | "qr" | "both";
type LabelSize = "small" | "medium" | "large";
type PrintMode = "browser" | "zebra";

// Label values are operator-supplied (barcodes, cultivar names) and get
// interpolated into print-window HTML. Escape them so a crafted value cannot
// inject markup or event handlers into the print document.
const escapeHtml = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

export default function LabelsPage() {
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [barcodeInput, setBarcodeInput] = useState("");
  const [labelFormat, setLabelFormat] = useState<LabelFormat>("barcode");
  const [labelSize, setLabelSize] = useState<LabelSize>("medium");
  const [printMode, setPrintMode] = useState<PrintMode>("browser");
  const [zebraAvailable, setZebraAvailable] = useState<boolean | null>(null);
  const [zebraPrinterName, setZebraPrinterName] = useState<string>("");
  const [printing, setPrinting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [printStatus, setPrintStatus] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [previewBarcode, setPreviewBarcode] = useState("");
  const [previewQr, setPreviewQr] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const addByBarcode = async () => {
    if (!barcodeInput.trim() || loading) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/vessels/barcode?code=${encodeURIComponent(barcodeInput.trim())}`);
      if (res.ok) {
        const data = await res.json();
        if (data.found && data.vessel) {
          const vessel = data.vessel;
          if (!vessels.some((v) => v.id === vessel.id)) {
            setVessels((prev) => [...prev, vessel]);
          }
          setSelected((prev) => new Set([...prev, vessel.id]));
          toast.success(`Added ${vessel.barcode}`);
        } else {
          toast.error("Vessel not found");
        }
        // Definitive answer either way: clear the field for the next scan
        setBarcodeInput("");
      } else {
        // Server error: keep the scanned barcode so the operator can retry
        toast.error("Lookup failed. Try again.");
      }
    } catch {
      // Rejected fetch or invalid response: keep the barcode, allow retry
      toast.error("Network error. The scanned barcode was kept, try again.");
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const loadRecentVessels = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch("/api/vessels?limit=20");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setVessels((previous) => {
        const merged = new Map(previous.map((v) => [v.id, v]));
        (data.vessels || []).forEach((v: Vessel) => merged.set(v.id, v));
        return [...merged.values()];
      });
    } catch {
      setLoadError("Recent vessels could not be loaded. You can retry or add a vessel by barcode.");
    } finally {
      setLoading(false);
    }
  };

  const checkZebra = async () => {
    const printers = await getZebraPrinters();
    setZebraAvailable(printers.length > 0);
    setZebraPrinterName(printers[0]?.name || "");
  };

  useEffect(() => {
    loadRecentVessels();
    checkZebra();
  }, []);

  const previewVessel = vessels.find((v) => selected.has(v.id));
  useEffect(() => {
    let cancelled = false;
    setPreviewBarcode("");
    setPreviewQr("");
    setPreviewError(null);
    if (previewVessel) {
      if (labelFormat !== "qr") {
        try {
          setPreviewBarcode(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(generateBarcodeSVG(previewVessel.barcode))}`);
        } catch {
          setPreviewError("This barcode contains characters Code128 cannot encode. Choose QR Code to preview and print this vessel label.");
        }
      }
      if (labelFormat !== "barcode") {
        generateQRCodeDataURL(previewVessel.barcode).then((url) => { if (!cancelled) setPreviewQr(url); }).catch(() => { if (!cancelled) setPreviewError("The QR preview could not be generated. Select the label again to retry."); });
      }
    }
    return () => { cancelled = true; };
  }, [previewVessel, labelFormat]);

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    setSelected(new Set(vessels.map((v) => v.id)));
  };

  const clearSelection = () => {
    setSelected(new Set());
  };

  const sizeStyles: Record<LabelSize, { width: string; fontSize: string }> = {
    small: { width: "180px", fontSize: "8px" },
    medium: { width: "250px", fontSize: "10px" },
    large: { width: "350px", fontSize: "12px" },
  };

  const handleZebraPrint = async () => {
    const selectedVessels = vessels.filter((v) => selected.has(v.id));
    if (printing) return;
    if (selectedVessels.length === 0) {
      toast.error("Select at least one vessel");
      return;
    }
    setPrinting(true);
    setPrintStatus(null);
    let sent = 0;
    try {
      for (const v of selectedVessels) {
        const zpl = generateVesselZPL({
          barcode: v.barcode,
          cultivar: v.cultivar?.name,
          stage: v.stage,
          subcultureNumber: v.subcultureNumber,
          plantedAt: v.plantedAt || v.createdAt,
        });
        const result = await printZPLViaBrowserPrint(zpl);
        if (!result.success) {
          setPrintStatus(`${sent} of ${selectedVessels.length} labels sent. ${result.error || "Sending failed"}. Check the printer before retrying.`);
          toast.error(result.error || "Print failed");
          return;
        }
        sent++;
      }
      setPrintStatus(`${sent} labels sent to Zebra Browser Print. Check the printed labels and scan one to verify the output.`);
      toast.success(`Sent ${selectedVessels.length} label${selectedVessels.length !== 1 ? "s" : ""} to Zebra printer`);
    } catch {
      setPrintStatus(`${sent} of ${selectedVessels.length} labels sent. Sending was interrupted; check the printer before retrying.`);
    } finally {
      setPrinting(false);
    }
  };

  const handlePrint = async () => {
    const selectedVessels = vessels.filter((v) => selected.has(v.id));
    if (printing) return;
    if (selectedVessels.length === 0) {
      toast.error("Select at least one vessel");
      return;
    }

    // Open the print window during the click gesture. Opening it after the
    // async QR generation below gets popup-blocked in some browsers.
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("Print window was blocked. Allow popups for this site and try again.");
      return;
    }

    setPrinting(true);
    setPrintStatus(null);
    try {
    const style = sizeStyles[labelSize];

    // Pre-generate QR images so QR labels print real, scannable codes
    const qrByVesselId = new Map<string, string>();
    if (labelFormat === "qr" || labelFormat === "both") {
      try {
        await Promise.all(
          selectedVessels.map(async (v) => {
            qrByVesselId.set(v.id, await generateQRCodeDataURL(v.barcode));
          })
        );
      } catch {
        printWindow.close();
        toast.error("Failed to generate QR codes");
        return;
      }
    }

    const labelsHTML = selectedVessels.map((v) => {
      let barcodeHTML = "";
      if (labelFormat === "barcode" || labelFormat === "both") {
        barcodeHTML = `<div class="label-barcode">${generateBarcodeSVG(v.barcode)}</div>`;
      }
      if (labelFormat === "qr" || labelFormat === "both") {
        const qr = qrByVesselId.get(v.id);
        if (qr) {
          const safeBarcode = escapeHtml(v.barcode);
          barcodeHTML += `<div class="label-barcode"><img src="${escapeHtml(qr)}" alt="QR ${safeBarcode}" style="width: 96px; height: 96px;" /><div style="font-family: monospace; font-size: 10px;">${safeBarcode}</div></div>`;
        }
      }

      return `
        <div class="label" style="width: ${style.width}; font-size: ${style.fontSize};">
          ${barcodeHTML}
          ${v.cultivar?.name ? `<div class="label-cultivar">${escapeHtml(v.cultivar.name)}</div>` : ""}
          ${v.stage ? `<div class="label-stage">${escapeHtml(v.stage.toUpperCase())}</div>` : ""}
          <div class="label-date">${format(new Date(v.createdAt), "MM/dd/yyyy")}</div>
        </div>
      `;
    }).join("");

    if (printLabels(labelsHTML, printWindow)) {
      setPrintStatus(`Print window opened for ${selectedVessels.length} labels. Choose your printer and paper size there, then check the printed output.`);
      toast.success("Print window ready");
    } else {
      toast.error("Could not open the print window");
    }
    } catch {
      printWindow.close();
      toast.error("Labels could not be prepared. Your selection has been kept.");
    } finally {
      setPrinting(false);
    }
  };

  return (
    <div className="min-w-0 space-y-6">
      <PageHeader
        title="Label Printing"
        description="Generate and print barcode labels for vessels"
        actions={<Button asChild variant="outline" size="sm"><Link href="/integrations">Device setup</Link></Button>}
      />
      <p className="text-sm text-muted-foreground">1. Select vessels · 2. Choose label format and printer · 3. Print and verify a label</p>

      {/* Scanner */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-wrap gap-3">
            <Input
              ref={inputRef}
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addByBarcode()}
              placeholder="Scan barcode to add..."
              className="min-w-0 flex-1 h-12 font-mono"
              aria-label="Vessel barcode to add"
              disabled={loading}
            />
            <Button className="min-h-12" onClick={addByBarcode} disabled={loading}>Add</Button>
          </div>
        </CardContent>
      </Card>

      {loadError && <div role="alert" className="rounded-lg border p-4 space-y-2"><p className="text-sm">{loadError}</p><Button variant="outline" size="sm" disabled={loading} onClick={loadRecentVessels}>Retry recent vessels</Button></div>}
      {printStatus && <p role="status" className="rounded-lg border bg-muted/40 p-4 text-sm">{printStatus}</p>}
      {/* Vessel selection */}
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle className="text-base">Select Vessels ({selected.size} selected)</CardTitle>
            <div className="flex flex-wrap gap-2">
              <Button variant="ghost" size="sm" onClick={selectAll}>Select All</Button>
              <Button variant="ghost" size="sm" onClick={clearSelection}>Clear</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading && vessels.length === 0 ? <p role="status" className="py-4 text-sm text-muted-foreground">Loading recent vessels…</p> : vessels.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No vessels loaded. Scan barcodes or load recent vessels.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10"></TableHead>
                  <TableHead>Barcode</TableHead>
                  <TableHead>Cultivar</TableHead>
                  <TableHead>Stage</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vessels.map((v) => (
                  <TableRow key={v.id} data-state={selected.has(v.id) ? "selected" : undefined}>
                    <TableCell>
                      <input
                        type="checkbox"
                        id={`label-${v.id}`}
                        aria-label={`Select ${v.barcode}`}
                        checked={selected.has(v.id)}
                        onChange={() => toggleSelect(v.id)}
                        className="size-4 rounded accent-primary"
                      />
                    </TableCell>
                    <TableCell><label htmlFor={`label-${v.id}`} className="cursor-pointer font-mono">{v.barcode}</label></TableCell>
                    <TableCell>{v.cultivar?.name || "—"}</TableCell>
                    <TableCell><StageBadge stage={v.stage} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex flex-wrap items-center justify-between gap-3">
            <span>Label Settings</span>
            <div className="flex items-center gap-1 bg-muted rounded-lg p-1 text-sm">
              <button
                aria-pressed={printMode === "browser"}
                onClick={() => setPrintMode("browser")}
                className={`px-3 py-1 rounded-md transition-colors ${printMode === "browser" ? "bg-background shadow-sm font-medium" : "text-muted-foreground"}`}
              >
                Browser Print
              </button>
              <button
                aria-pressed={printMode === "zebra"}
                onClick={() => setPrintMode("zebra")}
                className={`px-3 py-1 rounded-md transition-colors ${printMode === "zebra" ? "bg-background shadow-sm font-medium" : "text-muted-foreground"}`}
              >
                Zebra ZD421
              </button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {previewVessel && printMode === "browser" && (
            <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
              <p className="text-sm font-medium break-all">Preview · {previewVessel.barcode}</p>
              {previewError && <p role="alert" className="text-sm text-destructive">{previewError}</p>}
              <div className="max-w-full overflow-auto">
                <div className="rounded border bg-white text-black p-3 text-center space-y-1" style={{ width: sizeStyles[labelSize].width, fontSize: sizeStyles[labelSize].fontSize }}>
                  {/* eslint-disable-next-line @next/next/no-img-element -- Generated SVG must preserve barcode bars and quiet zones without image optimization. */}
                  {previewBarcode && <img src={previewBarcode} alt={`Barcode ${previewVessel.barcode}`} className="max-w-full mx-auto" />}
                  {/* eslint-disable-next-line @next/next/no-img-element -- Generated QR data URL is a local print preview, not a network image. */}
                  {previewQr && <img src={previewQr} alt={`QR code ${previewVessel.barcode}`} className="size-24 mx-auto" />}
                  {labelFormat === "qr" && <p className="font-mono break-all">{previewVessel.barcode}</p>}
                  <p className="font-semibold">{previewVessel.cultivar?.name}</p>
                  <p>{previewVessel.stage?.toUpperCase()}</p>
                  <p>{format(new Date(previewVessel.createdAt), "MM/dd/yyyy")}</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">Preview of the first selected vessel. Confirm dimensions and scale in your browser print dialog; print one label and scan it before a full run.</p>
            </div>
          )}
          {printMode === "browser" ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 [&>*]:min-w-0 [&>*]:break-words">
              <div>
                <Label htmlFor="labels-field-1">Format</Label>
                <Select value={labelFormat} onValueChange={(v) => setLabelFormat(v as LabelFormat)}>
                  <SelectTrigger id="labels-field-1" className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="barcode">Barcode Only</SelectItem>
                    <SelectItem value="qr">QR Code</SelectItem>
                    <SelectItem value="both">Both</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="labels-field-2">Size</Label>
                <Select value={labelSize} onValueChange={(v) => setLabelSize(v as LabelSize)}>
                  <SelectTrigger id="labels-field-2" className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Small (1&quot; x 0.5&quot;)</SelectItem>
                    <SelectItem value="medium">Medium (2&quot; x 1&quot;)</SelectItem>
                    <SelectItem value="large">Large (3&quot; x 1.5&quot;)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button onClick={handlePrint} disabled={selected.size === 0 || printing} className="min-h-11 w-full">
                  {printing ? "Preparing labels…" : `Print ${selected.size} Label${selected.size !== 1 ? "s" : ""}`}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className={`flex items-center gap-2 p-3 rounded-lg border text-sm ${
                zebraAvailable === true ? "bg-primary/5 border-primary/20 text-primary" :
                zebraAvailable === false ? "bg-amber-500/10 border-amber-600/30 text-amber-800 dark:text-amber-300" :
                "bg-muted border-border text-muted-foreground"
              }`}>
                <div className={`size-2 rounded-full ${zebraAvailable === true ? "bg-primary" : zebraAvailable === false ? "bg-amber-600" : "bg-muted-foreground"}`} />
                {zebraAvailable === true ? (
                  <span>Device detected — {zebraPrinterName || "Zebra Browser Print"}</span>
                ) : zebraAvailable === false ? (
                  <span>
                    Zebra Browser Print not detected.{" "}
                    <a href="https://www.zebra.com/us/en/software/zebra-utilities/browser-print.html" target="_blank" rel="noopener noreferrer" className="underline">
                      Download here
                    </a>
                  </span>
                ) : (
                  <span>Checking for Zebra Browser Print...</span>
                )}
                <button onClick={checkZebra} className="min-h-11 ml-auto text-xs underline">Refresh</button>
              </div>
              <p className="text-xs text-muted-foreground">
                ZPL labels are formatted for 2.25&quot; x 1.25&quot; thermal labels (Zebra ZD421). Includes barcode, cultivar, stage, and subculture number.
              </p>
              <Button
                onClick={handleZebraPrint}
                disabled={selected.size === 0 || printing || zebraAvailable !== true}
                className="min-h-11 w-full"
              >
                {printing ? "Sending to printer..." : `Print ${selected.size} Label${selected.size !== 1 ? "s" : ""} via Zebra`}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>


    </div>
  );
}
