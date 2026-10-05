"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PageError } from "@/components/page-state";
import { PageHeader } from "@/components/page-header";
import { CultivarHealthBadge } from "@/components/status-badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CULTIVAR_TYPE_LABELS } from "@/lib/constants";
import type { Cultivar } from "@/lib/types";
import { toast } from "sonner";
import { Search } from "lucide-react";

interface CultivarWithHealth extends Cultivar {
  cultivarHealth: string;
}

export default function CultivarsPage() {
  const [cultivars, setCultivars] = useState<CultivarWithHealth[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [cultivarType, setCultivarType] = useState("in_house");
  const [species, setSpecies] = useState("");
  const [description, setDescription] = useState("");
  // Phase 1 multi-vertical fields
  const [parentCultivarId, setParentCultivarId] = useState<string>("");
  const [breederCredit, setBreederCredit] = useState("");
  const [trademarkRef, setTrademarkRef] = useState("");

  const fetchCultivars = useCallback(() => {
    fetch("/api/cultivars")
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then((data) => { setCultivars(data); setLoadError(null); })
      .catch(() => setLoadError("Cultivars could not be loaded. Retry to see the library."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchCultivars();
  }, [fetchCultivars]);

  const filtered = cultivars.filter((c) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.species.toLowerCase().includes(q) ||
      (c.code || "").toLowerCase().includes(q) ||
      (c.description || "").toLowerCase().includes(q)
    );
  });

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }
    const res = await fetch("/api/cultivars", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim(),
        code: code.trim() || null,
        cultivarType,
        species,
        description: description || null,
        parentCultivarId: parentCultivarId || null,
        breederCredit: breederCredit.trim() || null,
        trademarkRef: trademarkRef.trim() || null,
      }),
    });
    if (res.ok) {
      toast.success(`Cultivar "${name}" created`);
      setName("");
      setCode("");
      setCultivarType("in_house");
      setSpecies("");
      setDescription("");
      setParentCultivarId("");
      setBreederCredit("");
      setTrademarkRef("");
      setOpen(false);
      fetchCultivars();
    } else {
      toast.error("Failed to create cultivar");
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string, cultivarName: string) => {
    e.stopPropagation();
    if (!confirm(`Delete cultivar "${cultivarName}"? This cannot be undone.`)) return;
    const res = await fetch(`/api/cultivars/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success(`Deleted "${cultivarName}"`);
      fetchCultivars();
    } else {
      toast.error("Failed to delete. Make sure no vessels are using this cultivar.");
    }
  };

  return (
    <div className="min-w-0 space-y-6">
      <PageHeader
        title="Cultivars"
        description="Manage plant species and cultivar library"
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>Add Cultivar</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Cultivar</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 [&>*]:min-w-0 [&>*]:break-words">
                  <div className="space-y-2">
                    <Label htmlFor="cultivars-field-1">Name</Label>
                    <Input id="cultivars-field-1" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Runtz" autoFocus />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cultivars-field-2">Code</Label>
                    <Input id="cultivars-field-2" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="e.g., AA01" className="font-mono" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 [&>*]:min-w-0 [&>*]:break-words">
                  <div className="space-y-2">
                    <Label htmlFor="cultivars-field-3">Type</Label>
                    <Select value={cultivarType} onValueChange={setCultivarType}>
                      <SelectTrigger id="cultivars-field-3"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="in_house">In-House</SelectItem>
                        <SelectItem value="client">Client</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cultivars-field-4">Species</Label>
                    <Input id="cultivars-field-4" value={species} onChange={(e) => setSpecies(e.target.value)} placeholder="e.g., Spathiphyllum wallisii" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cultivars-field-5">Description (optional)</Label>
                  <Input id="cultivars-field-5" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Notes about this cultivar" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 [&>*]:min-w-0 [&>*]:break-words">
                  <div className="space-y-2">
                    <Label htmlFor="cultivars-field-6">Parent cultivar (optional)</Label>
                    <Select value={parentCultivarId || "none"} onValueChange={(v) => setParentCultivarId(v === "none" ? "" : v)}>
                      <SelectTrigger id="cultivars-field-6"><SelectValue placeholder="None" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {cultivars.map((c) => (
                          <SelectItem key={c.id} value={c.id}>{c.name}{c.code ? ` (${c.code})` : ""}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-[11px] text-muted-foreground">Use for species → variety → sport (e.g. Musa acuminata → Cavendish → Williams)</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cultivars-field-7">Breeder / source (optional)</Label>
                    <Input id="cultivars-field-7" value={breederCredit} onChange={(e) => setBreederCredit(e.target.value)} placeholder="e.g., DBG, Proven Winners" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cultivars-field-8">Trademark / registration ref (optional)</Label>
                  <Input id="cultivars-field-8" value={trademarkRef} onChange={(e) => setTrademarkRef(e.target.value)} placeholder="e.g., 'Whipper Snapper®', PVP 200300168" />
                </div>
                <Button onClick={handleCreate} className="w-full">Create Cultivar</Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          aria-label="Search cultivars"
          placeholder="Search cultivars..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {search && <Button variant="ghost" size="sm" onClick={() => setSearch("")}>Clear search · {filtered.length} matches</Button>}

      {loadError ? <PageError message={loadError} retry={() => { setLoading(true); setLoadError(null); fetchCultivars(); }} /> : loading ? (
        <p className="text-center text-muted-foreground py-8">Loading...</p>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center space-y-3">
            <p className="text-lg font-medium">{search ? "No cultivars match your search" : "No cultivars yet"}</p>
            {!search && (
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Cultivars define your plant varieties — each with its own stage pipeline, multiplication rates, and health tracking. Add your first cultivar to start building your library.
              </p>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Desktop */}
          <div className="hidden md:block rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Health</TableHead>
                  <TableHead className="text-right">Vessels</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((c) => (
                  <TableRow
                    key={c.id}
                  >
                    <TableCell className="font-mono text-muted-foreground">{c.code || "—"}</TableCell>
                    <TableCell className="font-medium"><Link href={`/cultivars/${c.id}`} className="text-primary hover:underline underline-offset-4">{c.name}</Link></TableCell>
                    <TableCell>
                      <span className={`text-xs px-2 py-0.5 rounded ${c.cultivarType === "client" ? "bg-muted text-foreground" : "bg-muted text-muted-foreground"}`}>
                        {CULTIVAR_TYPE_LABELS[c.cultivarType] || c.cultivarType}
                      </span>
                    </TableCell>
                    <TableCell>
                      <CultivarHealthBadge status={c.cultivarHealth} />
                    </TableCell>
                    <TableCell className="text-right font-mono">{c._count?.vessels ?? 0}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleDelete(e, c.id, c.name)}
                        className="text-destructive"
                        disabled={(c._count?.vessels ?? 0) > 0}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile */}
          <div className="md:hidden space-y-3">
            {filtered.map((c) => (
              <Card
                key={c.id}
              >
                <CardHeader className="pb-2">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      {c.code && <span className="font-mono text-xs text-muted-foreground">{c.code}</span>}
                      <CardTitle className="text-base"><Link href={`/cultivars/${c.id}`} className="text-primary hover:underline underline-offset-4">{c.name}</Link></CardTitle>
                    </div>
                    <CultivarHealthBadge status={c.cultivarHealth} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded ${c.cultivarType === "client" ? "bg-muted text-foreground" : "bg-muted text-muted-foreground"}`}>
                        {CULTIVAR_TYPE_LABELS[c.cultivarType] || c.cultivarType}
                      </span>
                    </div>
                    <span className="text-sm text-muted-foreground font-mono">{c._count?.vessels ?? 0} vessels</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
