"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { BarcodeScanner } from "@/components/barcode-scanner";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge, HealthBadge, StageBadge } from "@/components/status-badge";
import { VESSEL_STATUS_LABELS, HEALTH_STATUS_LABELS, STAGE_LABELS } from "@/lib/constants";
import { toast } from "sonner";
import { Clock } from "lucide-react";
import type { Cultivar, Vessel } from "@/lib/types";

export default function ScanPage() {
  const [scannedBarcode, setScannedBarcode] = useState<string | null>(null);
  const [existingVessel, setExistingVessel] = useState<Vessel | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [isReuse, setIsReuse] = useState(false);
  const [cultivars, setCultivars] = useState<Cultivar[]>([]);
  const [lookingUp, setLookingUp] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Form state
  const [cultivarId, setCultivarId] = useState("");
  const [explantCount, setExplantCount] = useState("0");
  const [healthStatus, setHealthStatus] = useState("healthy");
  const [status, setStatus] = useState("media_filled");
  const [stage, setStage] = useState("initiation");
  const [notes, setNotes] = useState("");

  const [recentScans, setRecentScans] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/cultivars").then((r) => { if (!r.ok) throw new Error(); return r.json(); }).then(setCultivars).catch(() => toast.error("Cultivars could not be loaded. Reload to try again."));
    try {
      const saved = localStorage.getItem("vitros_recent_scans");
      if (saved) { const parsed = JSON.parse(saved); if (Array.isArray(parsed)) setRecentScans(parsed.filter((barcode): barcode is string => typeof barcode === "string").slice(0, 8)); }
    } catch { /* ignore */ }
  }, []);

  const addToRecent = (barcode: string) => {
    setRecentScans((prev) => {
      const updated = [barcode, ...prev.filter((b) => b !== barcode)].slice(0, 8);
      try { localStorage.setItem("vitros_recent_scans", JSON.stringify(updated)); } catch { /* history is optional */ }
      return updated;
    });
  };

  const handleScan = useCallback(async (barcode: string) => {
    setScannedBarcode(barcode);
    setLookupError(null);
    setSaveError(null);
    setLookingUp(true);
    try {
      const res = await fetch(`/api/vessels/barcode?code=${encodeURIComponent(barcode)}`);
      if (!res.ok) throw new Error("Barcode lookup is unavailable. Your barcode is ready to retry.");
      const data = await res.json();
      addToRecent(barcode);
      if (data.found && !data.isDisposed) {
        // Active vessel — show edit form
        setExistingVessel(data.vessel);
        setIsNew(false);
        setIsReuse(false);
        setCultivarId(data.vessel.cultivarId || "");
        setExplantCount(String(data.vessel.explantCount));
        setHealthStatus(data.vessel.healthStatus);
        setStatus(data.vessel.status);
        setStage(data.vessel.stage || "initiation");
        setNotes(data.vessel.notes || "");
      } else if (data.found && data.isDisposed) {
        // Disposed/multiplied vessel — show reuse prompt
        setExistingVessel(data.vessel);
        setIsNew(false);
        setIsReuse(true);
      } else {
        // Brand new barcode
        setExistingVessel(null);
        setIsNew(true);
        setIsReuse(false);
        setCultivarId("");
        setExplantCount("0");
        setHealthStatus("healthy");
        setStatus("media_filled");
        setStage("initiation");
        setNotes("");
      }
    } catch (error) {
      setLookupError(error instanceof Error ? error.message : "Could not look up this barcode. Try again.");
    } finally {
      setLookingUp(false);
    }
  }, []);

  const handleSave = async () => {
    if (!scannedBarcode || saving) return;
    setSaving(true);
    setSaveError(null);
    try {
      if (isNew) {
        const res = await fetch("/api/vessels", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            barcode: scannedBarcode,
            cultivarId: cultivarId || null,
            explantCount: parseInt(explantCount) || 0,
            healthStatus,
            status,
            stage,
            notes: notes || null,
          }),
        });
        if (!res.ok) {
          const err = await res.json();
          setSaveError(err.error || "Failed to create vessel. Your entries have been kept.");
          return;
        }
        toast.success(`Vessel ${scannedBarcode} created`);
      } else if (existingVessel) {
        const res = await fetch(`/api/vessels/${existingVessel.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cultivarId: cultivarId || null,
            explantCount: parseInt(explantCount) || 0,
            healthStatus,
            status,
            stage,
            notes: notes || null,
          }),
        });
        if (!res.ok) {
          setSaveError("Failed to update vessel. Your entries have been kept.");
          return;
        }
        toast.success(`Vessel ${scannedBarcode} updated`);
      }
      setScannedBarcode(null);
      setExistingVessel(null);
      setIsNew(false);
    } catch {
      setSaveError("The save could not be confirmed. Your entries have been kept. Check the record before retrying.");
    } finally {
      setSaving(false);
    }
  };

  const handleStartNewRun = () => {
    // Switch from reuse prompt to new vessel creation form
    setIsReuse(false);
    setIsNew(true);
    setExistingVessel(null);
    setCultivarId("");
    setExplantCount("0");
    setHealthStatus("healthy");
    setStatus("media_filled");
    setStage("initiation");
    setNotes("");
  };

  const handleReset = () => {
    if (saving) return;
    setLookupError(null);
    setSaveError(null);
    setScannedBarcode(null);
    setExistingVessel(null);
    setIsNew(false);
    setIsReuse(false);
  };

  return (
    <div className="min-w-0 space-y-6 max-w-5xl mx-auto">
      <PageHeader title="Scan Vessel" description="Scan or type a barcode to create or update a vessel" actions={<Button asChild variant="outline" size="sm"><Link href="/integrations">Device setup</Link></Button>} />

      {!scannedBarcode ? (
        <>
          <Card>
            <CardContent className="pt-6">
              <BarcodeScanner onScan={handleScan} />
            </CardContent>
          </Card>
          {recentScans.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2 text-muted-foreground">
                  <Clock className="size-3.5" /> Recent Scans
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {recentScans.map((barcode) => (
                    <Button
                      key={barcode}
                      variant="outline"
                      size="sm"
                      className="min-h-11 h-auto max-w-full whitespace-normal break-all font-mono text-xs"
                      onClick={() => handleScan(barcode)}
                    >
                      {barcode}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      ) : lookingUp ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <p role="status" className="text-muted-foreground">Looking up <span className="font-mono break-all">{scannedBarcode}</span>…</p>
          </CardContent>
        </Card>
      ) : lookupError ? (
        <Card><CardContent className="pt-6 space-y-4">
          <p role="alert" className="text-sm text-destructive">{lookupError}</p>
          <p className="font-mono break-all">{scannedBarcode}</p>
          <div className="flex flex-wrap gap-2">
            <Button className="min-h-11" onClick={() => handleScan(scannedBarcode)}>Retry lookup</Button>
            <Button variant="outline" className="min-h-11" disabled={saving} onClick={handleReset}>Scan another</Button>
          </div>
        </CardContent></Card>
      ) : isReuse && existingVessel ? (
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <CardTitle className="min-w-0 break-all font-mono text-lg">{scannedBarcode}</CardTitle>
              <StatusBadge status={existingVessel.status} />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-muted/50 p-4 space-y-2">
              <p className="text-sm font-medium">Previous Run</p>
              <div className="grid grid-cols-2 gap-2 text-sm [&>*]:min-w-0 [&>*]:break-words">
                <span className="text-muted-foreground">Cultivar</span>
                <span>{existingVessel.cultivar?.name || "—"}</span>
                <span className="text-muted-foreground">Stage</span>
                <span>{existingVessel.stage ? <StageBadge stage={existingVessel.stage} /> : "—"}</span>
                <span className="text-muted-foreground">Health</span>
                <HealthBadge status={existingVessel.healthStatus} />
                <span className="text-muted-foreground">Explants</span>
                <span>{existingVessel.explantCount}</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              This vessel was previously <strong>{existingVessel.status}</strong>. You can reuse the barcode to start a fresh run. The previous history will be preserved.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button onClick={handleStartNewRun} className="min-h-11 min-w-0 flex-1">
                Start New Run
              </Button>
              <Button variant="outline" asChild><Link href={`/vessels/${existingVessel.id}`}>View Old Record</Link></Button>
              <Button variant="outline" className="min-h-11" disabled={saving} onClick={handleReset}>
                Scan Another
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <CardTitle className="min-w-0 break-all font-mono text-lg">{scannedBarcode}</CardTitle>
              <div className="flex flex-wrap gap-2">
                {isNew ? (
                  <span className="text-sm bg-muted text-foreground px-2 py-1 rounded">New Vessel</span>
                ) : (
                  <>
                    <StatusBadge status={existingVessel?.status || ""} />
                    {existingVessel?.stage && <StageBadge stage={existingVessel.stage} />}
                  </>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {existingVessel && (
              <div className="flex gap-2 mb-4">
                <Button variant="outline" size="sm" asChild><Link href={`/vessels/${existingVessel.id}`}>View Details</Link></Button>
                {existingVessel.status !== "multiplied" && existingVessel.status !== "disposed" && (
                  <Button variant="outline" size="sm" asChild><Link href={`/multiply/${existingVessel.id}`}>Multiply</Link></Button>
                )}
              </div>
            )}

            <fieldset disabled={saving} className="grid grid-cols-1 sm:grid-cols-2 gap-4 [&>*]:min-w-0 [&>*]:break-words">
              <div className="space-y-2">
                <Label htmlFor="scan-cultivar">Cultivar</Label>
                <Select value={cultivarId} onValueChange={setCultivarId}>
                  <SelectTrigger id="scan-cultivar">
                    <SelectValue placeholder="Select cultivar" />
                  </SelectTrigger>
                  <SelectContent>
                    {cultivars.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="scan-explants">Explant Count</Label>
                <Input id="scan-explants" type="number" value={explantCount} onChange={(e) => setExplantCount(e.target.value)} min="0" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="scan-health">Health Status</Label>
                <Select value={healthStatus} onValueChange={setHealthStatus}>
                  <SelectTrigger id="scan-health"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(HEALTH_STATUS_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="scan-stage">Stage</Label>
                <Select value={stage} onValueChange={setStage}>
                  <SelectTrigger id="scan-stage"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(STAGE_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="scan-status">Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger id="scan-status"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(VESSEL_STATUS_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="scan-notes">Notes</Label>
                <Textarea id="scan-notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional notes..." rows={2} />
              </div>
            </fieldset>

            {existingVessel?.parentVessel && (
              <p className="text-sm text-muted-foreground">
                Parent: <span className="font-mono">{existingVessel.parentVessel.barcode}</span>
              </p>
            )}
            {existingVessel?.childVessels && existingVessel.childVessels.length > 0 && (
              <p className="text-sm text-muted-foreground">
                Children: {existingVessel.childVessels.length} vessels
              </p>
            )}

            {saveError && <p role="alert" className="text-sm text-destructive">{saveError}</p>}
            <div className="flex flex-wrap gap-2 pt-2" aria-busy={saving}>
              <Button onClick={handleSave} disabled={saving} className="min-h-11 flex-1">
                {saving ? "Saving vessel…" : isNew ? "Create Vessel" : "Update Vessel"}
              </Button>
              <Button variant="outline" className="min-h-11" disabled={saving} onClick={handleReset}>
                Scan Another
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {existingVessel && !lookupError && !lookingUp && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Current Info</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2 text-sm [&>*]:min-w-0 [&>*]:break-words">
              <span className="text-muted-foreground">Cultivar</span>
              <span>{existingVessel.cultivar?.name || "—"}</span>
              <span className="text-muted-foreground">Stage</span>
              <span>{existingVessel.stage ? <StageBadge stage={existingVessel.stage} /> : "—"}</span>
              <span className="text-muted-foreground">Explants</span>
              <span>{existingVessel.explantCount}</span>
              <span className="text-muted-foreground">Health</span>
              <HealthBadge status={existingVessel.healthStatus} />
              <span className="text-muted-foreground">Generation</span>
              <span>{existingVessel.generation || 0}</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
