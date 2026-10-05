"use client";

import Link from "next/link";
import { useState, useCallback, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/page-header";
import { StageBadge, HealthBadge } from "@/components/status-badge";
import { LocationPicker } from "@/components/location-picker";
import { HEALTH_STATUSES, HEALTH_STATUS_LABELS } from "@/lib/constants";
import type { Vessel } from "@/lib/types";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { toast } from "sonner";
import { BatchResults, type BatchResult } from "@/components/batch-results";

type BatchAction = "advance_stage" | "move" | "health_check" | "dispose" | "assign_media";

interface MediaRecipe {
  id: string;
  name: string;
  baseMedia: string;
  stage: string | null;
}

export default function BatchOperationsPage() {
  const [scannedVessels, setScannedVessels] = useState<Vessel[]>([]);
  const [barcodeInput, setBarcodeInput] = useState("");
  const [scanning, setScanning] = useState(false);
  const [action, setAction] = useState<BatchAction>("advance_stage");
  const [executing, setExecuting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [result, setResult] = useState<BatchResult | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Action params
  const [moveLocationId, setMoveLocationId] = useState("");
  const [healthStatus, setHealthStatus] = useState("healthy");
  const [disposeReason, setDisposeReason] = useState("");
  const [mediaRecipeId, setMediaRecipeId] = useState("");
  const [mediaRecipes, setMediaRecipes] = useState<MediaRecipe[]>([]);

  useEffect(() => {
    fetch("/api/media-recipes")
      .then((r) => r.json())
      .then((data) => setMediaRecipes(Array.isArray(data) ? data : data.recipes || []))
      .catch(() => {});
  }, []);

  const scanBarcode = useCallback(async (barcode: string) => {
    if (!barcode.trim() || scanning || executing) return;
    // Check if already scanned
    if (scannedVessels.some((v) => v.barcode === barcode.trim())) {
      toast.info("Already scanned");
      return;
    }

    setScanning(true);
    try {
      const res = await fetch(`/api/vessels/barcode?code=${encodeURIComponent(barcode.trim())}`);
      if (res.ok) {
        const data = await res.json();
        if (data.found && data.vessel) {
          if (data.isDisposed) {
            toast.error(`Vessel ${barcode} is ${data.vessel.status} — cannot batch operate on it`);
          } else {
            setScannedVessels((prev) => [...prev, data.vessel]);
            toast.success(`Added ${data.vessel.barcode}`);
          }
        } else {
          toast.error(`Vessel not found: ${barcode}`);
        }
        setBarcodeInput("");
      } else {
        toast.error("Lookup failed. Your barcode has been kept for retry.");
      }
    } catch {
      toast.error("Lookup failed. Your barcode has been kept for retry.");
    } finally {
      setScanning(false);
      inputRef.current?.focus();
    }
  }, [scannedVessels, scanning, executing]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      scanBarcode(barcodeInput);
    }
  };

  const removeVessel = (id: string) => {
    setScannedVessels((prev) => prev.filter((v) => v.id !== id));
  };

  const clearAll = () => {
    setScannedVessels([]);
  };

  const executeBatch = async () => {
    if (executing) return;
    if (scannedVessels.length === 0) {
      toast.error("No vessels selected");
      return;
    }

    const params: Record<string, unknown> = {};
    if (action === "move") {
      if (!moveLocationId) {
        toast.error("Select a location first");
        return;
      }
      params.locationId = moveLocationId;
    }
    if (action === "health_check") {
      params.healthStatus = healthStatus;
    }
    if (action === "dispose") {
      params.reason = disposeReason || "Batch disposal";
    }
    if (action === "assign_media") {
      if (!mediaRecipeId) {
        toast.error("Select a media recipe first");
        return;
      }
      params.mediaRecipeId = mediaRecipeId;
    }

    setResult(null);
    setExecuting(true);
    try {
      const res = await fetch("/api/vessels/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vesselIds: scannedVessels.map((v) => v.id),
          action,
          params,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const succeededIds = new Set<string>(data.results.filter((row: { success: boolean }) => row.success).map((row: { id: string }) => row.id));
        const remaining = scannedVessels.filter((vessel) => !succeededIds.has(vessel.id));
        const failures = remaining.map((vessel) => ({
          id: vessel.id,
          barcode: vessel.barcode,
          error: data.results.find((row: { id: string; error?: string }) => row.id === vessel.id)?.error || "No completed result was returned. Check the record before retrying.",
        }));
        setResult({ succeeded: succeededIds.size, total: scannedVessels.length, failures });
        setScannedVessels(remaining);
        if (succeededIds.size > 0) toast.success(`${succeededIds.size} vessels updated`);
        if (remaining.length > 0) toast.error(`${remaining.length} remaining in the queue`);
      } else {
        const data = await res.json().catch(() => ({}));
        setResult({ succeeded: 0, total: scannedVessels.length, failures: scannedVessels.map((vessel) => ({ id: vessel.id, barcode: vessel.barcode, error: data.error || "Operation failed. Review and retry." })) });
        toast.error("Batch operation failed. Your queue has been kept.");
      }
    } catch {
      setResult({ succeeded: 0, total: scannedVessels.length, failures: scannedVessels.map((vessel) => ({ id: vessel.id, barcode: vessel.barcode, error: "Operation could not be confirmed. Check the record before retrying." })) });
      toast.error("The operation could not be confirmed. Your queue has been kept. Check the records before retrying.");
    } finally {
      setExecuting(false);
    }
  };

  return (
    <div className="min-w-0 space-y-6">
      <PageHeader
        title="Batch Operations"
        description="Scan multiple vessels and apply operations in bulk"
      />

      <nav aria-label="Other batch workflows" className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" asChild><Link href="/batch/create">Create vessels</Link></Button>
        <Button variant="outline" size="sm" asChild><Link href="/batch/multiply">Multiply parents</Link></Button>
      </nav>

      <BatchResults result={result} />
      <fieldset disabled={executing} className="min-w-0 space-y-6">
      {/* Scanner */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Scan Vessels</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Input
              ref={inputRef}
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Scan or type barcode..."
              disabled={scanning}
              autoFocus
              className="min-w-0 flex-1 h-12 font-mono"
              aria-label="Vessel barcode"
            />
            <Button className="min-h-12" onClick={() => scanBarcode(barcodeInput)} disabled={scanning || !barcodeInput}>
              {scanning ? "..." : "Add"}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Scan barcodes one at a time. Press Enter or click Add after each scan.
          </p>
        </CardContent>
      </Card>

      {/* Scanned vessels */}
      {scannedVessels.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <CardTitle className="text-base">Selected Vessels ({scannedVessels.length})</CardTitle>
              <Button variant="ghost" size="sm" onClick={clearAll}>Clear All</Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Barcode</TableHead>
                  <TableHead>Cultivar</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead>Health</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {scannedVessels.map((v) => (
                  <TableRow key={v.id}>
                    <TableCell><Link href={`/vessels/${v.id}`} className="font-mono underline-offset-4 hover:underline">{v.barcode}</Link></TableCell>
                    <TableCell>{v.cultivar?.name || "—"}</TableCell>
                    <TableCell><StageBadge stage={v.stage} /></TableCell>
                    <TableCell><HealthBadge status={v.healthStatus} /></TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => removeVessel(v.id)}>Remove</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Action */}
      {scannedVessels.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Apply Operation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="batch-field-1">Action</Label>
              <Select value={action} onValueChange={(v) => setAction(v as BatchAction)}>
                <SelectTrigger id="batch-field-1" className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="advance_stage">Advance Stage</SelectItem>
                  <SelectItem value="assign_media">Assign Media Recipe</SelectItem>
                  <SelectItem value="move">Move to Location</SelectItem>
                  <SelectItem value="health_check">Health Check</SelectItem>
                  <SelectItem value="dispose">Dispose</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {action === "move" && (
              <div>
                <Label>Destination</Label>
                <div className="mt-1">
                  <LocationPicker value={moveLocationId} onChange={setMoveLocationId} />
                </div>
              </div>
            )}

            {action === "assign_media" && (
              <div>
                <Label htmlFor="batch-field-2">Media Recipe</Label>
                <Select value={mediaRecipeId} onValueChange={setMediaRecipeId}>
                  <SelectTrigger id="batch-field-2" className="mt-1"><SelectValue placeholder="Select recipe..." /></SelectTrigger>
                  <SelectContent>
                    {mediaRecipes.map((r) => (
                      <SelectItem key={r.id} value={r.id}>
                        {r.name} ({r.baseMedia}{r.stage ? ` — ${r.stage}` : ""})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {action === "health_check" && (
              <div>
                <Label htmlFor="batch-field-3">Health Status</Label>
                <Select value={healthStatus} onValueChange={setHealthStatus}>
                  <SelectTrigger id="batch-field-3" className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {HEALTH_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>{HEALTH_STATUS_LABELS[s]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {action === "dispose" && (
              <div>
                <Label htmlFor="batch-field-4">Reason</Label>
                <Input id="batch-field-4"
                  value={disposeReason}
                  onChange={(e) => setDisposeReason(e.target.value)}
                  placeholder="Disposal reason..."
                  className="mt-1"
                />
              </div>
            )}

            <Button
              onClick={() => {
                if (action === "dispose" || action === "health_check") {
                  setConfirmOpen(true);
                } else {
                  executeBatch();
                }
              }}
              disabled={executing || scanning}
              className="min-h-11 w-full"
              variant={action === "dispose" ? "destructive" : "default"}
            >
              {executing ? "Processing..." : `Apply to ${scannedVessels.length} Vessel${scannedVessels.length > 1 ? "s" : ""}`}
            </Button>
          </CardContent>
        </Card>
      )}

      </fieldset>
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={action === "dispose"
          ? `Dispose ${scannedVessels.length} vessel${scannedVessels.length > 1 ? "s" : ""}?`
          : `Update health on ${scannedVessels.length} vessel${scannedVessels.length > 1 ? "s" : ""}?`
        }
        description={action === "dispose"
          ? "This will permanently mark these vessels as disposed. This is difficult to reverse."
          : `This will change the health status of ${scannedVessels.length} vessel${scannedVessels.length > 1 ? "s" : ""} to "${healthStatus}".`
        }
        confirmLabel={action === "dispose" ? "Dispose All" : "Update All"}
        destructive={action === "dispose"}
        onConfirm={executeBatch}
      />
    </div>
  );
}
