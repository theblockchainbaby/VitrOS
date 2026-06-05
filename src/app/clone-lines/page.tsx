"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/page-header";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, GitBranch, FlaskConical } from "lucide-react";
import { STAGE_LABELS } from "@/lib/constants";

interface CloneLine {
  id: string;
  name: string;
  code: string | null;
  cultivar: { id: string; name: string; code: string | null };
  sourceType: string;
  status: string;
  notes: string | null;
  vesselCount: number;
  byStage: Record<string, number>;
  byHealth: Record<string, number>;
  createdAt: string;
  // Phase 1 multi-vertical
  collectionSite?: string | null;
  collectionGPS?: string | null;
  voucherRef?: string | null;
  releaseStatus?: string | null;
}

const RELEASE_STATUS_COLORS: Record<string, string> = {
  source: "bg-slate-500/10 text-slate-600",
  foundation: "bg-blue-500/10 text-blue-600",
  registered: "bg-violet-500/10 text-violet-600",
  certified: "bg-green-600/10 text-green-700",
  retired: "bg-gray-400/10 text-gray-500",
};

interface Cultivar {
  id: string;
  name: string;
  code: string | null;
}

const STATUS_COLORS: Record<string, string> = {
  active: "bg-green-500/10 text-green-600",
  retired: "bg-gray-500/10 text-gray-600",
  quarantined: "bg-red-500/10 text-red-600",
};

export default function CloneLinesPage() {
  const [cloneLines, setCloneLines] = useState<CloneLine[]>([]);
  const [cultivars, setCultivars] = useState<Cultivar[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [releaseFilter, setReleaseFilter] = useState<string>("all");
  const [form, setForm] = useState({
    name: "",
    code: "",
    cultivarId: "",
    sourceType: "mother_plant",
    notes: "",
    collectionSite: "",
    collectionGPS: "",
    voucherRef: "",
    releaseStatus: "",
  });

  useEffect(() => {
    Promise.all([
      fetch("/api/clone-lines").then((r) => r.json()),
      fetch("/api/cultivars").then((r) => r.json()),
    ]).then(([lines, cultivarData]) => {
      setCloneLines(lines);
      setCultivars(Array.isArray(cultivarData) ? cultivarData : cultivarData.cultivars || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  async function handleCreate() {
    const res = await fetch("/api/clone-lines", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        code: form.code || null,
        notes: form.notes || null,
        collectionSite: form.collectionSite || null,
        collectionGPS: form.collectionGPS || null,
        voucherRef: form.voucherRef || null,
        releaseStatus: form.releaseStatus || null,
      }),
    });
    if (res.ok) {
      setDialogOpen(false);
      setForm({
        name: "", code: "", cultivarId: "", sourceType: "mother_plant", notes: "",
        collectionSite: "", collectionGPS: "", voucherRef: "", releaseStatus: "",
      });
      const updated = await fetch("/api/clone-lines").then((r) => r.json());
      setCloneLines(updated);
    }
  }

  const filteredLines = releaseFilter === "all"
    ? cloneLines
    : releaseFilter === "none"
      ? cloneLines.filter((cl) => !cl.releaseStatus)
      : cloneLines.filter((cl) => cl.releaseStatus === releaseFilter);

  const totalVessels = cloneLines.reduce((sum, cl) => sum + cl.vesselCount, 0);
  const activeLines = cloneLines.filter((cl) => cl.status === "active").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Clone Lines"
        description="Track genetic lineages from mother plant through production"
      />

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Active Lines</p>
            <p className="text-2xl font-bold">{activeLines}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Total Lines</p>
            <p className="text-2xl font-bold">{cloneLines.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Vessels Tracked</p>
            <p className="text-2xl font-bold">{totalVessels.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Cultivars</p>
            <p className="text-2xl font-bold">{new Set(cloneLines.map((cl) => cl.cultivar.id)).size}</p>
          </CardContent>
        </Card>
      </div>

      {/* New clone line button */}
      <div className="flex justify-end">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="size-4 mr-2" /> New Clone Line</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Clone Line</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <Label>Name</Label>
                <Input
                  placeholder="e.g. Spathiphyllum-CL001"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Code (optional)</Label>
                <Input
                  placeholder="e.g. SP-001"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Cultivar</Label>
                <Select value={form.cultivarId} onValueChange={(v) => setForm({ ...form, cultivarId: v })}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select cultivar" /></SelectTrigger>
                  <SelectContent>
                    {cultivars.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Source Type</Label>
                <Select value={form.sourceType} onValueChange={(v) => setForm({ ...form, sourceType: v })}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mother_plant">Mother Plant</SelectItem>
                    <SelectItem value="meristem">Meristem</SelectItem>
                    <SelectItem value="seed">Seed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Notes</Label>
                <Input
                  placeholder="Optional notes"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div className="pt-3 border-t">
                <p className="text-xs font-medium text-muted-foreground mb-3">Conservation provenance (optional, for wild-collected accessions)</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Collection site</Label>
                    <Input
                      placeholder="e.g. Sheehy Springs"
                      value={form.collectionSite}
                      onChange={(e) => setForm({ ...form, collectionSite: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">GPS (lat,lng)</Label>
                    <Input
                      placeholder="e.g. 31.4823,-110.5421"
                      value={form.collectionGPS}
                      onChange={(e) => setForm({ ...form, collectionGPS: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                </div>
                <div className="mt-3">
                  <Label className="text-xs">Voucher / accession reference</Label>
                  <Input
                    placeholder="e.g. DBG-SPI-2026-001"
                    value={form.voucherRef}
                    onChange={(e) => setForm({ ...form, voucherRef: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="pt-3 border-t">
                <Label className="text-xs">Clean-stock release status (optional, FPS / NCGR chain)</Label>
                <Select
                  value={form.releaseStatus || "none"}
                  onValueChange={(v) => setForm({ ...form, releaseStatus: v === "none" ? "" : v })}
                >
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Not classified</SelectItem>
                    <SelectItem value="source">Source</SelectItem>
                    <SelectItem value="foundation">Foundation</SelectItem>
                    <SelectItem value="registered">Registered</SelectItem>
                    <SelectItem value="certified">Certified</SelectItem>
                    <SelectItem value="retired">Retired</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleCreate} className="w-full" disabled={!form.name || !form.cultivarId}>
                Create Clone Line
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Release-status filter */}
      {cloneLines.length > 0 && (
        <div className="flex items-center gap-2">
          <Label className="text-sm">Release status:</Label>
          <Select value={releaseFilter} onValueChange={setReleaseFilter}>
            <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All lines</SelectItem>
              <SelectItem value="none">Not classified</SelectItem>
              <SelectItem value="source">Source</SelectItem>
              <SelectItem value="foundation">Foundation</SelectItem>
              <SelectItem value="registered">Registered</SelectItem>
              <SelectItem value="certified">Certified</SelectItem>
              <SelectItem value="retired">Retired</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-xs text-muted-foreground">
            {filteredLines.length} of {cloneLines.length}
          </span>
        </div>
      )}

      {/* Clone lines list */}
      {loading ? (
        <Card><CardContent className="py-8 text-center text-muted-foreground">Loading...</CardContent></Card>
      ) : filteredLines.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <GitBranch className="size-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium">
              {cloneLines.length === 0 ? "No Clone Lines Yet" : "No lines match this filter"}
            </h3>
            <p className="text-muted-foreground mt-1">
              {cloneLines.length === 0
                ? "Create your first clone line to start tracking genetic lineages."
                : "Try a different release-status filter."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredLines.map((cl) => (
            <Card key={cl.id}>
              <CardContent className="pt-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <GitBranch className="size-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{cl.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {cl.cultivar.name} {cl.code && `(${cl.code})`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {cl.releaseStatus && (
                      <Badge className={RELEASE_STATUS_COLORS[cl.releaseStatus] || "bg-muted"}>
                        {cl.releaseStatus}
                      </Badge>
                    )}
                    <Badge className={STATUS_COLORS[cl.status]}>{cl.status}</Badge>
                    <Badge variant="outline" className="gap-1">
                      <FlaskConical className="size-3" /> {cl.vesselCount}
                    </Badge>
                  </div>
                </div>
                {(cl.collectionSite || cl.voucherRef) && (
                  <div className="mt-2 text-xs text-muted-foreground space-y-0.5">
                    {cl.collectionSite && <div>Wild population: {cl.collectionSite}{cl.collectionGPS ? ` (${cl.collectionGPS})` : ""}</div>}
                    {cl.voucherRef && <div>Voucher: <span className="font-mono">{cl.voucherRef}</span></div>}
                  </div>
                )}

                {/* Stage breakdown */}
                {cl.vesselCount > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {Object.entries(cl.byStage).map(([stage, count]) => (
                      <div key={stage} className="text-xs px-2 py-1 rounded bg-muted">
                        {STAGE_LABELS[stage] || stage}: <span className="font-mono font-medium">{count}</span>
                      </div>
                    ))}
                  </div>
                )}

                {cl.notes && (
                  <p className="mt-3 text-sm text-muted-foreground">{cl.notes}</p>
                )}

                <p className="mt-2 text-xs text-muted-foreground">
                  Source: {cl.sourceType.replace("_", " ")} | Created {new Date(cl.createdAt).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
