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
import { generateBarcodeSVG, generateQRCodeDataURL, printLabels, generateVesselZPL, printZPLViaBrowserPrint, getZebraPrinters, downloadZPL, getLabelStock, loadSavedLabelStockId, saveLabelStockId, LABEL_STOCKS, DEFAULT_LABEL_STOCK_ID, type ZebraPrinter } from "@/lib/label-generator";
import type { Vessel } from "@/lib/types";
import { toast } from "sonner";
import { format } from "date-fns";

type LabelFormat = "barcode" | "qr" | "both";
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
  const [stockId, setStockId] = useState(DEFAULT_LABEL_STOCK_ID);
  const stock = getLabelStock(stockId);
  const chooseStock = (id: string) => { setStockId(id); saveLabelStockId(id); };
  const [zebraPrinters, setZebraPrinters] = useState<ZebraPrinter[]>([]);
  const [zebraPrinterUid, setZebraPrinterUid] = useState("");
  const [printMode, setPrintMode] = useState<PrintMode>("browser");
  const [zebraAvailable, setZebraAvailable] = useState<boolean | null>(null);
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
      // Arriving from setup or a cultivar: /labels?cultivarId=... loads that
      // cultivar's vessels and selects them, ready to print.
      const cultivarId = new URLSearchParams(window.location.search).get("cultivarId");
      const query = cultivarId ? `limit=200&cultivarId=${encodeURIComponent(cultivarId)}` : "limit=100";
      const res = await fetch(`/api/vessels?${query}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      const loaded: Vessel[] = data.vessels || [];
      setVessels((previous) => {
        const merged = new Map(previous.map((v) => [v.id, v]));
        loaded.forEach((v) => merged.set(v.id, v));
        return [...merged.values()];
      });
      if (cultivarId) setSelected((prev) => new Set([...prev, ...loaded.map((v) => v.id)]));
    } catch {
      setLoadError("Recent vessels could not be loaded. You can retry or add a vessel by barcode.");
    } finally {
      setLoading(false);
    }
  };

  const checkZebra = async () => {
    const printers = await getZebraPrinters();
    setZebraAvailable(printers.length > 0);
    setZebraPrinters(printers);
    setZebraPrinterUid((current) => (printers.some((p) => p.uid === current) ? current : printers[0]?.uid || ""));
  };

  useEffect(() => {
    setStockId(loadSavedLabelStockId());
    loadRecentVessels();
    checkZebra();
  }, []);

  // The direct Zebra layout needs a label at least 2 in wide.
  const zplStock = stock.zpl ? stock : getLabelStock(DEFAULT_LABEL_STOCK_ID);
  const zebraPrinter = zebraPrinters.find((p) => p.uid === zebraPrinterUid);
  const selectedZPL = () =>
    vessels.filter((v) => selected.has(v.id)).map((v) => generateVesselZPL({
      barcode: v.barcode,
      cultivar: v.cultivar?.name,
      stage: v.stage,
      subcultureNumber: v.subcultureNumber,
      plantedAt: v.plantedAt || v.createdAt,
    }, zplStock));
  const handleDownloadZPL = () => {
    const labels = selectedZPL();
    if (labels.length === 0) { toast.error("Select at least one vessel"); return; }
    downloadZPL(labels.join("\n"));
    setPrintStatus(`Saved ${labels.length} labels as a ZPL file. Send it to your printer with its own utility.`);
  };

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

  // On-screen preview at 96 px per inch, the same proportions as the label.
  const previewStyle = { width: `${stock.widthIn * 96}px`, minHeight: `${stock.heightIn * 96}px`, fontSize: stock.heightIn <= 1 ? "8.5px" : stock.heightIn >= 2 ? "14px" : "10.5px" };

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
        }, zplStock);
        const result = await printZPLViaBrowserPrint(zpl, zebraPrinter);
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
          barcodeHTML += `<div class="label-barcode"><img src="${escapeHtml(qr)}" alt="QR ${safeBarcode}" /></div><div class="label-code">${safeBarcode}</div>`;
        }
      }

      const stageAndDate = [v.stage ? escapeHtml(v.stage.toUpperCase()) : "", format(new Date(v.createdAt), "MM/dd/yyyy")].filter(Boolean).join(" · ");
      return `
        <div class="label">
          ${barcodeHTML}
          ${v.cultivar?.name ? `<div class="label-cultivar">${escapeHtml(v.cultivar.name)}</div>` : ""}
          <div class="label-stage">${stageAndDate}</div>
        </div>
      `;
    }).join("");

    if (printLabels(labelsHTML, printWindow, stock)) {
      setPrintStatus(stock.kind === "roll"
        ? `Print window opened for ${selectedVessels.length} labels, one per ${stock.widthIn} x ${stock.heightIn} in page. Pick your label printer, set scale to 100% and margins to none, then check the first label.`
        : `Print window opened for ${selectedVessels.length} labels on plain paper. Choose your printer there, then check the printed output.`);
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
                Any printer
              </button>
              <button
                aria-pressed={printMode === "zebra"}
                onClick={() => setPrintMode("zebra")}
                className={`px-3 py-1 rounded-md transition-colors ${printMode === "zebra" ? "bg-background shadow-sm font-medium" : "text-muted-foreground"}`}
              >
                Zebra direct
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
                <div className="flex flex-col justify-center overflow-hidden rounded border bg-white px-2 py-1 text-center leading-tight text-black" style={previewStyle}>
                  {/* eslint-disable-next-line @next/next/no-img-element -- Generated SVG must preserve barcode bars and quiet zones without image optimization. */}
                  {previewBarcode && <img src={previewBarcode} alt={`Barcode ${previewVessel.barcode}`} className="mx-auto w-full" style={{ height: `${stock.heightIn * 96 * 0.5}px` }} />}
                  {/* eslint-disable-next-line @next/next/no-img-element -- Generated QR data URL is a local print preview, not a network image. */}
                  {previewQr && <img src={previewQr} alt={`QR code ${previewVessel.barcode}`} className="mx-auto" style={{ height: `${Math.min(stock.heightIn * 0.55, stock.widthIn * 0.5) * 96}px` }} />}
                  {labelFormat !== "barcode" && <p className="font-mono break-all">{previewVessel.barcode}</p>}
                  <p className="truncate font-semibold">{previewVessel.cultivar?.name}</p>
                  <p>{[previewVessel.stage?.toUpperCase(), format(new Date(previewVessel.createdAt), "MM/dd/yyyy")].filter(Boolean).join(" · ")}</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">{stock.kind === "roll" ? `Shown at actual proportions for a ${stock.widthIn} x ${stock.heightIn} in label. Each label prints on its own page at that size. In the print dialog pick your label printer, scale 100%, margins none.` : "Labels are laid out on plain paper to cut out or stick on."} Print one label and scan it before a full run.</p>
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
                <Label htmlFor="labels-field-2">Label stock</Label>
                <Select value={stockId} onValueChange={chooseStock}>
                  <SelectTrigger id="labels-field-2" className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {LABEL_STOCKS.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
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
                  <span>Connected: {zebraPrinter?.name || "Zebra printer"}{zebraPrinters.length > 1 ? ` (${zebraPrinters.length} printers found)` : ""}</span>
                ) : zebraAvailable === false ? (
                  <span>
                    No Zebra printer found. Install and open{" "}
                    <a href="https://www.zebra.com/us/en/software/zebra-utilities/browser-print.html" target="_blank" rel="noopener noreferrer" className="underline">
                      Zebra Browser Print
                    </a>
                    {" "}on this computer, plug in the printer, then press Refresh. Other brands: use Any printer.
                  </span>
                ) : (
                  <span>Checking for Zebra Browser Print...</span>
                )}
                <button onClick={checkZebra} className="min-h-11 ml-auto text-xs underline">Refresh</button>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 [&>*]:min-w-0">
                <div>
                  <Label htmlFor="labels-zebra-stock">Label stock</Label>
                  <Select value={zplStock.id} onValueChange={chooseStock}>
                    <SelectTrigger id="labels-zebra-stock" className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {LABEL_STOCKS.filter((s) => s.zpl).map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                {zebraPrinters.length > 1 && (
                  <div>
                    <Label htmlFor="labels-zebra-printer">Printer</Label>
                    <Select value={zebraPrinterUid} onValueChange={setZebraPrinterUid}>
                      <SelectTrigger id="labels-zebra-printer" className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {zebraPrinters.map((p) => <SelectItem key={p.uid} value={p.uid}>{p.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Sends labels straight to a Zebra printer (ZD, GK, GX and ZT series at 203 dpi) with no print dialog. Each label has the barcode, cultivar, stage and subculture number.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={handleZebraPrint}
                  disabled={selected.size === 0 || printing || zebraAvailable !== true}
                  className="min-h-11 min-w-0 flex-1"
                >
                  {printing ? "Sending to printer..." : `Print ${selected.size} Label${selected.size !== 1 ? "s" : ""} via Zebra`}
                </Button>
                <Button variant="outline" className="min-h-11" disabled={selected.size === 0} onClick={handleDownloadZPL}>Download ZPL file</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>


    </div>
  );
}
