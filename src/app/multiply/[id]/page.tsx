"use client";

import { useEffect, useState, use, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PageError } from "@/components/page-state";
import { PageHeader } from "@/components/page-header";
import { StatusBadge, StageBadge } from "@/components/status-badge";
import { BarcodeScanner } from "@/components/barcode-scanner";
import type { Vessel } from "@/lib/types";
import { toast } from "sonner";

interface NewVessel {
  barcode: string;
  explantCount: number;
  notes: string;
}

export default function MultiplyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [parent, setParent] = useState<Vessel | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [newVessels, setNewVessels] = useState<NewVessel[]>([]);
  const [scanningIndex, setScanningIndex] = useState<number | null>(null);

  const fetchParent = useCallback(() => {
    setLoadError(null);
    setLoading(true);
    fetch(`/api/vessels/${id}`)
      .then((r) => { if (!r.ok) throw new Error(r.status === 404 ? "Parent vessel not found." : "Parent vessel could not be loaded. Try again."); return r.json(); })
      .then(setParent)
      .catch(() => setLoadError("Parent vessel could not be loaded. Try again."))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => { fetchParent(); }, [fetchParent]);

  const addVessel = () => {
    setNewVessels([...newVessels, { barcode: "", explantCount: 0, notes: "" }]);
  };

  const updateVessel = (index: number, field: keyof NewVessel, value: string | number) => {
    const updated = [...newVessels];
    updated[index] = { ...updated[index], [field]: value };
    setNewVessels(updated);
  };

  const removeVessel = (index: number) => {
    setNewVessels(newVessels.filter((_, i) => i !== index));
  };

  const handleBarcodeScan = (barcode: string, index: number) => {
    updateVessel(index, "barcode", barcode);
    setScanningIndex(null);
  };

  const handleSubmit = async () => {
    if (newVessels.length === 0) {
      toast.error("Add at least one child vessel");
      return;
    }
    const empty = newVessels.find((v) => !v.barcode);
    if (empty) {
      toast.error("All vessels need a barcode");
      return;
    }

    if (submitting) return;
    setSaveError(null);
    setSubmitting(true);
    try {
      const res = await fetch(`/api/vessels/${id}/multiply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          children: newVessels.map((v) => ({
            barcode: v.barcode,
            explantCount: v.explantCount,
            notes: v.notes || null,
          })),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        setSaveError(err.error || "Multiplication failed. The child vessel entries have been kept.");
        return;
      }

      toast.success(`Created ${newVessels.length} new vessels from ${parent?.barcode}`);
      router.push(`/vessels/${id}`);
    } catch {
      setSaveError("The multiplication could not be confirmed. All entries have been kept. Check the parent record before retrying.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loadError) return <PageError message={loadError} retry={fetchParent} />;
  if (loading) return <div className="text-center py-12 text-muted-foreground">Loading...</div>;
  if (!parent) return <div className="text-center py-12 text-muted-foreground">Vessel not found</div>;

  return (
    <div className="min-w-0 space-y-6 max-w-5xl mx-auto">
      <PageHeader
        title="Multiply Vessel"
        description={`Split ${parent.barcode} into new vessels`}
      />

      <Button variant="outline" asChild><Link href={`/vessels/${id}`}>View parent record</Link></Button>
      {/* Parent info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Parent Vessel</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2 text-sm [&>*]:min-w-0 [&>*]:break-words">
            <span className="text-muted-foreground">Barcode</span>
            <span className="font-mono">{parent.barcode}</span>
            <span className="text-muted-foreground">Cultivar</span>
            <span>{parent.cultivar?.name || "—"}</span>
            <span className="text-muted-foreground">Stage</span>
            <StageBadge stage={parent.stage} />
            <span className="text-muted-foreground">Current Explants</span>
            <span className="font-mono">{parent.explantCount}</span>
            <span className="text-muted-foreground">Status</span>
            <StatusBadge status={parent.status} />
          </div>
        </CardContent>
      </Card>

      <fieldset disabled={submitting} className="min-w-0 space-y-6">
      {/* New vessels */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-semibold">New Child Vessels ({newVessels.length})</h2>
          <Button onClick={addVessel} variant="outline" size="sm">
            + Add Vessel
          </Button>
        </div>

        {newVessels.length === 0 && (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              <p>Click &quot;Add Vessel&quot; to start adding child vessels</p>
            </CardContent>
          </Card>
        )}

        {newVessels.map((nv, i) => (
          <Card key={i}>
            <CardContent className="pt-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-sm font-medium">Vessel #{i + 1}</span>
                <Button variant="ghost" size="sm" onClick={() => removeVessel(i)} className="text-destructive">
                  Remove
                </Button>
              </div>

              {scanningIndex === i ? (
                <BarcodeScanner
                  onScan={(code) => handleBarcodeScan(code, i)}
                  placeholder="Scan child vessel barcode..."
                />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 [&>*]:min-w-0 [&>*]:break-words">
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor={`multiply-id-field-1-${i}`}>Barcode</Label>
                    <div className="flex flex-wrap gap-2">
                      <Input id={`multiply-id-field-1-${i}`}
                        value={nv.barcode}
                        onChange={(e) => updateVessel(i, "barcode", e.target.value)}
                        placeholder="Vessel barcode"
                        className="min-w-0 font-mono flex-1"
                      />
                      <Button variant="outline" size="sm" onClick={() => setScanningIndex(i)}>
                        Scan
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`multiply-id-field-2-${i}`}>Explant Count</Label>
                    <Input id={`multiply-id-field-2-${i}`}
                      type="number"
                      value={nv.explantCount}
                      onChange={(e) => updateVessel(i, "explantCount", parseInt(e.target.value) || 0)}
                      min="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`multiply-id-field-3-${i}`}>Media recipe (inherited)</Label>
                    <Input id={`multiply-id-field-3-${i}`}
                      value={parent.mediaRecipe?.name || "No recipe assigned"}
                      readOnly
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor={`multiply-id-field-4-${i}`}>Notes</Label>
                    <Textarea id={`multiply-id-field-4-${i}`}
                      value={nv.notes}
                      onChange={(e) => updateVessel(i, "notes", e.target.value)}
                      placeholder="Optional..."
                      rows={1}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {saveError && <p role="alert" className="text-sm text-destructive">{saveError}</p>}
      {newVessels.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <Button onClick={handleSubmit} disabled={submitting} className="min-h-11 h-auto whitespace-normal min-w-0 flex-1">
            {submitting ? "Creating..." : `Multiply into ${newVessels.length} Vessels`}
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
