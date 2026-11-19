"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { classifyKeystrokes, SCAN_MAX_KEY_GAP_MS, type KeyStroke } from "@/lib/use-hardware-scanner";
import {
  LABEL_STOCKS, DEFAULT_LABEL_STOCK_ID, getLabelStock, loadSavedLabelStockId, saveLabelStockId,
  generateBarcodeSVG, generateVesselZPL, getZebraPrinters, printLabels, printZPLViaBrowserPrint, type ZebraPrinter,
} from "@/lib/label-generator";

type ScannerResult =
  | { state: "idle" }
  | { state: "scanner"; code: string; ms: number }
  | { state: "no_enter"; code: string }
  | { state: "typed"; code: string };

const TEST_CODE = "VITROS-TEST-01";
const subscribeToNothing = () => () => {};

export function DeviceSetup() {
  // --- Scanner check: a scanner types far faster than a person and ends with Enter.
  const [value, setValue] = useState("");
  const [result, setResult] = useState<ScannerResult>({ state: "idle" });
  const strokes = useRef<KeyStroke[]>([]);
  const noEnterTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (noEnterTimer.current) clearTimeout(noEnterTimer.current); }, []);

  const finish = (next: ScannerResult) => {
    strokes.current = [];
    setValue("");
    setResult(next);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (noEnterTimer.current) { clearTimeout(noEnterTimer.current); noEnterTimer.current = null; }
    if (event.key === "Enter") {
      event.preventDefault();
      const verdict = classifyKeystrokes(strokes.current);
      if (verdict.kind === "scan") finish({ state: "scanner", code: verdict.code, ms: Math.round(verdict.durationMs) });
      else if (verdict.code) finish({ state: "typed", code: verdict.code });
      return;
    }
    if (event.key.length !== 1) return;
    strokes.current.push({ key: event.key, time: performance.now() });
    // A fast burst that then goes quiet is a scanner that is not sending Enter.
    noEnterTimer.current = setTimeout(() => {
      const verdict = classifyKeystrokes(strokes.current);
      if (verdict.kind === "scan") finish({ state: "no_enter", code: verdict.code });
    }, 600);
  };

  // --- Printer check
  // The saved stock lives in localStorage, which the server render cannot see.
  const savedStockId = useSyncExternalStore(subscribeToNothing, loadSavedLabelStockId, () => DEFAULT_LABEL_STOCK_ID);
  const [chosenStockId, setStockId] = useState<string | null>(null);
  const stockId = chosenStockId ?? savedStockId;
  const [zebra, setZebra] = useState<ZebraPrinter[] | null>(null);
  const [checking, setChecking] = useState(false);
  const [printNote, setPrintNote] = useState("");
  const stock = getLabelStock(stockId);

  const printTestLabel = () => {
    const html = `<div class="label"><div class="label-barcode">${generateBarcodeSVG(TEST_CODE)}</div><div class="label-cultivar">VitrOS test label</div><div class="label-stage">${stock.name}</div></div>`;
    setPrintNote(printLabels(html, null, stock)
      ? "Print window opened. Pick your label printer, set scale to 100% and margins to none. Then scan the printed label in the scanner check."
      : "The print window was blocked. Allow popups for this site and try again.");
  };

  const checkZebra = async () => {
    setChecking(true);
    setZebra(await getZebraPrinters());
    setChecking(false);
  };

  const sendZebraTest = async () => {
    if (!zebra?.length) return;
    setChecking(true);
    const zplStock = stock.zpl ? stock : getLabelStock(DEFAULT_LABEL_STOCK_ID);
    const sent = await printZPLViaBrowserPrint(generateVesselZPL({ barcode: TEST_CODE, cultivar: "VitrOS test label" }, zplStock), zebra[0]);
    setPrintNote(sent.success ? `Test label sent to ${zebra[0].name}. Scan it in the scanner check to confirm it reads.` : sent.error || "The test label could not be sent.");
    setChecking(false);
  };

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader><CardTitle className="text-base">Barcode scanner</CardTitle><p className="text-sm text-muted-foreground">Works with any USB or Bluetooth scanner that pairs as a keyboard: Zebra, Honeywell, Datalogic and most others. No driver needed.</p></CardHeader>
        <CardContent className="space-y-4 text-sm">
          <ol className="list-decimal pl-5 space-y-2 text-muted-foreground"><li>Plug in the scanner, or pair it over Bluetooth in keyboard (HID) mode.</li><li>Click the box below and scan any barcode.</li></ol>
          <div>
            <Label htmlFor="scanner-test">Scanner check</Label>
            <Input id="scanner-test" autoComplete="off" spellCheck={false} placeholder="Click here, then scan a barcode" className="mt-1 h-12 font-mono" value={value} onChange={(event) => setValue(event.target.value)} onKeyDown={onKeyDown} />
          </div>
          <div role="status" className="rounded-lg border p-3">
            {result.state === "idle" && <p className="text-muted-foreground">Waiting for a scan.</p>}
            {result.state === "scanner" && <p><span className="font-semibold text-primary">Scanner connected.</span> Read <span className="font-mono break-all">{result.code}</span> in {result.ms} ms with an Enter at the end. It is ready to use on every page.</p>}
            {result.state === "no_enter" && <p><span className="font-semibold text-amber-700 dark:text-amber-300">Scanner found, but it is not sending Enter.</span> Read <span className="font-mono break-all">{result.code}</span>. Turn on the Enter (carriage return) suffix using the setup barcode in the scanner&apos;s manual, then scan again.</p>}
            {result.state === "typed" && <p><span className="font-semibold">That was typed by hand.</span> Got <span className="font-mono break-all">{result.code}</span>, but slower than a scanner sends it (keys more than {SCAN_MAX_KEY_GAP_MS} ms apart). If you did scan, check that the scanner is in keyboard mode.</p>}
          </div>
          <p className="text-muted-foreground">Once connected, scan a vessel label from any page to open that vessel. You do not need to click a field first.</p>
          <Button variant="outline" asChild><Link href="/scan">Open Scan</Link></Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="text-base">Label printer</CardTitle><p className="text-sm text-muted-foreground">Any printer installed on this computer works: Zebra, Brother, Dymo, Rollo or an office printer. Zebra printers can also print directly with no dialog.</p></CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div>
            <Label htmlFor="setup-stock">Label loaded in the printer</Label>
            <Select value={stockId} onValueChange={(id) => { setStockId(id); saveLabelStockId(id); }}>
              <SelectTrigger id="setup-stock" className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>{LABEL_STOCKS.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={printTestLabel}>Print a test label</Button>
            <Button variant="outline" disabled={checking} onClick={checkZebra}>{checking ? "Checking…" : "Find my Zebra printer"}</Button>
          </div>
          {zebra && (
            <div role="status" className="rounded-lg border p-3 space-y-2">
              {zebra.length > 0 ? (
                <>
                  <p><span className="font-semibold text-primary">Zebra printer connected:</span> {zebra.map((p) => p.name).join(", ")}</p>
                  <Button size="sm" disabled={checking} onClick={sendZebraTest}>Send a test label to it</Button>
                </>
              ) : (
                <p>No Zebra printer found on this computer. Install and open <a className="underline" href="https://www.zebra.com/us/en/software/zebra-utilities/browser-print.html" target="_blank" rel="noopener noreferrer">Zebra Browser Print</a>, plug in the printer, then check again. Any other printer works with &quot;Print a test label&quot;.</p>
              )}
            </div>
          )}
          {printNote && <p role="status" className="rounded-lg border bg-muted/40 p-3">{printNote}</p>}
          <p className="text-muted-foreground">A sent or opened print job does not prove the label printed. Check the label and scan it.</p>
          <Button variant="outline" asChild><Link href="/labels">Open Labels</Link></Button>
        </CardContent>
      </Card>
    </div>
  );
}
