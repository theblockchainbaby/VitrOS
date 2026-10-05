"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/page-header";
import type { Cultivar } from "@/lib/types";
import { toast } from "sonner";
import { BatchResults, type BatchResult, type BatchFailure } from "@/components/batch-results";

interface MediaRecipe {
  id: string;
  name: string;
  baseMedia: string;
  stage: string | null;
}

export default function BatchCreatePage() {
  const [barcodes, setBarcodes] = useState<string[]>([]);
  const [barcodeInput, setBarcodeInput] = useState("");
  const [scanning, setScanning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<BatchResult | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Shared fields for all vessels
  const [cultivarId, setCultivarId] = useState("");
  const [mediaRecipeId, setMediaRecipeId] = useState("");
  const [explantCount, setExplantCount] = useState("0");
  const [stage, setStage] = useState("initiation");
  const [status, setStatus] = useState("media_filled");

  const [cultivars, setCultivars] = useState<Cultivar[]>([]);
  const [mediaRecipes, setMediaRecipes] = useState<MediaRecipe[]>([]);

  useEffect(() => {
    fetch("/api/cultivars").then((r) => r.json()).then((data) => setCultivars(Array.isArray(data) ? data : []));
    fetch("/api/media-recipes").then((r) => r.json()).then((data) => setMediaRecipes(Array.isArray(data) ? data : data.recipes || []));
  }, []);

  const selectedCultivar = cultivars.find((c) => c.id === cultivarId);

  const addBarcode = useCallback(async (barcode: string) => {
    const trimmed = barcode.trim();
    if (!trimmed || scanning || submitting) return;

    if (barcodes.includes(trimmed)) {
      toast.info("Already scanned");
      setBarcodeInput("");
      inputRef.current?.focus();
      return;
    }

    // Check if barcode already exists as an active vessel
    setScanning(true);
    try {
      const res = await fetch(`/api/vessels/barcode?code=${encodeURIComponent(trimmed)}`);
      if (!res.ok) throw new Error("Lookup failed");
      const data = await res.json();
      if (data.found && !data.isDisposed) {
        toast.error(`Barcode ${trimmed} belongs to an active vessel`);
        return;
      }
      setBarcodes((prev) => [...prev, trimmed]);
      toast.success(`#${barcodes.length + 1}: ${trimmed}`);
      setBarcodeInput("");
    } catch {
      toast.error("Could not check this barcode. It has been kept for retry.");
    } finally {
      setScanning(false);
      inputRef.current?.focus();
    }
  }, [barcodes, scanning, submitting]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") addBarcode(barcodeInput);
  };

  const removeBarcode = (index: number) => {
    setBarcodes((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (submitting) return;
    if (barcodes.length === 0) {
      toast.error("Scan at least one vessel");
      return;
    }

    setResult(null);
    setSubmitting(true);
    let successCount = 0;
    const failures: BatchFailure[] = [];

    for (const barcode of barcodes) {
      try {
        const res = await fetch("/api/vessels", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            barcode,
            cultivarId: cultivarId || null,
            mediaRecipeId: mediaRecipeId || null,
            explantCount: parseInt(explantCount) || 0,
            healthStatus: "healthy",
            status,
            stage,
          }),
        });
        if (res.ok) {
          successCount++;
        } else {
          const err = await res.json();
          toast.error(`${barcode}: ${err.error || "Failed"}`);
          failures.push({ barcode, error: err.error || "Creation failed" });
        }
      } catch {
        failures.push({ barcode, error: "Save could not be confirmed. Check this barcode before retrying." });
      }
    }

    setBarcodes(failures.map((failure) => failure.barcode));
    setResult({ succeeded: successCount, total: barcodes.length, failures });
    setSubmitting(false);
    if (successCount > 0) toast.success(`Created ${successCount} vessels`);
    if (failures.length > 0) toast.error(`${failures.length} remaining. Review the queue before retrying.`);
  };

  return (
    <div className="min-w-0 space-y-6 max-w-5xl mx-auto">
      <PageHeader
        title="Batch Create Vessels"
        description="Scan multiple barcodes and create vessels with the same settings"
      />

      <BatchResults result={result} />
      <fieldset disabled={submitting} className="min-w-0 space-y-6">
      {/* Scanner */}
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle className="text-base">Scan Barcodes</CardTitle>
            {barcodes.length > 0 && (
              <span className="text-xs bg-muted text-foreground px-2 py-1 rounded">
                {barcodes.length} scanned
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-3">
            <Input
              ref={inputRef}
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Scan barcode..."
              disabled={scanning}
              autoFocus
              className="min-w-0 flex-1 h-12 font-mono" aria-label="Vessel barcode"
            />
            <Button className="min-h-12" onClick={() => addBarcode(barcodeInput)} disabled={scanning || !barcodeInput}>
              {scanning ? "..." : "Add"}
            </Button>
          </div>

          {barcodes.length > 0 && (
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                {barcodes.map((barcode, i) => (
                  <span
                    key={barcode}
                    className="inline-flex items-center gap-1 text-xs font-mono bg-muted px-2 py-1 rounded"
                  >
                    {barcode}
                    <button
                      aria-label={`Remove ${barcode}`}
                      onClick={() => removeBarcode(i)}
                      className="text-muted-foreground hover:text-destructive ml-1"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <Button variant="ghost" size="sm" onClick={() => setBarcodes([])}>
                Clear All
              </Button>
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            Scan each vessel barcode. Press Enter after each scan. All vessels will be created with the settings above.
          </p>
        </CardContent>
      </Card>

      {/* Shared settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Vessel Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-xs text-muted-foreground">
            These settings apply to all vessels in this batch.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 [&>*]:min-w-0 [&>*]:break-words">
            <div className="space-y-2">
              <Label htmlFor="batch-create-field-1">Cultivar</Label>
              <Select value={cultivarId} onValueChange={setCultivarId}>
                <SelectTrigger id="batch-create-field-1"><SelectValue placeholder="Select cultivar..." /></SelectTrigger>
                <SelectContent>
                  {cultivars.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.code ? `${c.code} — ` : ""}{c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedCultivar?.code && (
                <p className="text-xs text-muted-foreground">Code: <span className="min-w-0 flex-1 h-12 font-mono" aria-label="Vessel barcode">{selectedCultivar.code}</span></p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="batch-create-field-2">Media Recipe</Label>
              <Select value={mediaRecipeId} onValueChange={setMediaRecipeId}>
                <SelectTrigger id="batch-create-field-2"><SelectValue placeholder="Select recipe..." /></SelectTrigger>
                <SelectContent>
                  {mediaRecipes.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.name} ({r.baseMedia})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="batch-create-field-3">Explants per Vessel</Label>
              <Input id="batch-create-field-3"
                type="number"
                value={explantCount}
                onChange={(e) => setExplantCount(e.target.value)}
                min="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="batch-create-field-4">Stage</Label>
              <Select value={stage} onValueChange={setStage}>
                <SelectTrigger id="batch-create-field-4"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="initiation">Initiation</SelectItem>
                  <SelectItem value="multiplication">Multiplication</SelectItem>
                  <SelectItem value="rooting">Rooting</SelectItem>
                  <SelectItem value="acclimation">Acclimation</SelectItem>
                  <SelectItem value="hardening">Hardening</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="batch-create-field-5">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger id="batch-create-field-5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="media_filled">Media Filled</SelectItem>
                  <SelectItem value="planted">Planted</SelectItem>
                  <SelectItem value="growing">Growing</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submit */}
      {barcodes.length > 0 && (
        <Button
          onClick={handleSubmit}
          disabled={submitting || scanning}
          className="min-h-11 h-auto whitespace-normal w-full"
        >
          {submitting
            ? "Creating..."
            : `Create ${barcodes.length} Vessel${barcodes.length > 1 ? "s" : ""}${selectedCultivar ? ` — ${selectedCultivar.name}` : ""}`
          }
        </Button>
      )}
      </fieldset>
    </div>
  );
}
