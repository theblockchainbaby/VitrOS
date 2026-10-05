"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PageError } from "@/components/page-state";
import { PageHeader } from "@/components/page-header";
import { LOCATION_TYPES, LOCATION_TYPE_LABELS } from "@/lib/constants";
import type { Location } from "@/lib/types";
import { toast } from "sonner";

export default function LocationsPage() {
  const [locations, setLocations] = useState<(Location & { _count?: { vessels: number; children: number } })[]>([]);
  const [sites, setSites] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  // Form
  const [name, setName] = useState("");
  const [type, setType] = useState<string>("");
  const [siteId, setSiteId] = useState("");
  const [parentId, setParentId] = useState("");
  const [capacity, setCapacity] = useState("");
  const [temperature, setTemperature] = useState("");
  const [humidity, setHumidity] = useState("");
  const [lightHours, setLightHours] = useState("");

  const fetchLocations = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
    const res = await fetch("/api/locations");
    if (!res.ok) throw new Error();
    const data = await res.json();
    setLocations(data);

    // Extract unique sites from locations
    const siteMap = new Map<string, string>();
    data.forEach((loc: Location & { site?: { id: string; name: string } }) => {
      if (loc.site) siteMap.set(loc.site.id, loc.site.name);
    });
    setSites(Array.from(siteMap, ([id, name]) => ({ id, name })));


    } catch {
      setLoadError("Locations could not be loaded. Retry to see this view.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  const handleCreate = async () => {
    if (!name || !type || !siteId) {
      toast.error("Name, type, and site are required");
      return;
    }
    setCreating(true);
    try {
      const body: Record<string, unknown> = { name, type, siteId };
      if (parentId) body.parentId = parentId;
      if (capacity) body.capacity = parseInt(capacity);

      const conditions: Record<string, number> = {};
      if (temperature) conditions.temperature = parseFloat(temperature);
      if (humidity) conditions.humidity = parseFloat(humidity);
      if (lightHours) conditions.lightHours = parseFloat(lightHours);
      if (Object.keys(conditions).length > 0) body.conditions = conditions;

      const res = await fetch("/api/locations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        toast.success("Location created");
        setDialogOpen(false);
        setName("");
        setType("");
        setParentId("");
        setCapacity("");
        setTemperature("");
        setHumidity("");
        setLightHours("");
        fetchLocations();
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to create location");
      }
    } catch {
      toast.error("The save could not be confirmed. Your entries have been kept.");
    } finally {
      setCreating(false);
    }
  };

  // Build a capacity utilization percentage
  const getCapacityPct = (loc: Location & { _count?: { vessels: number } }) => {
    if (!loc.capacity) return null;
    return Math.round(((loc._count?.vessels ?? 0) / loc.capacity) * 100);
  };

  return (
    <div className="min-w-0 space-y-6">
      <PageHeader
        title="Locations"
        description="Manage growth chambers, benches, and shelves"
        actions={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>Add Location</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Location</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 [&>*]:min-w-0 [&>*]:break-words">
                  <div>
                    <Label htmlFor="locations-field-1">Name</Label>
                    <Input id="locations-field-1" value={name} onChange={(e) => setName(e.target.value)} placeholder="Chamber A" className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="locations-field-2">Type</Label>
                    <Select value={type} onValueChange={setType}>
                      <SelectTrigger id="locations-field-2" className="mt-1"><SelectValue placeholder="Select type" /></SelectTrigger>
                      <SelectContent>
                        {LOCATION_TYPES.map((t) => (
                          <SelectItem key={t} value={t}>{LOCATION_TYPE_LABELS[t]}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 [&>*]:min-w-0 [&>*]:break-words">
                  <div>
                    <Label htmlFor="locations-field-3">Site</Label>
                    <Select value={siteId} onValueChange={setSiteId}>
                      <SelectTrigger id="locations-field-3" className="mt-1"><SelectValue placeholder="Select site" /></SelectTrigger>
                      <SelectContent>
                        {sites.map((s) => (
                          <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="locations-field-4">Parent Location</Label>
                    <Select value={parentId} onValueChange={setParentId}>
                      <SelectTrigger id="locations-field-4" className="mt-1"><SelectValue placeholder="None (top level)" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {locations.map((l) => (
                          <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="locations-field-5">Capacity (vessels)</Label>
                  <Input id="locations-field-5" type="number" value={capacity} onChange={(e) => setCapacity(e.target.value)} placeholder="Optional" className="mt-1" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 [&>*]:min-w-0 [&>*]:break-words">
                  <div>
                    <Label htmlFor="locations-field-6">Temp (C)</Label>
                    <Input id="locations-field-6" type="number" step="0.1" value={temperature} onChange={(e) => setTemperature(e.target.value)} className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="locations-field-7">Humidity (%)</Label>
                    <Input id="locations-field-7" type="number" value={humidity} onChange={(e) => setHumidity(e.target.value)} className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="locations-field-8">Light (hrs)</Label>
                    <Input id="locations-field-8" type="number" value={lightHours} onChange={(e) => setLightHours(e.target.value)} className="mt-1" />
                  </div>
                </div>
                <Button onClick={handleCreate} disabled={creating} className="w-full">
                  {creating ? "Creating..." : "Create Location"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      {loadError ? <PageError message={loadError} retry={fetchLocations} /> : loading ? (
        <p className="text-center text-muted-foreground py-8">Loading...</p>
      ) : locations.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">No locations configured. Add one to get started.</p>
      ) : (
        <>
          <div className="hidden md:block rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Site</TableHead>
                  <TableHead>Parent</TableHead>
                  <TableHead className="text-right">Vessels</TableHead>
                  <TableHead className="text-right">Capacity used</TableHead>
                  <TableHead>Conditions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {locations.map((loc) => {
                  const pct = getCapacityPct(loc);
                  return (
                    <TableRow key={loc.id}>
                      <TableCell className="font-medium"><Link href={`/locations/${loc.id}`} className="text-primary hover:underline underline-offset-4">{loc.name}</Link></TableCell>
                      <TableCell><Badge variant="outline">{LOCATION_TYPE_LABELS[loc.type] || loc.type}</Badge></TableCell>
                      <TableCell>{loc.site?.name ?? "—"}</TableCell>
                      <TableCell>{loc.parent?.name ?? "—"}</TableCell>
                      <TableCell className="text-right font-mono">{loc._count?.vessels ?? 0}</TableCell>
                      <TableCell className="text-right">
                        {loc.capacity ? (
                          <span className={pct && pct > 90 ? "text-red-500 font-medium" : ""}>
                            {loc._count?.vessels ?? 0} / {loc.capacity} ({pct}%)
                          </span>
                        ) : "—"}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {loc.conditions
                          ? Object.entries(loc.conditions).map(([k, v]) => `${k === "temperature" ? "Temperature" : k === "humidity" ? "Humidity" : k === "lightHours" ? "Light" : k}: ${v}${k === "temperature" ? "°C" : k === "humidity" ? "%" : k === "lightHours" ? " h/day" : ""}`).join(", ")
                          : "—"}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {locations.map((loc) => {
              const pct = getCapacityPct(loc);
              return (
                <Link key={loc.id} href={`/locations/${loc.id}`} className="block">
                  <Card className="hover:bg-accent/50 transition-colors">
                    <CardContent className="pt-4 pb-3">
                      <div className="flex flex-wrap justify-between items-start gap-3">
                        <div>
                          <p className="font-medium">{loc.name}</p>
                          <p className="text-sm text-muted-foreground">{LOCATION_TYPE_LABELS[loc.type] || loc.type}</p>
                        </div>
                        <Badge variant="outline">{loc._count?.vessels ?? 0} vessels</Badge>
                      </div>
                      {loc.capacity && (
                        <div className="mt-2">
                          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${pct && pct > 90 ? "bg-red-500" : pct && pct > 70 ? "bg-amber-500" : "bg-primary"}`}
                              style={{ width: `${Math.min(pct || 0, 100)}%` }}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{pct}% capacity ({loc._count?.vessels ?? 0}/{loc.capacity})</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
