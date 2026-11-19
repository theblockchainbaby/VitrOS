import JsBarcode from "jsbarcode";
import QRCode from "qrcode";

// ---------------------------------------------------------------------------
// Label stock
// ---------------------------------------------------------------------------

// "roll" stock prints one label per page at the label's real size, which is
// what thermal label printers (Zebra, Brother, Dymo, Rollo, Munbyn) expect
// through the normal print dialog. "sheet" lays labels out on plain paper for
// an office printer.
export interface LabelStock {
  id: string;
  name: string;
  kind: "roll" | "sheet";
  widthIn: number;
  heightIn: number;
  zpl: boolean; // wide enough for the direct Zebra layout
}

export const LABEL_STOCKS: LabelStock[] = [
  { id: "2.25x1.25", name: "2.25 x 1.25 in label", kind: "roll", widthIn: 2.25, heightIn: 1.25, zpl: true },
  { id: "2x1", name: "2 x 1 in label", kind: "roll", widthIn: 2, heightIn: 1, zpl: true },
  { id: "3x2", name: "3 x 2 in label", kind: "roll", widthIn: 3, heightIn: 2, zpl: true },
  { id: "4x6", name: "4 x 6 in label", kind: "roll", widthIn: 4, heightIn: 6, zpl: true },
  { id: "1.5x1", name: "1.5 x 1 in label", kind: "roll", widthIn: 1.5, heightIn: 1, zpl: false },
  { id: "sheet", name: "Plain paper sheet (office printer)", kind: "sheet", widthIn: 2.25, heightIn: 1.25, zpl: false },
];

export const DEFAULT_LABEL_STOCK_ID = "2.25x1.25";
const STOCK_STORAGE_KEY = "vitros_label_stock";

export function getLabelStock(id: string | null | undefined): LabelStock {
  return LABEL_STOCKS.find((stock) => stock.id === id) ?? LABEL_STOCKS[0];
}

export function loadSavedLabelStockId(): string {
  try { return getLabelStock(localStorage.getItem(STOCK_STORAGE_KEY)).id; } catch { return DEFAULT_LABEL_STOCK_ID; }
}

export function saveLabelStockId(id: string) {
  try { localStorage.setItem(STOCK_STORAGE_KEY, id); } catch { /* preference is optional */ }
}

// ---------------------------------------------------------------------------
// Direct Zebra printing (ZPL through Zebra Browser Print)
// ---------------------------------------------------------------------------

export interface ZPLVesselData {
  barcode: string;
  cultivar?: string;
  stage?: string;
  cloneLine?: string;
  subcultureNumber?: number;
  plantedAt?: string;
  organizationName?: string;
}

const ZPL_DPI = 203;

// ^ and ~ start ZPL commands. A cultivar or barcode containing one would
// corrupt the label or run a printer command, so they are removed from data.
export function zplSafe(text: string): string {
  return text.replace(/[\^~]/g, " ").replace(/[\r\n]+/g, " ").trim();
}

/**
 * ZPL for one vessel label. Works on Zebra ZD/GK/GX/ZT series and other
 * printers that speak ZPL. Layout is sized for labels 2 in wide or wider.
 */
export function generateVesselZPL(data: ZPLVesselData, stock: LabelStock = getLabelStock(DEFAULT_LABEL_STOCK_ID)): string {
  const stageAbbrev: Record<string, string> = {
    initiation: "INIT",
    multiplication: "MULT",
    rooting: "ROOT",
    acclimation: "ACCL",
    hardening: "HARD",
  };
  const width = Math.round(stock.widthIn * ZPL_DPI);
  const length = Math.round(stock.heightIn * ZPL_DPI);
  const stageLabel = data.stage ? (stageAbbrev[data.stage] || zplSafe(data.stage).toUpperCase()) : "";
  const subcultureLabel = data.subcultureNumber !== undefined ? `P${data.subcultureNumber}` : "";
  const dateLabel = data.plantedAt ? new Date(data.plantedAt).toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "2-digit" }) : "";
  const cloneLine = data.cloneLine ? zplSafe(data.cloneLine).substring(0, 22) : "";
  const organization = data.organizationName ? zplSafe(data.organizationName).substring(0, 30) : "";

  const lines: string[] = [
    "^XA",
    "^MMT",                    // print mode: tear-off
    `^PW${width}`,             // label width in dots
    `^LL${length}`,            // label length in dots
    "^LS0",                    // label shift: none
    // Cultivar name (top-left, bold)
    `^FO10,8^A0N,22,22^FD${zplSafe(data.cultivar || "").substring(0, 20)}^FS`,
    // Stage + subculture number (top-right)
    `^FO${width - 157},8^A0N,18,18^FD${stageLabel} ${subcultureLabel}^FS`,
    ...(cloneLine ? [`^FO10,34^A0N,16,16^FDLine: ${cloneLine}^FS`] : []),
    ...(dateLabel ? [`^FO10,${cloneLine ? 56 : 34}^A0N,14,14^FDPlanted: ${dateLabel}^FS`] : []),
    // Barcode (Code128) with the code printed underneath
    `^FO30,82^BY2,3,50^BCN,50,Y,N,N^FD${zplSafe(data.barcode)}^FS`,
    ...(organization ? [`^FO10,${length - 24}^A0N,12,12^FD${organization}^FS`] : []),
    "^PQ1,0,1,Y",              // print quantity: 1
    "^XZ",
  ];

  return lines.join("\n");
}

export function generateBatchZPL(vessels: ZPLVesselData[], stock?: LabelStock): string {
  return vessels.map((vessel) => generateVesselZPL(vessel, stock)).join("\n");
}

export interface ZebraPrinter {
  name: string;
  uid: string;
  connection: string;
}

// Zebra Browser Print is a small app from Zebra that runs on the computer the
// printer is plugged into. It listens on http://localhost:9100, and on
// https://localhost:9101 for browsers that refuse plain http from a secure page.
const BROWSER_PRINT_ENDPOINTS = ["http://localhost:9100", "https://localhost:9101"];
let browserPrintEndpoint: string | null = null;

async function browserPrintFetch(path: string, init?: RequestInit): Promise<Response> {
  const candidates = browserPrintEndpoint ? [browserPrintEndpoint] : BROWSER_PRINT_ENDPOINTS;
  let lastError: unknown = new Error("Zebra Browser Print not reachable");
  for (const base of candidates) {
    try {
      const res = await fetch(`${base}${path}`, { ...init, signal: AbortSignal.timeout(4000) });
      browserPrintEndpoint = base;
      return res;
    } catch (error) {
      lastError = error;
    }
  }
  browserPrintEndpoint = null;
  throw lastError;
}

/** Zebra printers visible to Zebra Browser Print on this computer. */
export async function getZebraPrinters(): Promise<ZebraPrinter[]> {
  try {
    const res = await browserPrintFetch("/available");
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data?.printer) ? data.printer : [];
  } catch {
    return [];
  }
}

/** Sends ZPL to a Zebra printer. Uses the first printer found unless one is given. */
export async function printZPLViaBrowserPrint(zpl: string, printer?: ZebraPrinter): Promise<{ success: boolean; error?: string }> {
  try {
    let target = printer;
    if (!target) {
      const printers = await getZebraPrinters();
      if (printers.length === 0) {
        return { success: false, error: "No Zebra printer found. Check that it is powered on, connected, and that Zebra Browser Print is running." };
      }
      target = printers[0];
    }
    const writeRes = await browserPrintFetch("/write", {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=UTF-8" },
      body: JSON.stringify({ device: target, data: zpl }),
    });
    return writeRes.ok ? { success: true } : { success: false, error: "The printer did not accept the label." };
  } catch {
    return { success: false, error: "Could not reach Zebra Browser Print. Make sure it is installed and running on this computer." };
  }
}

/** Saves ZPL as a file, for printers fed through their own utility or a print server. */
export function downloadZPL(zpl: string, filename = "vitros-labels.zpl") {
  const url = URL.createObjectURL(new Blob([zpl], { type: "text/plain" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

// ---------------------------------------------------------------------------
// Printing through the normal print dialog (any installed printer)
// ---------------------------------------------------------------------------

export interface LabelData {
  barcode: string;
  cultivar?: string;
  stage?: string;
  date?: string;
}

export function generateBarcodeSVG(text: string): string {
  const doc = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  JsBarcode(doc, text, {
    format: "CODE128",
    width: 2,
    height: 40,
    displayValue: true,
    fontSize: 12,
    margin: 5,
  });
  // Let the page scale the barcode to the label instead of a fixed pixel size.
  const width = doc.getAttribute("width")?.replace("px", "");
  const height = doc.getAttribute("height")?.replace("px", "");
  if (width && height && !doc.getAttribute("viewBox")) doc.setAttribute("viewBox", `0 0 ${width} ${height}`);
  doc.setAttribute("preserveAspectRatio", "xMidYMid meet");
  return doc.outerHTML;
}

export async function generateQRCodeDataURL(text: string): Promise<string> {
  return QRCode.toDataURL(text, {
    width: 240,
    margin: 1,
    color: { dark: "#000000", light: "#ffffff" },
  });
}

/** CSS for the print window. Exported so the label layout can be tested. */
export function labelPrintCSS(stock: LabelStock): string {
  const text = `
    body { font-family: Arial, Helvetica, sans-serif; margin: 0; color: #000; }
    .label { box-sizing: border-box; text-align: center; overflow: hidden; }
    .label-barcode { line-height: 0; }
    .label-barcode svg, .label-barcode img { display: block; margin: 0 auto; }
    .label-code { font-family: monospace; }
    .label-cultivar { font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .label-stage, .label-date { white-space: nowrap; }
  `;
  if (stock.kind === "sheet") {
    return `${text}
    @page { margin: 0.4in; }
    .label { display: inline-block; width: ${stock.widthIn}in; height: ${stock.heightIn}in; padding: 0.06in; margin: 0.04in; border: 1px dashed #bbb; break-inside: avoid; page-break-inside: avoid; font-size: 8pt; vertical-align: top; }
    .label-barcode svg { width: 100%; height: ${(stock.heightIn * 0.5).toFixed(2)}in; }
    .label-barcode img { height: ${(stock.heightIn * 0.5).toFixed(2)}in; }
    `;
  }
  // One label per page, exactly the size of the label, no margins.
  const small = stock.heightIn <= 1;
  const fontPt = small ? 6.5 : stock.heightIn >= 2 ? 11 : 8;
  return `${text}
    @page { size: ${stock.widthIn}in ${stock.heightIn}in; margin: 0; }
    html, body { width: ${stock.widthIn}in; }
    .label { width: ${stock.widthIn}in; height: ${stock.heightIn}in; padding: 0.05in 0.08in; font-size: ${fontPt}pt; line-height: 1.15; display: flex; flex-direction: column; justify-content: center; break-after: page; page-break-after: always; }
    .label:last-child { break-after: auto; page-break-after: auto; }
    .label-barcode svg { width: 100%; height: ${(stock.heightIn * (small ? 0.5 : 0.52)).toFixed(2)}in; }
    .label-barcode img { height: ${(Math.min(stock.heightIn * 0.55, stock.widthIn * 0.5)).toFixed(2)}in; width: auto; }
  `;
}

// Pass a pre-opened window when the HTML is built after async work: window.open
// must happen during the user gesture or some browsers block the popup.
// Returns false when no window is available so callers can surface the failure.
export function printLabels(labelHTML: string, targetWindow?: Window | null, stock: LabelStock = getLabelStock("sheet")): boolean {
  const printWindow = targetWindow ?? window.open("", "_blank");
  if (!printWindow) return false;

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Print Labels</title>
      <style>${labelPrintCSS(stock)}</style>
    </head>
    <body>${labelHTML}</body>
    </html>
  `);
  printWindow.document.close();
  printWindow.onload = () => {
    printWindow.print();
  };
  return true;
}
