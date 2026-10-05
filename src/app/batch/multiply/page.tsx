"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/page-header";
import { StageBadge } from "@/components/status-badge";
import type { Vessel } from "@/lib/types";
import { toast } from "sonner";
import { BatchResults, type BatchResult, type BatchFailure } from "@/components/batch-results";

interface MultiplyGroup {
  parent: Vessel;
  childBarcodes: string[];
}

type ScanMode = "parent" | "child";

export default function BatchMultiplyPage() {
  const router = useRouter();
  const [groups, setGroups] = useState<MultiplyGroup[]>([]);
  const [scanMode, setScanMode] = useState<ScanMode>("parent");
  const [barcodeInput, setBarcodeInput] = useState("");
  const [scanning, setScanning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<BatchResult | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Currently active group (the one we're adding children to)
  const activeGroup = groups.length > 0 && scanMode === "child" ? groups[groups.length - 1] : null;

  const scanParent = useCallback(async (barcode: string) => {
    if (!barcode.trim() || scanning || submitting) return;

    // Check if this parent was already scanned
    if (groups.some((g) => g.parent.barcode === barcode.trim())) {
      toast.error("This parent is already queued. Choose Edit children on its group to continue.");
      return;
    }

    setScanning(true);
    try {
      const res = await fetch(`/api/vessels/barcode?code=${encodeURIComponent(barcode.trim())}`);
      if (!res.ok) throw new Error("Lookup failed");
      const data = await res.json();

      if (!data.found || !data.vessel) {
        toast.error(`Vessel not found: ${barcode}`);
        return;
      }

      if (data.isDisposed) {
        toast.error(`Vessel ${barcode} is ${data.vessel.status} — can't multiply`);
        return;
      }

      if (data.vessel.status === "multiplied") {
        toast.error(`Vessel ${barcode} was already multiplied`);
        return;
      }

      // Add new group and switch to child scanning mode
      setGroups((prev) => [...prev, { parent: data.vessel, childBarcodes: [] }]);
      setScanMode("child");
      toast.success(`Parent: ${data.vessel.barcode} (${data.vessel.cultivar?.name || "Unknown"})`);
      setBarcodeInput("");
    } catch {
      toast.error("Could not check this barcode. It has been kept for retry.");
    } finally {
      setScanning(false);
      inputRef.current?.focus();
    }
  }, [groups, scanning, submitting]);

  const scanChild = useCallback(async (barcode: string) => {
    if (!barcode.trim() || scanning || submitting) return;

    // Check if barcode is already used as a child in any group
    const alreadyUsed = groups.some((g) =>
      g.childBarcodes.includes(barcode.trim()) || g.parent.barcode === barcode.trim()
    );
    if (alreadyUsed) {
      toast.error("This barcode is already in use in this batch");
      setBarcodeInput("");
      inputRef.current?.focus();
      return;
    }

    // Check if barcode exists as an active vessel
    setScanning(true);
    try {
      const res = await fetch(`/api/vessels/barcode?code=${encodeURIComponent(barcode.trim())}`);
      if (!res.ok) throw new Error("Lookup failed");
      const data = await res.json();

      if (data.found && !data.isDisposed) {
        toast.error(`Barcode ${barcode} belongs to an active vessel — use a new barcode`);
        return;
      }

      // Add child barcode to current group
      setGroups((prev) => {
        const updated = [...prev];
        const last = updated[updated.length - 1];
        updated[updated.length - 1] = {
          ...last,
          childBarcodes: [...last.childBarcodes, barcode.trim()],
        };
        return updated;
      });
      toast.success(`Child #${(activeGroup?.childBarcodes.length || 0) + 1}: ${barcode.trim()}`);
      setBarcodeInput("");
    } catch {
      toast.error("Could not check this barcode. It has been kept for retry.");
    } finally {
      setScanning(false);
      inputRef.current?.focus();
    }
  }, [groups, activeGroup, scanning, submitting]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (scanMode === "parent") {
        scanParent(barcodeInput);
      } else {
        scanChild(barcodeInput);
      }
    }
  };

  const finishCurrentParent = () => {
    if (activeGroup && activeGroup.childBarcodes.length === 0) {
      toast.error("Scan at least one child vessel");
      return;
    }
    setScanMode("parent");
    inputRef.current?.focus();
  };

  const editGroup = (index: number) => {
    if (scanning || submitting) return;
    // The scanner targets the last group. Bring only the chosen parent to the
    // end, retaining every other parent and its child entries for later review.
    setGroups((previous) => {
      const group = previous[index];
      return group ? [...previous.filter((_, i) => i !== index), group] : previous;
    });
    setBarcodeInput("");
    setScanMode("child");
    inputRef.current?.focus();
  };

  const removeGroup = (index: number) => {
    setGroups((prev) => prev.filter((_, i) => i !== index));
    if (groups.length <= 1 || (scanMode === "child" && index === groups.length - 1)) {
      setScanMode("parent");
    }
  };

  const removeChild = (groupIndex: number, childIndex: number) => {
    setGroups((prev) => {
      const updated = [...prev];
      updated[groupIndex] = {
        ...updated[groupIndex],
        childBarcodes: updated[groupIndex].childBarcodes.filter((_, i) => i !== childIndex),
      };
      return updated;
    });
  };

  const submitAll = async () => {
    if (submitting || groups.length === 0) return;
    const incomplete = groups.filter((g) => g.childBarcodes.length === 0);
    if (incomplete.length > 0) {
      toast.error("All parents need at least one child vessel");
      return;
    }

    setResult(null);
    setSubmitting(true);
    let successCount = 0;
    let createdChildren = 0;
    const failedGroups: MultiplyGroup[] = [];
    const failures: BatchFailure[] = [];

    for (const group of groups) {
      try {
        const res = await fetch(`/api/vessels/${group.parent.id}/multiply`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            children: group.childBarcodes.map((barcode) => ({
              barcode,
              explantCount: 0,
            })),
          }),
        });

        if (res.ok) {
          successCount++;
          createdChildren += group.childBarcodes.length;
        } else {
          const err = await res.json();
          toast.error(`${group.parent.barcode}: ${err.error || "Failed"}`);
          failedGroups.push(group);
          failures.push({ id: group.parent.id, barcode: group.parent.barcode, error: err.error || "Multiplication failed" });
        }
      } catch {
        failedGroups.push(group);
        failures.push({ id: group.parent.id, barcode: group.parent.barcode, error: "Save could not be confirmed. Check this parent before retrying." });
      }
    }

    setGroups(failedGroups);
    setResult({ succeeded: successCount, total: groups.length, failures });
    setScanMode("parent");
    setSubmitting(false);
    if (successCount > 0) toast.success(`Multiplied ${successCount} parents into ${createdChildren} new vessels`);
    if (failures.length > 0) toast.error(`${failures.length} remaining. Review the queue before retrying.`);
  };

  const totalChildren = groups.reduce((sum, g) => sum + g.childBarcodes.length, 0);

  return (
    <div className="min-w-0 space-y-6 max-w-5xl mx-auto">
      <PageHeader
        title="Batch Multiply"
        description="Scan parents and their offspring to record multiplications in bulk"
      />

      <BatchResults result={result} />
      <fieldset disabled={submitting} className="min-w-0 space-y-6">
      {/* Scanner */}
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="min-w-0 break-words text-base font-semibold" aria-live="polite">
              {scanMode === "parent" ? "Scan Parent Vessel" : `Scan Children for ${activeGroup?.parent.barcode}`}
            </h2>
            {scanMode === "child" && (
              <span className="text-xs bg-muted text-foreground px-2 py-1 rounded">
                {activeGroup?.childBarcodes.length || 0} children scanned
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {scanMode === "child" && activeGroup && (
            <div className="rounded-lg bg-muted/50 p-3 text-sm">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-muted-foreground">Parent:</span>
                <span className="font-mono font-medium">{activeGroup.parent.barcode}</span>
                <span className="text-muted-foreground">—</span>
                <span>{activeGroup.parent.cultivar?.name || "Unknown"}</span>
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <Input
              ref={inputRef}
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={scanMode === "parent" ? "Scan parent barcode..." : "Scan child barcode..."}
              disabled={scanning}
              autoFocus
              className="min-w-0 flex-1 h-12 font-mono" aria-label="Vessel barcode"
            />
            <Button
              className="min-h-12"
              onClick={() => scanMode === "parent" ? scanParent(barcodeInput) : scanChild(barcodeInput)}
              disabled={scanning || !barcodeInput}
            >
              {scanning ? "..." : "Add"}
            </Button>
          </div>

          {scanMode === "child" && (
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={finishCurrentParent} className="min-h-11 h-auto whitespace-normal flex-1">
                Done with this parent — scan next parent
              </Button>
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            {scanMode === "parent"
              ? "Scan a parent vessel to start. Its cultivar, location, and media recipe will carry over to children."
              : "Scan each new child vessel barcode. Press Enter after each scan. Click \"Done\" when finished with this parent."
            }
          </p>
        </CardContent>
      </Card>

      {/* Groups summary */}
      {groups.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <CardTitle className="text-base">
                Multiplications ({groups.length} parents → {totalChildren} children)
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => { setGroups([]); setScanMode("parent"); }}>
                Clear All
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {groups.map((group, gi) => (
              <div key={group.parent.id} className="rounded-lg border p-3 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono font-medium text-sm">{group.parent.barcode}</span>
                    <span className="text-sm text-muted-foreground">{group.parent.cultivar?.name || ""}</span>
                    <StageBadge stage={group.parent.stage} />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" disabled={scanning || submitting} onClick={() => editGroup(gi)} className="min-h-11" aria-label={`Edit children for ${group.parent.barcode}`}>
                      Edit children
                    </Button>
                    <Button variant="ghost" size="sm" disabled={scanning || submitting} onClick={() => removeGroup(gi)} className="min-h-11 text-muted-foreground hover:text-destructive">
                      Remove parent
                    </Button>
                  </div>
                </div>
                {group.childBarcodes.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {group.childBarcodes.map((barcode, ci) => (
                      <span
                        key={barcode}
                        className="inline-flex items-center gap-1 text-xs font-mono bg-muted px-2 py-1 rounded"
                      >
                        → {barcode}
                        <button
                          aria-label={`Remove ${barcode}`}
                          onClick={() => removeChild(gi, ci)}
                          className="text-muted-foreground hover:text-destructive ml-1"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-amber-600 dark:text-amber-400">No children scanned yet</p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Submit */}
      {groups.length > 0 && scanMode === "parent" && (
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={submitAll}
            disabled={submitting || scanning || groups.some((g) => g.childBarcodes.length === 0)}
            className="min-h-11 h-auto whitespace-normal flex-1"
          >
            {submitting
              ? "Processing..."
              : `Multiply ${groups.length} Parent${groups.length > 1 ? "s" : ""} → ${totalChildren} Children`
            }
          </Button>
          <Button variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      )}
      </fieldset>
    </div>
  );
}
