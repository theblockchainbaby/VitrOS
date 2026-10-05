"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/page-header";
import { LocationPicker } from "@/components/location-picker";
import type { EnvironmentReading } from "@/lib/types";
import { PageError, PageLoading, PageEmpty } from "@/components/page-state";
import { format, formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

export default function EnvironmentPage() {
  const [readings, setReadings] = useState<EnvironmentReading[]>([]);
  const [loading, setLoading] = useState(true);
  const [locationFilter, setLocationFilter] = useState("");
  const [hoursFilter, setHoursFilter] = useState("168");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [recording, setRecording] = useState(false);
  const [error, setError] = useState("");

  // Form state
  const [formLocationId, setFormLocationId] = useState("");
  const [temperature, setTemperature] = useState("");
  const [humidity, setHumidity] = useState("");
  const [co2Level, setCo2Level] = useState("");
  const [lightLevel, setLightLevel] = useState("");

  const fetchReadings = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
    const params = new URLSearchParams({ hours: hoursFilter });
    if (locationFilter) params.set("locationId", locationFilter);
    const res = await fetch(`/api/environment?${params}`);
    if (!res.ok) throw new Error("Could not load environmental readings.");
    const data = await res.json();
    setReadings(data);
    } catch (err) { setError(err instanceof Error ? err.message : "Could not load environmental readings."); }
    finally { setLoading(false); }
  }, [locationFilter, hoursFilter]);

  useEffect(() => {
    fetchReadings();
  }, [fetchReadings]);

  const handleRecord = async () => {
    if (!formLocationId) {
      toast.error("Select a location");
      return;
    }
    setRecording(true);
    try {
      const body: Record<string, unknown> = { locationId: formLocationId };
      if (temperature) body.temperature = parseFloat(temperature);
      if (humidity) body.humidity = parseFloat(humidity);
      if (co2Level) body.co2Level = parseFloat(co2Level);
      if (lightLevel) body.lightLevel = parseFloat(lightLevel);

      const res = await fetch("/api/environment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        toast.success("Reading recorded");
        setDialogOpen(false);
        setTemperature("");
        setHumidity("");
        setCo2Level("");
        setLightLevel("");
        fetchReadings();
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed");
      }
    } catch {
      toast.error("Reading was not saved. Your values are still here; try again.");
    } finally {
      setRecording(false);
    }
  };

  const locationSeries = Object.values(readings.reduce<Record<string, { id: string; name: string; latest: string; points: { time: number; temp: number | null; humidity: number | null }[] }>>((groups, reading) => {
    const group = groups[reading.locationId] ??= { id: reading.locationId, name: reading.location?.name || "Unnamed location", latest: reading.recordedAt, points: [] };
    if (new Date(reading.recordedAt) > new Date(group.latest)) group.latest = reading.recordedAt;
    group.points.push({ time: new Date(reading.recordedAt).getTime(), temp: reading.temperature, humidity: reading.humidity });
    return groups;
  }, {})).map((group) => ({ ...group, points: group.points.sort((a, b) => a.time - b.time) }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Environment"
        description="Track growth chamber conditions"
        actions={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>Record Reading</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Record Environment Reading</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Location</Label>
                  <div className="mt-1">
                    <LocationPicker value={formLocationId} onChange={setFormLocationId} />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="env-temperature">Temperature (°C)</Label>
                    <Input type="number" step="0.1" id="env-temperature" value={temperature} onChange={(e) => setTemperature(e.target.value)} className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="env-humidity">Humidity (%)</Label>
                    <Input type="number" step="1" id="env-humidity" value={humidity} onChange={(e) => setHumidity(e.target.value)} className="mt-1" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="env-co2Level">CO2 (ppm)</Label>
                    <Input type="number" id="env-co2Level" value={co2Level} onChange={(e) => setCo2Level(e.target.value)} className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="env-lightLevel">Light (µmol/m²/s)</Label>
                    <Input type="number" id="env-lightLevel" value={lightLevel} onChange={(e) => setLightLevel(e.target.value)} className="mt-1" />
                  </div>
                </div>
                <Button onClick={handleRecord} disabled={recording} className="w-full">
                  {recording ? "Saving..." : "Record Reading"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex min-w-0 items-center gap-2">
              <div className="min-w-0 flex-1"><LocationPicker value={locationFilter} onChange={setLocationFilter} placeholder="All locations" /></div>
              {locationFilter && <Button variant="ghost" size="sm" onClick={() => setLocationFilter("")}>All locations</Button>}
            </div>
            <Select value={hoursFilter} onValueChange={setHoursFilter}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="24">Last 24 hours</SelectItem>
                <SelectItem value="72">Last 3 days</SelectItem>
                <SelectItem value="168">Last 7 days</SelectItem>
                <SelectItem value="720">Last 30 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {!loading && !error && locationSeries.length > 0 && <p className="text-sm text-muted-foreground">{readings.length} readings in this period (latest 500 maximum). Each location has its own series; missing values stay empty.</p>}
      {!loading && !error && locationSeries.map((series) => (
        <Card key={series.id} className="min-w-0">
          <CardHeader>
            <CardTitle className="text-base">{series.name}</CardTitle>
            <p className="text-sm text-muted-foreground">Latest reading {formatDistanceToNow(new Date(series.latest), { addSuffix: true })} · {format(new Date(series.latest), "MMM d, yyyy HH:mm")}</p>
          </CardHeader>
          <CardContent className="min-w-0">
            {series.points.length < 2 ? <p className="text-sm text-muted-foreground">One reading recorded. Add another to see a trend.</p> : <ResponsiveContainer minWidth={0} width="100%" height={260}>
              <LineChart data={series.points} margin={{ left: -20, right: -20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" type="number" domain={["dataMin", "dataMax"]} tick={{ fontSize: 11 }} tickFormatter={(time) => format(new Date(time), "MMM d HH:mm")} minTickGap={48} />
                <YAxis yAxisId="temp" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="hum" orientation="right" tick={{ fontSize: 11 }} />
                <Tooltip labelFormatter={(time) => format(new Date(Number(time)), "MMM d, HH:mm")} />
                <Legend />
                <Line yAxisId="temp" dataKey="temp" stroke="var(--chart-1)" strokeWidth={2} name="Temperature (°C)" dot={false} />
                <Line yAxisId="hum" dataKey="humidity" stroke="var(--chart-2)" strokeWidth={2} name="Humidity (%)" dot={false} />
              </LineChart>
            </ResponsiveContainer>}
          </CardContent>
        </Card>
      ))}

      {/* Readings table */}
      {loading ? (
        <PageLoading label="Loading environmental readings…" />
      ) : error ? (<PageError message={error} retry={fetchReadings} />) : readings.length === 0 ? (
        <PageEmpty title="No readings in this period" description="Try a different location or date range, or record a reading." />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Readings ({Math.min(readings.length, 50)} of {readings.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Location</TableHead>
                  <TableHead>Temp (°C)</TableHead>
                  <TableHead>Humidity (%)</TableHead>
                  <TableHead>CO2 (ppm)</TableHead>
                  <TableHead>Light (µmol/m²/s)</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Recorded By</TableHead>
                  <TableHead>Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {readings.slice(0, 50).map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.location?.name ?? "—"}</TableCell>
                    <TableCell className="font-mono">{r.temperature ?? "—"}</TableCell>
                    <TableCell className="font-mono">{r.humidity ?? "—"}</TableCell>
                    <TableCell className="font-mono">{r.co2Level ?? "—"}</TableCell>
                    <TableCell className="font-mono">{r.lightLevel ?? "—"}</TableCell>
                    <TableCell className="text-sm">{r.source || "Unspecified"}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{r.recordedBy?.name ?? "—"}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{format(new Date(r.recordedAt), "MMM d, HH:mm")}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
