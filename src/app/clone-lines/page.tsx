"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageError } from "@/components/page-state";
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
  source: "bg-muted text-muted-foreground",
  foundation: "bg-muted text-muted-foreground",
  registered: "bg-muted text-muted-foreground",
  certified: "bg-primary/10 text-primary",
  retired: "bg-muted text-muted-foreground",
};

interface Cultivar {
  id: string;
  name: string;
  code: string | null;
}

const STATUS_COLORS: Record<string, string> = {
  active: "bg-primary/10 text-primary",
  retired: "bg-muted text-muted-foreground",
  quarantined: "bg-destructive/10 text-destructive",
};

export default function CloneLinesPage() {
  const [cloneLines, setCloneLines] = useState<CloneLine[]>([]);
  const [cultivars, setCultivars] = useState<Cultivar[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [search, setSearch] = useState("");
  const [createError, setCreateError] = useState<string | null>(null);
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

  const loadLines = () => {
    setLoading(true);
    setLoadError(null);
    Promise.all([
      fetch("/api/clone-lines").then((r) => { if (!r.ok) throw new Error(); return r.json(); }),
      fetch("/api/cultivars").then((r) => { if (!r.ok) throw new Error(); return r.json(); }),
    ]).then(([lines, cultivarData]) => {
      setCloneLines(lines);
      setCultivars(Array.isArray(cultivarData) ? cultivarData : cultivarData.cultivars || []);
    }).catch(() => setLoadError("Clone lines could not be loaded. Retry to see lineages and their release status.")).finally(() => setLoading(false));
  };
  useEffect(() => { loadLines(); }, []);

  async function handleCreate() {
    if (creating) return;
    setCreating(true);
    setCreateError(null);
    try {
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
      toast.success("Clone line created");
      loadLines();
    } else {
      const data = await res.json();
      setCreateError(data.error || "The clone line could not be created. Your entries have been kept.");
    }
    } catch {
      setCreateError("The save could not be confirmed. Your entries have been kept.");
    } finally { setCreating(false); }
  }

  const filteredLines = cloneLines.filter((line) => {
    const matchesRelease = releaseFilter === "all" || (releaseFilter === "none" ? !line.releaseStatus : line.releaseStatus === releaseFilter);
    const query = search.trim().toLowerCase();
    return matchesRelease && (!query || `${line.name} ${line.code || ""} ${line.cultivar.name}`.toLowerCase().includes(query));
  });

  const totalVessels = cloneLines.reduce((sum, cl) => sum + cl.vesselCount, 0);
  const activeLines = cloneLines.filter((cl) => cl.status === "active").length;

  return (
    <div className="min-w-0 space-y-6">
      <PageHeader
        title="Clone Lines"
        description="Track genetic lineages from mother plant through production"
      />

      {/* Summary cards */}
      {!loading && !loadError && <div className="grid grid-cols-2 md:grid-cols-4 gap-4 [&>*]:min-w-0 [&>*]:break-words">
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
      </div>}

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
                <Label htmlFor="clone-lines-field-1">Name</Label>
                <Input id="clone-lines-field-1"
                  placeholder="e.g. Spathiphyllum-CL001"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="clone-lines-field-2">Code (optional)</Label>
                <Input id="clone-lines-field-2"
                  placeholder="e.g. SP-001"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="clone-lines-field-3">Cultivar</Label>
                <Select value={form.cultivarId} onValueChange={(v) => setForm({ ...form, cultivarId: v })}>
                  <SelectTrigger id="clone-lines-field-3" className="mt-1"><SelectValue placeholder="Select cultivar" /></SelectTrigger>
                  <SelectContent>
                    {cultivars.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="clone-lines-field-4">Source Type</Label>
                <Select value={form.sourceType} onValueChange={(v) => setForm({ ...form, sourceType: v })}>
                  <SelectTrigger id="clone-lines-field-4" className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mother_plant">Mother Plant</SelectItem>
                    <SelectItem value="meristem">Meristem</SelectItem>
                    <SelectItem value="seed">Seed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="clone-lines-field-5">Notes</Label>
                <Input id="clone-lines-field-5"
                  placeholder="Optional notes"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div className="pt-3 border-t">
                <p className="text-xs font-medium text-muted-foreground mb-3">Conservation provenance (optional, for wild-collected accessions)</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 [&>*]:min-w-0 [&>*]:break-words">
                  <div>
                    <Label className="text-xs" htmlFor="clone-lines-field-6">Collection site</Label>
                    <Input id="clone-lines-field-6"
                      placeholder="e.g. Sheehy Springs"
                      value={form.collectionSite}
                      onChange={(e) => setForm({ ...form, collectionSite: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs" htmlFor="clone-lines-field-7">GPS (lat,lng)</Label>
                    <Input id="clone-lines-field-7"
                      placeholder="e.g. 31.4823,-110.5421"
                      value={form.collectionGPS}
                      onChange={(e) => setForm({ ...form, collectionGPS: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                </div>
                <div className="mt-3">
                  <Label className="text-xs" htmlFor="clone-lines-field-8">Voucher / accession reference</Label>
                  <Input id="clone-lines-field-8"
                    placeholder="e.g. DBG-SPI-2026-001"
                    value={form.voucherRef}
                    onChange={(e) => setForm({ ...form, voucherRef: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="pt-3 border-t">
                <Label className="text-xs" htmlFor="clone-lines-field-9">Clean-stock release status (optional, FPS / NCGR chain)</Label>
                <Select
                  value={form.releaseStatus || "none"}
                  onValueChange={(v) => setForm({ ...form, releaseStatus: v === "none" ? "" : v })}
                >
                  <SelectTrigger id="clone-lines-field-9" className="mt-1"><SelectValue /></SelectTrigger>
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

              {createError && <p role="alert" className="text-sm text-destructive">{createError}</p>}
              <Button onClick={handleCreate} className="w-full" disabled={creating || !form.name || !form.cultivarId}>
                {creating ? "Creating…" : "Create Clone Line"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Input aria-label="Search clone lines" placeholder="Search line, code or cultivar…" value={search} onChange={(event) => setSearch(event.target.value)} className="max-w-sm" />

      {/* Release-status filter */}
      {cloneLines.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <Label className="text-sm" htmlFor="clone-lines-field-10">Release status:</Label>
          <Select value={releaseFilter} onValueChange={setReleaseFilter}>
            <SelectTrigger id="clone-lines-field-10" className="w-full sm:w-[200px]" aria-label="Release status"><SelectValue /></SelectTrigger>
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
          {(releaseFilter !== "all" || search) && <Button variant="ghost" size="sm" onClick={() => { setReleaseFilter("all"); setSearch(""); }}>Reset filters</Button>}
        </div>
      )}

      {/* Clone lines list */}
      {loadError ? <PageError message={loadError} retry={loadLines} /> : loading ? (
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
                : "Try a different search or release-status filter."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 [&>*]:min-w-0 [&>*]:break-words">
          {filteredLines.map((cl) => (
            <Card key={cl.id}>
              <CardContent className="pt-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <GitBranch className="size-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold"><Link href={`/clone-lines/${cl.id}`} className="text-primary hover:underline underline-offset-4">{cl.name}</Link></h3>
                      <p className="text-sm text-muted-foreground">
                        <Link href={`/cultivars/${cl.cultivar.id}`} className="hover:underline">{cl.cultivar.name}</Link> {cl.code && `(${cl.code})`}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
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
