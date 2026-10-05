"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { DeviceSetup } from "@/components/device-setup";
import { PageHeader } from "@/components/page-header";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LOCATION_TYPES, LOCATION_TYPE_LABELS } from "@/lib/constants";
import { toast } from "sonner";

type Step = "welcome" | "site" | "locations" | "cultivar" | "done";

interface SiteData {
  name: string;
  address: string;
}

interface LocationData {
  name: string;
  type: string;
  capacity: string;
}

interface CultivarData {
  name: string;
  species: string;
  strain: string;
}

export default function OnboardingPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const draftKey = session?.user?.id ? `vitros-setup-${session.user.organizationId}-${session.user.id}` : null;
  const [restoredKey, setRestoredKey] = useState<string | null>(null);
  const [draftAvailable, setDraftAvailable] = useState(true);
  const [error, setError] = useState("");
  const [step, setStep] = useState<Step>("welcome");
  const [saving, setSaving] = useState(false);

  // Site
  const [site, setSite] = useState<SiteData>({ name: "", address: "" });
  const [siteId, setSiteId] = useState<string | null>(null);

  // Locations
  const [locations, setLocations] = useState<LocationData[]>([
    { name: "", type: "growth_chamber", capacity: "" },
  ]);

  // Cultivar
  const [cultivar, setCultivar] = useState<CultivarData>({ name: "", species: "", strain: "" });

  useEffect(() => {
    if (!draftKey) return;
    setStep("welcome"); setSite({ name: "", address: "" }); setSiteId(null);
    setLocations([{ name: "", type: "growth_chamber", capacity: "" }]);
    setCultivar({ name: "", species: "", strain: "" }); setError(""); setDraftAvailable(true);
    try {
      const saved = localStorage.getItem(draftKey);
      if (saved) {
        const draft = JSON.parse(saved);
        if (["welcome", "site", "locations", "cultivar", "done"].includes(draft.step)) setStep(draft.step);
        if (draft.site) setSite(draft.site);
        if (draft.siteId) setSiteId(draft.siteId);
        if (Array.isArray(draft.locations)) setLocations(draft.locations);
        if (draft.cultivar) setCultivar(draft.cultivar);
      }
    } catch { setDraftAvailable(false); }
    setRestoredKey(draftKey);
  }, [draftKey]);

  useEffect(() => {
    if (!draftKey || restoredKey !== draftKey) return;
    try { localStorage.setItem(draftKey, JSON.stringify({ step, site, siteId, locations, cultivar })); } catch { setDraftAvailable(false); }
  }, [draftKey, restoredKey, step, site, siteId, locations, cultivar]);

  const handleCreateSite = async () => {
    if (saving) return;
    if (siteId) { setStep("locations"); return; }
    if (!site.name) {
      toast.error("Site name is required");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/sites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(site),
      });
      if (res.ok) {
        const data = await res.json();
        setSiteId(data.id);
        toast.success("Site created");
        setStep("locations");
      } else {
        const err = await res.json();
        setError(err.error || "Failed to create site");
      }
    } catch {
      setError("Could not confirm this save. Your setup details are preserved. Check existing records before retrying.");
    } finally {
      setSaving(false);
    }
  };

  const addLocation = () => {
    if (saving) return;
    setLocations([...locations, { name: "", type: "bench", capacity: "" }]);
  };

  const updateLocation = (index: number, field: keyof LocationData, value: string) => {
    if (saving) return;
    const updated = [...locations];
    updated[index] = { ...updated[index], [field]: value };
    setLocations(updated);
  };

  const removeLocation = (index: number) => {
    if (saving) return;
    setLocations(locations.filter((_, i) => i !== index));
  };

  const handleCreateLocations = async () => {
    if (saving) return;
    const valid = locations.filter((l) => l.name.trim());
    if (locations.length === 0 && siteId) { setStep("cultivar"); return; }
    if (valid.length === 0) {
      toast.error("Add at least one location");
      return;
    }
    if (!siteId) {
      toast.error("Create a site first");
      return;
    }
    setSaving(true);
    setError("");
    try {
      let created = 0;
      const remaining = [...valid];
      for (const loc of valid) {
        try {
          const res = await fetch("/api/locations", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: loc.name, type: loc.type, siteId, capacity: loc.capacity ? parseInt(loc.capacity) : null }),
          });
          if (res.ok) {
            created++;
            remaining.splice(remaining.indexOf(loc), 1);
            setLocations([...remaining]);
          }
        } catch { /* Keep this location in the editable retry list. */ }
      }
      if (remaining.length) {
        setError(`${created} locations saved; ${remaining.length} could not be confirmed. Review the remaining locations and retry. Check existing locations if the connection was interrupted.`);
      } else {
        toast.success(`Created ${created} location${created === 1 ? "" : "s"}`);
        setStep("cultivar");
      }
    } catch {
      setError("Could not confirm this save. Your setup details are preserved. Check existing records before retrying.");
    } finally {
      setSaving(false);
    }
  };

  const handleCreateCultivar = async () => {
    if (saving) return;
    if (!cultivar.name) {
      toast.error("Cultivar name is required");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/cultivars", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: cultivar.name,
          species: cultivar.species,
          strain: cultivar.strain || null,
        }),
      });
      if (res.ok) {
        toast.success("Cultivar created");
        setStep("done");
      } else {
        const err = await res.json();
        setError(err.error || "Failed to create cultivar");
      }
    } catch {
      setError("Could not confirm this save. Your setup details are preserved. Check existing records before retrying.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Set up your lab" description="Build the foundation, then check your bench devices" />
      <div className={`w-full space-y-6 ${step === "done" ? "" : "max-w-2xl"}`}>
        <ol className="grid grid-cols-5 gap-2" aria-label="Setup progress">
          {([['welcome', 'Start'], ['site', 'Facility'], ['locations', 'Locations'], ['cultivar', 'Cultivar'], ['done', 'Bench setup']] as const).map(([value, label], index) => <li key={value} aria-current={step === value ? "step" : undefined} className="min-w-0 space-y-2"><div className={`h-1 rounded-full ${["welcome", "site", "locations", "cultivar", "done"].indexOf(step) >= index ? "bg-primary" : "bg-muted"}`} /><span className={`text-xs ${step === value ? "font-semibold text-foreground" : "text-muted-foreground"}`}>{index + 1}. {label}</span></li>)}
        </ol>
        <p className="text-xs text-muted-foreground">{draftAvailable ? "Your progress is saved in this browser for your account. You can leave and resume later." : "This browser could not save a local draft. Keep this page open to finish setup; successfully created records are saved to your lab."}</p>
        {error && <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">{error}</p>}
        {step !== "welcome" && step !== "done" && <Button variant="ghost" disabled={saving} onClick={() => { setError(""); setStep(step === "site" ? "welcome" : step === "locations" ? "site" : "locations"); }}>Back</Button>}

        {/* Step: Welcome */}
        {step === "welcome" && (
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-primary">
                  <path d="M7 20h10" />
                  <path d="M10 20c5.5-2.5.8-6.4 3-10" />
                  <path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z" />
                  <path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z" />
                </svg>
              </div>
              <CardTitle className="text-2xl">Welcome to VitrOS</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">
                Let&apos;s set up your lab in a few quick steps. You&apos;ll create your first site, add growth locations, and register your first cultivar.
              </p>
              <Button onClick={() => setStep("site")} className="w-full" size="lg">
                Get Started
              </Button>
              <Button variant="ghost" onClick={() => router.push("/")} className="w-full">
                Skip — I&apos;ll set up later
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step: Site */}
        {step === "site" && (
          <Card>
            <CardHeader>
              <CardTitle>Step 1: Your Facility</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">Name your primary lab site. You can add more sites later.</p>
              <div>
                <Label htmlFor="setup-facility">Facility Name</Label>
                <Input
                  disabled={saving || !!siteId} aria-label="Facility name" value={site.name}
                  onChange={(e) => setSite({ ...site, name: e.target.value })}
                  id="setup-facility" placeholder="e.g., Main Lab, Building A"
                  className="mt-1"
                  autoFocus
                />
              </div>
              <div>
                <Label htmlFor="setup-address">Address (optional)</Label>
                <Input
                  disabled={saving || !!siteId} aria-label="Facility address" value={site.address}
                  onChange={(e) => setSite({ ...site, address: e.target.value })}
                  id="setup-address" placeholder="123 Lab Street"
                  className="mt-1"
                />
              </div>
              <Button onClick={handleCreateSite} disabled={saving} className="w-full">
                {saving ? "Creating..." : siteId ? "Continue to locations" : "Create Site & Continue"}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step: Locations */}
        {step === "locations" && (
          <fieldset disabled={saving} aria-busy={saving} className="min-w-0"><legend className="sr-only">Growth locations</legend><Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Step 2: Growth Locations</CardTitle>
                <Button variant="outline" size="sm" disabled={saving} onClick={addLocation}>+ Add</Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">Add your growth chambers, benches, and shelves. These are where vessels will be stored.</p>
              {locations.map((loc, i) => (
                <div key={i} className="grid grid-cols-1 gap-3 rounded-lg border p-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_80px_auto] sm:items-end">
                  <div className="flex-1">
                    {i === 0 && <Label className="text-xs">Name</Label>}
                    <Input
                      disabled={saving} aria-label={`Location ${i + 1} name`} value={loc.name}
                      onChange={(e) => updateLocation(i, "name", e.target.value)}
                      placeholder="e.g., Chamber 1"
                    />
                  </div>
                  <div className="min-w-0">
                    {i === 0 && <Label className="text-xs">Type</Label>}
                    <Select disabled={saving} value={loc.type} onValueChange={(v) => updateLocation(i, "type", v)}>
                      <SelectTrigger aria-label={`Location ${i + 1} type`}><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {LOCATION_TYPES.map((t) => (
                          <SelectItem key={t} value={t}>{LOCATION_TYPE_LABELS[t]}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="min-w-0">
                    {i === 0 && <Label className="text-xs">Capacity</Label>}
                    <Input
                      type="number"
                      disabled={saving} min="1" aria-label={`Location ${i + 1} capacity`} value={loc.capacity}
                      onChange={(e) => updateLocation(i, "capacity", e.target.value)}
                      placeholder="—"
                    />
                  </div>
                  {locations.length > 1 && (
                    <Button variant="ghost" size="sm" disabled={saving} aria-label={`Remove location ${i + 1}`} onClick={() => removeLocation(i)} className="text-destructive shrink-0">
                      X
                    </Button>
                  )}
                </div>
              ))}
              <Button onClick={handleCreateLocations} disabled={saving} className="w-full">
                {saving ? "Saving..." : locations.length ? "Save Locations & Continue" : "Continue to cultivar"}
              </Button>
            </CardContent>
          </Card></fieldset>
        )}

        {/* Step: Cultivar */}
        {step === "cultivar" && (
          <Card>
            <CardHeader>
              <CardTitle>Step 3: First Cultivar</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">Register your first cultivar. You can add more from the Cultivars page anytime.</p>
              <div>
                <Label htmlFor="setup-cultivar">Cultivar Name</Label>
                <Input
                  disabled={saving} value={cultivar.name}
                  onChange={(e) => setCultivar({ ...cultivar, name: e.target.value })}
                  id="setup-cultivar" placeholder="e.g., Spathiphyllum, Monstera"
                  className="mt-1"
                  autoFocus
                />
              </div>
              <div>
                <Label htmlFor="setup-species">Species</Label>
                <Input
                  disabled={saving} value={cultivar.species}
                  onChange={(e) => setCultivar({ ...cultivar, species: e.target.value })}
                  id="setup-species" placeholder="e.g., Spathiphyllum wallisii"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="setup-variety">Variety / Cultivar (optional)</Label>
                <Input
                  disabled={saving} value={cultivar.strain}
                  onChange={(e) => setCultivar({ ...cultivar, strain: e.target.value })}
                  id="setup-variety" placeholder="e.g., Domino, Thai Constellation"
                  className="mt-1"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button onClick={handleCreateCultivar} disabled={saving} className="flex-1">
                  {saving ? "Creating..." : "Create Cultivar"}
                </Button>
                <Button variant="outline" disabled={saving} onClick={() => setStep("done")}>
                  Skip
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step: Done */}
        {step === "done" && (
          <div className="space-y-6"><Card>
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-green-600 dark:text-green-400">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </div>
              <CardTitle className="text-2xl">Your lab foundation is ready</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">
                Your saved facility and locations are available. Check scanner and printer readiness below, then scan your first vessel or import inventory. You can manage team access in Settings.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => router.push("/scan")} className="flex-1">
                  Scan First Vessel
                </Button>
                <Button variant="outline" onClick={() => router.push("/import")} className="flex-1">
                  CSV Import
                </Button>
              </div>
              <Button variant="ghost" onClick={() => router.push("/")} className="w-full">
                Go to Dashboard
              </Button>
            </CardContent>
          </Card>
          <DeviceSetup />
          <div className="flex flex-wrap gap-3"><Button asChild variant="outline"><Link href="/admin">Set up team access</Link></Button><Button asChild variant="outline"><Link href="/locations">Review locations</Link></Button></div></div>
        )}
      </div>
    </div>
  );
}
