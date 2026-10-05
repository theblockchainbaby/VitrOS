"use client";

import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/page-header";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { toast } from "sonner";
import { failedRowsCsv } from "./failed-rows";

interface ParsedRow {
  barcode: string;
  cultivar?: string;
  stage?: string;
  explantCount?: string;
  healthStatus?: string;
  status?: string;
  notes?: string;
}

interface ImportResult {
  barcode: string;
  success: boolean;
  error?: string;
}

export default function ImportPage() {
  const [csvText, setCsvText] = useState("");
  const [parsed, setParsed] = useState<ParsedRow[]>([]);
  const [importing, setImporting] = useState(false);
  const [results, setResults] = useState<ImportResult[] | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [attempts, setAttempts] = useState<ImportResult[][]>([]);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      setCsvText(text);
      parsePreview(text);
    };
    reader.readAsText(file);
  };

  const parsePreview = (text: string) => {
    setParsed([]); setResults(null); setError("");
    if (text.includes('"')) { setError("Quoted fields are not supported by this importer. Remove commas and line breaks inside values before continuing."); return; }
    const lines = text.split(/\r?\n/).filter((l) => l.trim());
    if (lines.length < 2) {
      toast.error("CSV needs a header row and at least one data row");
      return;
    }

    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/[^a-z_]/g, ""));
    const headerMap: Record<string, string> = {};
    for (const h of headers) {
      if (h.includes("barcode") || h === "code" || h === "id") headerMap[h] = "barcode";
      else if (h.includes("cultivar") || h === "strain" || h === "variety") headerMap[h] = "cultivar";
      else if (h === "stage") headerMap[h] = "stage";
      else if (h.includes("explant") || h === "count") headerMap[h] = "explantCount";
      else if (h.includes("health")) headerMap[h] = "healthStatus";
      else if (h === "status") headerMap[h] = "status";
      else if (h.includes("note")) headerMap[h] = "notes";
    }

    if (!Object.values(headerMap).includes("barcode")) {
      toast.error("CSV must have a 'barcode' column");
      return;
    }

    const rows: ParsedRow[] = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map((v) => v.trim());
      const row: Record<string, string> = {};
      headers.forEach((h, idx) => {
        const mapped = headerMap[h];
        if (mapped && values[idx]) {
          row[mapped] = values[idx];
        }
      });
      if (row.barcode) rows.push(row as unknown as ParsedRow);
    }

    if (rows.length > 2000) { setError("Split this file into batches of no more than 2,000 vessels."); return; }
    if (new Set(rows.map((row) => row.barcode)).size !== rows.length) { setError("Resolve duplicate barcodes before importing."); return; }
    if (rows.length !== lines.length - 1) { setError("Every data row needs a barcode. Fix missing barcodes before importing."); return; }
    setParsed(rows);
    setResults(null);
    if (rows.length === 0) {
      toast.error("No valid rows with barcodes found");
    } else {
      toast.success(`Parsed ${rows.length} vessels from CSV`);
    }
  };

  const handleImport = async () => {
    setConfirmOpen(false);
    if (!csvText || parsed.length === 0) return;
    setImporting(true);
    setError("");
    try {
      const res = await fetch("/api/vessels/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csv: csvText }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Import failed. Your input has been preserved.");
        return;
      }

      setResults(data.results);
      setAttempts((previous) => [...previous, data.results]);
      toast.success(`Imported ${data.created} of ${data.total} vessels`);
      if (data.failed > 0) {
        toast.error(`${data.failed} vessels failed to import`);
      }
    } catch {
      setError("The import response was interrupted. Your input is preserved. Check the vessel list before retrying, since some rows may have been created.");
    } finally {
      setImporting(false);
    }
  };

  const handleReset = () => {
    setCsvText("");
    setParsed([]);
    setResults(null);
    setAttempts([]); setError("");
    if (fileRef.current) fileRef.current.value = "";
  };

  const prepareFailedRows = () => {
    if (!results) return;
    const failed = new Set(results.filter((result) => !result.success).map((result) => result.barcode));
    const retryCsv = failedRowsCsv(csvText, failed);
    if (retryCsv.split("\n").length < 2) {
      setError("Could not match the failed rows to this CSV. The original input and results have been preserved.");
      return;
    }
    setCsvText(retryCsv);
    parsePreview(retryCsv);
  };

  const downloadTemplate = () => {
    const template = "barcode,cultivar,stage,explant_count,health_status,status,notes\nTC0001,Spathiphyllum,initiation,5,healthy,planted,First batch\nTC0002,Monstera,multiplication,10,healthy,growing,Second transfer";
    const blob = new Blob([template], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "vitros-import-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="CSV Import"
        description="Bulk import vessels from a CSV file"
        actions={
          <Button variant="outline" onClick={downloadTemplate}>
            Download Template
          </Button>
        }
      />

      <ol className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground" aria-label="Import steps"><li>1. Upload</li><li>2. Validate & review</li><li>3. Import</li><li>4. Resolve results</li></ol>
      {error && <div role="alert" className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">{error}</div>}
      {attempts.length > 0 && <p role="status" className="text-sm text-muted-foreground">{attempts.flat().filter((result) => result.success).length} vessels created across {attempts.length} completed attempt{attempts.length === 1 ? "" : "s"}. Failed rows remain available for correction.</p>}
      {/* Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Upload CSV</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <input
              ref={fileRef}
              type="file" aria-label="Upload vessel CSV" disabled={importing}
              accept=".csv,text/csv"
              onChange={handleFileUpload}
              className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 file:cursor-pointer"
            />
          </div>
          <div className="text-xs text-muted-foreground">
            Or paste CSV data directly:
          </div>
          <Textarea
            value={csvText}
            onChange={(e) => { setCsvText(e.target.value); setParsed([]); setResults(null); }}
            aria-label="CSV data" disabled={importing}
            placeholder={"barcode,cultivar,stage,explant_count\nTC0001,Spathiphyllum,initiation,5"}
            rows={6}
            className="font-mono text-xs"
          />
          <div className="flex gap-2">
            <Button onClick={() => parsePreview(csvText)} disabled={importing || !csvText.trim()}>
              Preview
            </Button>
            {parsed.length > 0 && (
              <Button variant="outline" onClick={handleReset} disabled={importing}>
                Clear
              </Button>
            )}
          </div>
          <div className="text-xs text-muted-foreground space-y-1">
            <p>Required column: <span className="font-mono font-medium">barcode</span></p>
            <p>Optional: <span className="font-mono">cultivar, stage, explant_count, health_status, status, notes</span></p>
            <p>Valid stages: initiation, multiplication, rooting, acclimation, hardening</p>
            <p>Max 2,000 vessels per import</p>
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      {parsed.length > 0 && !results && (
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="text-base">Preview ({parsed.length} vessels)</CardTitle>
              <Button onClick={() => setConfirmOpen(true)} disabled={importing}>
                {importing ? "Importing..." : `Import ${parsed.length} Vessels`}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Barcode</TableHead>
                    <TableHead>Cultivar</TableHead>
                    <TableHead>Stage</TableHead>
                    <TableHead>Explants</TableHead>
                    <TableHead>Health</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parsed.slice(0, 50).map((row, i) => (
                    <TableRow key={i}>
                      <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                      <TableCell className="font-mono">{row.barcode}</TableCell>
                      <TableCell>{row.cultivar || "—"}</TableCell>
                      <TableCell>{row.stage || "initiation"}</TableCell>
                      <TableCell>{row.explantCount || "0"}</TableCell>
                      <TableCell>{row.healthStatus || "healthy"}</TableCell>
                      <TableCell>{row.status || "planted"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {parsed.length > 50 && (
              <p className="text-sm text-muted-foreground mt-2">
                Showing first 50 of {parsed.length} rows
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {results && (
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="text-base">Import Results</CardTitle>
              <Button variant="outline" onClick={handleReset} disabled={importing}>
                Import More
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{results.filter((r) => r.success).length}</p>
                <p className="text-xs text-muted-foreground">Created</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">{results.filter((r) => !r.success).length}</p>
                <p className="text-xs text-muted-foreground">Failed</p>
              </div>
            </div>
            {results.some((r) => !r.success) && <Button className="mb-4" variant="outline" onClick={prepareFailedRows}>Review failed rows only</Button>}
            {results.some((r) => !r.success) && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Barcode</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Error</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.filter((r) => !r.success).map((r, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-mono">{r.barcode}</TableCell>
                      <TableCell><Badge variant="destructive">Failed</Badge></TableCell>
                      <TableCell className="text-sm text-muted-foreground">{r.error}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={`Import ${parsed.length} vessels?`}
        description={`This will create ${parsed.length} new vessel records in the system. This action cannot be easily undone.`}
        confirmLabel="Import"
        onConfirm={handleImport}
      />
    </div>
  );
}
