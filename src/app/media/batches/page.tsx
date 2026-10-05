"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PageError } from "@/components/page-state";
import { BatchResults, type BatchResult } from "@/components/batch-results";
import { PageHeader } from "@/components/page-header";
import type { MediaBatch, MediaRecipe } from "@/lib/types";
import { format } from "date-fns";
import { toast } from "sonner";
import { FlaskConical, X } from "lucide-react";

export default function MediaBatchesPage() {
  const [batches, setBatches] = useState<MediaBatch[]>([]);
  const [recipes, setRecipes] = useState<MediaRecipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [recipeFilter, setRecipeFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  // Form state
  const [recipeId, setRecipeId] = useState("");
  const [batchNumber, setBatchNumber] = useState("");
  const [volumeL, setVolumeL] = useState("");
  const [vesselCount, setVesselCount] = useState("");
  const [measuredPH, setMeasuredPH] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [autoclaved, setAutoclaved] = useState(false);
  const [notes, setNotes] = useState("");

  // Pour state
  const [pourDialogOpen, setPourDialogOpen] = useState(false);
  const [pourBatch, setPourBatch] = useState<MediaBatch | null>(null);
  const [pourBarcode, setPourBarcode] = useState("");
  const [pourBarcodes, setPourBarcodes] = useState<string[]>([]);
  const [pouring, setPouring] = useState(false);
  const [pourResult, setPourResult] = useState<BatchResult | null>(null);
  const [pourError, setPourError] = useState<string | null>(null);

  const fetchBatches = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (recipeFilter !== "all") params.set("recipeId", recipeFilter);
    setLoadError(null);
    try {
    const res = await fetch(`/api/media-batches?${params}`);
    if (!res.ok) throw new Error();
    const data = await res.json();
    setBatches(data);

    } catch {
      setLoadError("Media batches could not be loaded. Retry to see this view.");
    } finally {
      setLoading(false);
    }
  }, [recipeFilter]);

  useEffect(() => {
    fetchBatches();
  }, [fetchBatches]);

  useEffect(() => {
    fetch("/api/media-recipes").then((r) => r.json()).then(setRecipes);
  }, []);

  const handleCreate = async () => {
    if (!recipeId || !batchNumber || !volumeL || !vesselCount) {
      toast.error("Recipe, batch number, volume, and vessel count are required");
      return;
    }
    setCreating(true);
    try {
      const body: Record<string, unknown> = {
        recipeId,
        batchNumber,
        volumeL: parseFloat(volumeL),
        vesselCount: parseInt(vesselCount),
        autoclaved,
      };
      if (expiresAt) body.expiresAt = new Date(expiresAt).toISOString();
      if (measuredPH) body.measuredPH = parseFloat(measuredPH);
      if (notes) body.notes = notes;

      const res = await fetch("/api/media-batches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        toast.success("Batch recorded");
        setDialogOpen(false);
        setRecipeId("");
        setBatchNumber("");
        setVolumeL("");
        setVesselCount("");
        setMeasuredPH("");
        setExpiresAt("");
        setAutoclaved(false);
        setNotes("");
        fetchBatches();
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to create batch");
      }
    } catch {
      toast.error("The save could not be confirmed. Your entries have been kept.");
    } finally {
      setCreating(false);
    }
  };

  const openPourDialog = (batch: MediaBatch) => {
    if (pourBatch?.id !== batch.id) {
      if (pourBarcodes.length > 0 && !confirm("Discard the queued barcodes and start a pour for this batch?")) return;
      setPourBarcodes([]);
      setPourBarcode("");
      setPourError(null);
      setPourResult(null);
    }
    setPourBatch(batch);
    setPourDialogOpen(true);
  };

  const addPourBarcode = () => {
    const code = pourBarcode.trim();
    if (!code || pouring) return;
    if (pourBarcodes.includes(code)) {
      toast.error("Barcode already added");
      return;
    }
    setPourBarcodes([...pourBarcodes, code]);
    setPourBarcode("");
  };

  const removePourBarcode = (code: string) => {
    setPourBarcodes(pourBarcodes.filter((b) => b !== code));
  };

  const handlePour = async () => {
    if (!pourBatch || pourBarcodes.length === 0 || pouring) return;
    setPourError(null);
    setPourResult(null);
    setPouring(true);
    try {
      const res = await fetch(`/api/media-batches/${pourBatch.id}/pour`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ barcodes: pourBarcodes }),
      });
      if (res.ok) {
        const data = await res.json();
        const completed = new Set<string>((data.results || []).filter((row: { status: string }) => row.status === "created" || row.status === "updated").map((row: { barcode: string }) => row.barcode));
        const remaining = pourBarcodes.filter((barcode) => !completed.has(barcode));
        setPourResult({
          succeeded: completed.size,
          total: pourBarcodes.length,
          failures: remaining.map((barcode) => ({ barcode, error: data.results?.find((row: { barcode: string; status: string }) => row.barcode === barcode)?.status?.replace(/^error:?\s*/, "") || "Pour could not be confirmed. Check the vessel before retrying." })),
        });
        setPourBarcodes(remaining);
        if (completed.size > 0) toast.success(`Poured into ${completed.size} vessels (${data.created} new, ${data.updated} updated)`);
        if (remaining.length === 0) {
          setPourDialogOpen(false);
          setPourBatch(null);
        } else {
          toast.error(`${remaining.length} vessels remain in the pour queue`);
        }
      } else {
        const err = await res.json();
        setPourError(err.error || "Pour failed. Your queue has been kept.");
      }
    } catch {
      setPourError("The pour could not be confirmed. Your queue has been kept. Check the vessels before retrying.");
    } finally {
      setPouring(false);
    }
  };

  return (
    <div className="min-w-0 space-y-6">
      <PageHeader
        title="Media Batches"
        description="Track prepared media batches"
        actions={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>Log Batch</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Log Media Batch</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="media-batches-field-1">Recipe</Label>
                  <Select value={recipeId} onValueChange={setRecipeId}>
                    <SelectTrigger id="media-batches-field-1" className="mt-1"><SelectValue placeholder="Select recipe" /></SelectTrigger>
                    <SelectContent>
                      {recipes.map((r) => (
                        <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 [&>*]:min-w-0 [&>*]:break-words">
                  <div>
                    <Label htmlFor="media-batches-field-2">Batch Number</Label>
                    <Input id="media-batches-field-2" value={batchNumber} onChange={(e) => setBatchNumber(e.target.value)} placeholder="MB-2026-001" className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="media-batches-field-3">Volume (L)</Label>
                    <Input id="media-batches-field-3" type="number" step="0.1" value={volumeL} onChange={(e) => setVolumeL(e.target.value)} className="mt-1" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 [&>*]:min-w-0 [&>*]:break-words">
                  <div>
                    <Label htmlFor="media-batches-field-4">Vessel Count</Label>
                    <Input id="media-batches-field-4" type="number" value={vesselCount} onChange={(e) => setVesselCount(e.target.value)} className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="media-batches-field-5">Measured pH</Label>
                    <Input id="media-batches-field-5" type="number" step="0.01" value={measuredPH} onChange={(e) => setMeasuredPH(e.target.value)} className="mt-1" />
                  </div>
                </div>
                <div><Label htmlFor="batch-expiry">Expiry date (optional)</Label><Input id="batch-expiry" type="date" value={expiresAt} onChange={(event) => setExpiresAt(event.target.value)} className="mt-1" /></div>
                <div className="flex flex-wrap items-center gap-2">
                  <input type="checkbox" id="autoclaved" checked={autoclaved} onChange={(e) => setAutoclaved(e.target.checked)} />
                  <Label htmlFor="autoclaved">Autoclaved</Label>
                </div>
                <div>
                  <Label htmlFor="media-batches-field-6">Notes</Label>
                  <Input id="media-batches-field-6" value={notes} onChange={(e) => setNotes(e.target.value)} className="mt-1" />
                </div>
                <Button onClick={handleCreate} disabled={creating} className="w-full">
                  {creating ? "Saving..." : "Log Batch"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <Button variant="outline" asChild><Link href="/media">Media recipes</Link></Button>
        {pourBatch && pourBarcodes.length > 0 && !pourDialogOpen && <Button variant="outline" onClick={() => setPourDialogOpen(true)}>Resume pour · {pourBarcodes.length} queued for {pourBatch.batchNumber}</Button>}
      </div>
      {!pourDialogOpen && <BatchResults result={pourResult} />}
      {/* Filter */}
      <Card>
        <CardContent className="pt-4">
          <Select value={recipeFilter} onValueChange={setRecipeFilter}>
            <SelectTrigger className="w-full sm:w-64" aria-label="Filter batches by recipe"><SelectValue placeholder="Filter by recipe" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Recipes</SelectItem>
              {recipes.map((r) => (
                <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {recipeFilter !== "all" && <Button variant="ghost" size="sm" className="mt-2" onClick={() => setRecipeFilter("all")}>Reset filter</Button>}
        </CardContent>
      </Card>

      {loadError ? <PageError message={loadError} retry={fetchBatches} /> : loading ? (
        <p className="text-center text-muted-foreground py-8">Loading...</p>
      ) : batches.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">{recipeFilter !== "all" ? "No batches match this recipe. Reset the filter to see all batches." : "No batches recorded yet. Log a prepared batch to begin pouring vessels."}</p>
      ) : (
        <>
        <div className="hidden md:block rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Batch #</TableHead>
                <TableHead>Recipe</TableHead>
                <TableHead>Volume (L)</TableHead>
                <TableHead>Vessels</TableHead>
                <TableHead>pH</TableHead>
                <TableHead>Autoclaved</TableHead>
                <TableHead>Prepared By</TableHead>
                <TableHead>Prepared / expires</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {batches.map((b) => (
                <TableRow key={b.id}>
                  <TableCell className="font-mono">{b.batchNumber}</TableCell>
                  <TableCell>{b.recipe ? <Link href={`/media/${b.recipe.id}`} className="text-primary hover:underline">{b.recipe.name}</Link> : "—"}</TableCell>
                  <TableCell>{b.volumeL}</TableCell>
                  <TableCell className="font-mono">{b.vesselCount}</TableCell>
                  <TableCell>{b.measuredPH ?? "—"}</TableCell>
                  <TableCell>{b.autoclaved ? <Badge>Yes</Badge> : <Badge variant="outline">No</Badge>}</TableCell>
                  <TableCell>{b.preparedBy?.name ?? "—"}</TableCell>
                  <TableCell>{format(new Date(b.createdAt), "MMM d, yyyy")}<span className={`block text-xs ${b.expiresAt && new Date(b.expiresAt) < new Date() ? "text-destructive" : "text-muted-foreground"}`}>{b.expiresAt ? `Expires ${format(new Date(b.expiresAt), "MMM d, yyyy")}` : "No expiry recorded"}</span></TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" onClick={() => openPourDialog(b)}>
                      <FlaskConical className="mr-1 size-3" />
                      Pour
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="space-y-3 md:hidden">
          {batches.map((batch) => (
            <Card key={batch.id}><CardContent className="pt-4 space-y-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0"><p className="font-mono font-medium break-all">{batch.batchNumber}</p>{batch.recipe && <Link href={`/media/${batch.recipe.id}`} className="text-sm text-primary hover:underline">{batch.recipe.name}</Link>}</div>
                <Button variant="outline" className="min-h-11" onClick={() => openPourDialog(batch)}>Pour vessels</Button>
              </div>
              <dl className="grid grid-cols-2 gap-2 text-sm">
                <div><dt className="text-muted-foreground">Volume</dt><dd>{batch.volumeL} L</dd></div>
                <div><dt className="text-muted-foreground">Vessels</dt><dd>{batch.vesselCount}</dd></div>
                <div><dt className="text-muted-foreground">Measured pH</dt><dd>{batch.measuredPH ?? "Not recorded"}</dd></div>
                <div><dt className="text-muted-foreground">Autoclaved</dt><dd>{batch.autoclaved ? "Yes" : "No"}</dd></div>
              </dl>
              <p className="text-xs text-muted-foreground">Prepared {format(new Date(batch.createdAt), "MMM d, yyyy")} · {batch.preparedBy?.name || "Unknown operator"}</p>
              <p className={`text-xs ${batch.expiresAt && new Date(batch.expiresAt) < new Date() ? "text-destructive" : "text-muted-foreground"}`}>{batch.expiresAt ? `Expires ${format(new Date(batch.expiresAt), "MMM d, yyyy")}` : "No expiry recorded"}</p>
            </CardContent></Card>
          ))}
        </div>
        </>
      )}

      {/* Pour Vessels Dialog */}
      <Dialog open={pourDialogOpen} onOpenChange={(open) => { if (!pouring) setPourDialogOpen(open); }}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Pour Vessels — {pourBatch?.batchNumber}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Scan or type vessel barcodes to assign them to batch{" "}
            <span className="font-mono font-medium">{pourBatch?.batchNumber}</span>{" "}
            ({pourBatch?.recipe?.name}).
          </p>
          <form
            onSubmit={(e) => { e.preventDefault(); addPourBarcode(); }}
            className="flex flex-wrap gap-2"
          >
            <Input
              value={pourBarcode}
              onChange={(e) => setPourBarcode(e.target.value)}
              placeholder="Scan or type barcode..."
              className="min-w-0 flex-1 font-mono text-lg h-12"
              aria-label="Vessel barcode for pour"
              disabled={pouring}
              autoFocus
            />
            <Button type="submit" size="lg" disabled={pouring || !pourBarcode.trim()}>
              Add
            </Button>
          </form>

          {pourBarcodes.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">{pourBarcodes.length} vessel{pourBarcodes.length !== 1 ? "s" : ""}</p>
              <div className="flex flex-wrap gap-2">
                {pourBarcodes.map((code) => (
                  <Badge key={code} variant="secondary" className="font-mono text-sm py-1 px-2">
                    {code}
                    <button disabled={pouring} aria-label={`Remove ${code}`} onClick={() => removePourBarcode(code)} className="ml-1.5 hover:text-destructive">
                      <X className="size-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <BatchResults result={pourResult} />
          {pourError && <p role="alert" className="text-sm text-destructive">{pourError}</p>}
          <Button
            onClick={handlePour}
            disabled={pouring || pourBarcodes.length === 0}
            className="w-full"
          >
            {pouring ? "Pouring..." : `Pour into ${pourBarcodes.length} Vessel${pourBarcodes.length !== 1 ? "s" : ""}`}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
