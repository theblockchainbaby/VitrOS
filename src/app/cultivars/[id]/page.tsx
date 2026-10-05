"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageError } from "@/components/page-state";
import { PageHeader } from "@/components/page-header";
import { CultivarHealthBadge, StageBadge, HealthBadge } from "@/components/status-badge";
import { STAGE_LABELS, HEALTH_STATUS_LABELS } from "@/lib/constants";
import { toast } from "sonner";
import { ArrowLeft, Pencil, RotateCcw, Plus, FlaskConical, ChevronRight } from "lucide-react";

interface CloneLine {
  id: string;
  name: string;
  code: string | null;
  lineNumber: number | null;
  status: string;
  sourceType: string;
  lastTestResult: string | null;
  lastTestedAt: string | null;
  vesselCount: number;
  byStage: Record<string, number>;
  createdAt: string;
}

interface CultivarMetrics {
  totalVessels: number;
  activeVessels: number;
  disposedVessels: number;
  totalExplants: number;
  contaminationRate: number;
  healthyRate: number;
  cultivarHealth: string;
  vesselsByStage: { stage: string; count: number }[];
  vesselsByHealthStatus: { status: string; count: number }[];
  vesselsByStatus: { status: string; count: number }[];
}

interface StageConfigEntry {
  name: string;
  durationWeeks: number;
  multiplicationRate: number;
  survivalRate: number;
}

interface CultivarDetail {
  id: string;
  name: string;
  code: string | null;
  cultivarType: string;
  species: string;
  strain: string | null;
  geneticLineage: string | null;
  description: string | null;
  notes: string | null;
  targetMultiplicationRate: number | null;
  stageConfig: { stages: StageConfigEntry[] } | null;
  defaultMediaRecipe: { id: string; name: string } | null;
  createdAt: string;
  updatedAt: string;
  metrics: CultivarMetrics;
}

export default function CultivarDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [cultivar, setCultivar] = useState<CultivarDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", code: "", cultivarType: "in_house", species: "", strain: "", description: "" });
  const [saving, setSaving] = useState(false);
  const [stageConfig, setStageConfig] = useState<StageConfigEntry[]>([]);
  const [savingStages, setSavingStages] = useState(false);
  const [cloneLines, setCloneLines] = useState<CloneLine[]>([]);
  const [linesError, setLinesError] = useState<string | null>(null);
  const [linesLoading, setLinesLoading] = useState(true);
  const [newLineOpen, setNewLineOpen] = useState(false);
  const [newLineForm, setNewLineForm] = useState({ name: "", code: "", lineNumber: "", sourceType: "mother_plant", notes: "" });
  const [savingLine, setSavingLine] = useState(false);

  const fetchCultivar = () => {
    setLoadError(null);
    setLoading(true);
    fetch(`/api/cultivars/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error(r.status === 404 ? "Cultivar not found." : "Cultivar could not be loaded. Try again.");
        return r.json();
      })
      .then((data) => {
        setCultivar(data);
        setNotes(data.notes || "");
        setStageConfig(data.stageConfig?.stages || getDefaultStages());
      })
      .catch((error) => setLoadError(error instanceof Error ? error.message : "Cultivar could not be loaded. Try again."))
      .finally(() => setLoading(false));
  };

  const fetchCloneLines = () => {
    setLinesLoading(true);
    setLinesError(null);
    fetch(`/api/clone-lines?cultivarId=${id}&status=all`)
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then((data) => setCloneLines(Array.isArray(data) ? data : []))
      .catch(() => setLinesError("Clone lines could not be loaded."))
      .finally(() => setLinesLoading(false));
  };

  useEffect(() => {
    fetchCultivar();
    fetchCloneLines();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleSaveNotes = async () => {
    setSavingNotes(true);
    try {
      const res = await fetch(`/api/cultivars/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: notes || null }),
      });
      if (res.ok) {
        toast.success("Notes saved");
      } else {
        toast.error("Failed to save notes");
      }
    } catch {
      toast.error("The operation could not be confirmed. Your entries have been kept. Check the record before retrying.");
    } finally {
      setSavingNotes(false);
    }
  };

  const openEdit = () => {
    if (!cultivar) return;
    setEditForm({
      name: cultivar.name,
      code: cultivar.code || "",
      cultivarType: cultivar.cultivarType,
      species: cultivar.species,
      strain: cultivar.strain || "",
      description: cultivar.description || "",
    });
    setEditOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editForm.name.trim()) {
      toast.error("Name is required");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/cultivars/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editForm.name.trim(),
          code: editForm.code.trim() || null,
          cultivarType: editForm.cultivarType,
          species: editForm.species.trim(),
          strain: editForm.strain.trim() || null,
          description: editForm.description.trim() || null,
        }),
      });
      if (res.ok) {
        toast.success("Cultivar updated");
        setEditOpen(false);
        fetchCultivar();
      } else {
        toast.error("Failed to update cultivar");
      }
    } catch {
      toast.error("The operation could not be confirmed. Your entries have been kept. Check the record before retrying.");
    } finally {
      setSaving(false);
    }
  };

  const handleCreateLine = async () => {
    if (!newLineForm.name.trim()) {
      toast.error("Line name is required");
      return;
    }
    setSavingLine(true);
    try {
      const res = await fetch("/api/clone-lines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newLineForm.name.trim(),
          code: newLineForm.code.trim() || null,
          lineNumber: newLineForm.lineNumber ? parseInt(newLineForm.lineNumber) : null,
          cultivarId: id,
          sourceType: newLineForm.sourceType,
          notes: newLineForm.notes.trim() || null,
        }),
      });
      if (res.ok) {
        toast.success("Clone line created");
        setNewLineOpen(false);
        setNewLineForm({ name: "", code: "", lineNumber: "", sourceType: "mother_plant", notes: "" });
        fetchCloneLines();
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to create line");
      }
    } catch {
      toast.error("The operation could not be confirmed. Your entries have been kept. Check the record before retrying.");
    } finally {
      setSavingLine(false);
    }
  };

  function getDefaultStages(): StageConfigEntry[] {
    return [
      { name: "initiation", durationWeeks: 4, multiplicationRate: 1, survivalRate: 0.85 },
      { name: "multiplication", durationWeeks: 6, multiplicationRate: 3, survivalRate: 0.92 },
      { name: "rooting", durationWeeks: 4, multiplicationRate: 1, survivalRate: 0.90 },
      { name: "acclimation", durationWeeks: 4, multiplicationRate: 1, survivalRate: 0.88 },
      { name: "hardening", durationWeeks: 3, multiplicationRate: 1, survivalRate: 0.95 },
    ];
  }

  const updateStageField = (index: number, field: keyof StageConfigEntry, value: number) => {
    setStageConfig((prev) => prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)));
  };

  const handleSaveStageConfig = async () => {
    setSavingStages(true);
    try {
      const res = await fetch(`/api/cultivars/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stageConfig: { stages: stageConfig } }),
      });
      if (res.ok) {
        toast.success("Stage pipeline saved");
        fetchCultivar();
      } else {
        toast.error("Failed to save stage config");
      }
    } catch {
      toast.error("The operation could not be confirmed. Your entries have been kept. Check the record before retrying.");
    } finally {
      setSavingStages(false);
    }
  };

  const totalPipelineWeeks = stageConfig.reduce((sum, s) => sum + s.durationWeeks, 0);

  if (loadError) return <PageError message={loadError} retry={fetchCultivar} />;
  if (loading) return <div className="text-center py-12 text-muted-foreground">Loading...</div>;
  if (!cultivar) return <div className="text-center py-12 text-muted-foreground">Cultivar not found</div>;

  const m = cultivar.metrics;

  // Build full stage list with counts (even 0)
  const stageEntries = Object.entries(STAGE_LABELS).map(([key, label]) => ({
    key,
    label,
    count: m.vesselsByStage.find((s) => s.stage === key)?.count ?? 0,
  }));

  // Build full health status list
  const healthEntries = Object.entries(HEALTH_STATUS_LABELS).map(([key, label]) => ({
    key,
    label,
    count: m.vesselsByHealthStatus.find((s) => s.status === key)?.count ?? 0,
  }));

  return (
    <div className="min-w-0 space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/cultivars" aria-label="Back to cultivars">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <div className="min-w-0 flex-1">
          <PageHeader
            title={cultivar.name}
            description={cultivar.species + (cultivar.strain ? ` — ${cultivar.strain}` : "")}
            actions={
              <div className="flex flex-wrap items-center gap-2">
                <CultivarHealthBadge status={m.cultivarHealth} />
                <Dialog open={editOpen} onOpenChange={setEditOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" onClick={openEdit}>
                      <Pencil className="size-3.5 mr-1.5" /> Edit
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Edit Cultivar</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-2">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 [&>*]:min-w-0 [&>*]:break-words">
                        <div className="space-y-2">
                          <Label htmlFor="cultivars-id-field-1">Name</Label>
                          <Input id="cultivars-id-field-1" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} autoFocus />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cultivars-id-field-2">Code</Label>
                          <Input id="cultivars-id-field-2" value={editForm.code} onChange={(e) => setEditForm({ ...editForm, code: e.target.value.toUpperCase() })} className="font-mono" />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 [&>*]:min-w-0 [&>*]:break-words">
                        <div className="space-y-2">
                          <Label htmlFor="cultivars-id-field-3">Type</Label>
                          <Select value={editForm.cultivarType} onValueChange={(v) => setEditForm({ ...editForm, cultivarType: v })}>
                            <SelectTrigger id="cultivars-id-field-3"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="in_house">In-House</SelectItem>
                              <SelectItem value="client">Client</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cultivars-id-field-4">Species</Label>
                          <Input id="cultivars-id-field-4" value={editForm.species} onChange={(e) => setEditForm({ ...editForm, species: e.target.value })} placeholder="e.g., Spathiphyllum wallisii" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cultivars-id-field-5">Variety / Strain (optional)</Label>
                        <Input id="cultivars-id-field-5" value={editForm.strain} onChange={(e) => setEditForm({ ...editForm, strain: e.target.value })} placeholder="e.g., Domino" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cultivars-id-field-6">Description (optional)</Label>
                        <Input id="cultivars-id-field-6" value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} />
                      </div>
                      <Button onClick={handleSaveEdit} disabled={saving} className="w-full">
                        {saving ? "Saving..." : "Save Changes"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            }
          />
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 [&>*]:min-w-0 [&>*]:break-words">
        <div className="text-center p-4 bg-muted/50 rounded-lg">
          <p className="text-2xl font-mono font-bold">{m.activeVessels}</p>
          <p className="text-xs text-muted-foreground">Active Vessels</p>
        </div>
        <div className="text-center p-4 bg-muted/50 rounded-lg">
          <p className="text-2xl font-mono font-bold">{m.totalExplants.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">Total Explants</p>
        </div>
        <div className="text-center p-4 bg-muted/50 rounded-lg">
          <p className={`text-2xl font-mono font-bold ${m.contaminationRate > 10 ? "text-red-600" : ""}`}>
            {m.contaminationRate}%
          </p>
          <p className="text-xs text-muted-foreground">Contamination Rate</p>
        </div>
        <div className="text-center p-4 bg-muted/50 rounded-lg">
          <p className="text-2xl font-mono font-bold">{m.healthyRate}%</p>
          <p className="text-xs text-muted-foreground">Healthy Rate</p>
        </div>
      </div>

      {/* Vessels by Stage */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Vessels by Stage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 [&>*]:min-w-0 [&>*]:break-words">
            {stageEntries.map((s) => (
              <div key={s.key} className="text-center space-y-1">
                <StageBadge stage={s.key} />
                <p className="text-xl font-mono font-bold">{s.count}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Vessels by Health Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Vessels by Health</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 [&>*]:min-w-0 [&>*]:break-words">
            {healthEntries.map((h) => (
              <div key={h.key} className="text-center space-y-1">
                <HealthBadge status={h.key} />
                <p className="text-xl font-mono font-bold">{h.count}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Meristematic Lines */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex flex-wrap items-center justify-between gap-3">
            <span className="flex flex-wrap items-center gap-2">
              <FlaskConical className="size-4" />
              Meristematic Lines
              <span className="text-sm font-normal text-muted-foreground">({cloneLines.length})</span>
            </span>
            <Dialog open={newLineOpen} onOpenChange={setNewLineOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  <Plus className="size-3.5 mr-1.5" /> New Line
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>New Clone Line</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 [&>*]:min-w-0 [&>*]:break-words">
                    <div className="space-y-2">
                      <Label htmlFor="cultivars-id-field-7">Line Name</Label>
                      <Input id="cultivars-id-field-7"
                        value={newLineForm.name}
                        onChange={(e) => setNewLineForm({ ...newLineForm, name: e.target.value })}
                        placeholder="e.g., Gelato 33-A"
                        autoFocus
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cultivars-id-field-8">Line # (optional)</Label>
                      <Input id="cultivars-id-field-8"
                        type="number"
                        min={1}
                        value={newLineForm.lineNumber}
                        onChange={(e) => setNewLineForm({ ...newLineForm, lineNumber: e.target.value })}
                        placeholder="e.g., 1"
                        className="font-mono"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 [&>*]:min-w-0 [&>*]:break-words">
                    <div className="space-y-2">
                      <Label htmlFor="cultivars-id-field-9">Code (optional)</Label>
                      <Input id="cultivars-id-field-9"
                        value={newLineForm.code}
                        onChange={(e) => setNewLineForm({ ...newLineForm, code: e.target.value.toUpperCase() })}
                        placeholder="e.g., G33-A"
                        className="font-mono"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cultivars-id-field-10">Source Type</Label>
                      <Select value={newLineForm.sourceType} onValueChange={(v) => setNewLineForm({ ...newLineForm, sourceType: v })}>
                        <SelectTrigger id="cultivars-id-field-10"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mother_plant">Mother Plant</SelectItem>
                          <SelectItem value="meristem">Meristem</SelectItem>
                          <SelectItem value="seed">Seed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cultivars-id-field-11">Notes (optional)</Label>
                    <Textarea id="cultivars-id-field-11"
                      value={newLineForm.notes}
                      onChange={(e) => setNewLineForm({ ...newLineForm, notes: e.target.value })}
                      rows={2}
                      placeholder="Any initial observations..."
                    />
                  </div>
                  <Button onClick={handleCreateLine} disabled={savingLine} className="w-full">
                    {savingLine ? "Creating..." : "Create Line"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {linesError ? <PageError message={linesError} retry={fetchCloneLines} /> : linesLoading ? (
            <p className="text-sm text-muted-foreground text-center py-4">Loading lines...</p>
          ) : cloneLines.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No clone lines yet. Create your first line to start tracking meristematic cultures.
            </p>
          ) : (
            <div className="divide-y">
              {cloneLines.map((line) => (
                <Link
                  key={line.id}
                  href={`/clone-lines/${line.id}`}
                  className="flex flex-wrap items-center justify-between gap-3 py-3 px-1 hover:bg-muted/40 rounded transition-colors group"
                >
                  <div className="flex flex-wrap items-center gap-3">
                    {line.lineNumber && (
                      <span className="text-xs font-mono text-muted-foreground w-6 text-center">#{line.lineNumber}</span>
                    )}
                    <div>
                      <p className="text-sm font-medium">{line.name}</p>
                      {line.code && <p className="text-xs text-muted-foreground font-mono">{line.code}</p>}
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      line.status === "active" ? "bg-primary/10 text-primary" :
                      line.status === "quarantined" ? "bg-destructive/10 text-destructive" :
                      "bg-muted text-muted-foreground"
                    }`}>
                      {line.status}
                    </span>
                    {line.lastTestResult && (
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        line.lastTestResult === "clean" ? "bg-primary/10 text-primary" :
                        line.lastTestResult === "dirty" ? "bg-destructive/10 text-destructive" :
                        "bg-amber-500/10 text-amber-800 dark:text-amber-300"
                      }`}>
                        {line.lastTestResult === "clean" ? "Clean" : line.lastTestResult === "dirty" ? "Dirty" : "Inconclusive"}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span className="font-mono">{line.vesselCount} vessels</span>
                    <ChevronRight className="size-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cultivar Details */}
      {(cultivar.description || cultivar.geneticLineage || cultivar.targetMultiplicationRate || cultivar.defaultMediaRecipe) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2 text-sm [&>*]:min-w-0 [&>*]:break-words">
              {cultivar.description && (
                <>
                  <span className="text-muted-foreground">Description</span>
                  <span>{cultivar.description}</span>
                </>
              )}
              {cultivar.geneticLineage && (
                <>
                  <span className="text-muted-foreground">Genetic Lineage</span>
                  <span>{cultivar.geneticLineage}</span>
                </>
              )}
              {cultivar.targetMultiplicationRate && (
                <>
                  <span className="text-muted-foreground">Target Multiplication Rate</span>
                  <span>{cultivar.targetMultiplicationRate}x</span>
                </>
              )}
              {cultivar.defaultMediaRecipe && (
                <>
                  <span className="text-muted-foreground">Default Media Recipe</span>
                  <Link href={`/media/${cultivar.defaultMediaRecipe.id}`} className="text-primary hover:underline">
                    {cultivar.defaultMediaRecipe.name}
                  </Link>
                </>
              )}
              <span className="text-muted-foreground">Total Vessels (all time)</span>
              <span className="font-mono">{m.totalVessels}</span>
              <span className="text-muted-foreground">Disposed</span>
              <span className="font-mono">{m.disposedVessels}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stage Pipeline Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex flex-wrap items-center justify-between gap-3">
            <span>Stage Pipeline Configuration</span>
            <span className="text-sm font-normal text-muted-foreground">
              Total: {totalPipelineWeeks} weeks ({Math.round(totalPipelineWeeks / 4.3)} months)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 pr-3">Stage</th>
                  <th className="text-center py-2 px-2">Duration (wks)</th>
                  <th className="text-center py-2 px-2">Mult. Rate</th>
                  <th className="text-center py-2 px-2">Survival %</th>
                </tr>
              </thead>
              <tbody>
                {stageConfig.map((stage, i) => (
                  <tr key={stage.name} className="border-b last:border-0">
                    <td className="py-2 pr-3">
                      <StageBadge stage={stage.name} />
                    </td>
                    <td className="py-2 px-2">
                      <Input
                        type="number"
                        min={1}
                        max={52}
                        aria-label={`${stage.name} — Duration in weeks`}
                        value={stage.durationWeeks}
                        onChange={(e) => updateStageField(i, "durationWeeks", parseInt(e.target.value) || 1)}
                        className="w-20 mx-auto text-center h-8 font-mono"
                      />
                    </td>
                    <td className="py-2 px-2">
                      <Input
                        type="number"
                        min={1}
                        step={0.1}
                        aria-label={`${stage.name} — Multiplication rate`}
                        value={stage.multiplicationRate}
                        onChange={(e) => updateStageField(i, "multiplicationRate", parseFloat(e.target.value) || 1)}
                        className="w-20 mx-auto text-center h-8 font-mono"
                      />
                    </td>
                    <td className="py-2 px-2">
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        step={1}
                        aria-label={`${stage.name} — Survival percent`}
                        value={Math.round(stage.survivalRate * 100)}
                        onChange={(e) => updateStageField(i, "survivalRate", (parseInt(e.target.value) || 0) / 100)}
                        className="w-20 mx-auto text-center h-8 font-mono"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button onClick={handleSaveStageConfig} disabled={savingStages} size="sm">
              {savingStages ? "Saving..." : "Save Pipeline"}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setStageConfig(getDefaultStages())}
            >
              <RotateCcw className="size-3.5 mr-1.5" /> Reset Defaults
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notes & Observations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Notes & Observations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add observations, growing notes, or any remarks about this cultivar..."
            rows={4}
          />
          <Button onClick={handleSaveNotes} disabled={savingNotes} size="sm">
            {savingNotes ? "Saving..." : "Save Notes"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
