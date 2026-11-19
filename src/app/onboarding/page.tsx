"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DeviceSetup } from "@/components/device-setup";
import { WELCOME_KEY } from "@/components/welcome-modal";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { STAGES, STAGE_LABELS } from "@/lib/constants";
import { MAX_STARTER_VESSELS } from "@/lib/starter-barcodes";

const SUPPORT_EMAIL = "support@vitroslabs.com";
const IMPORT_HELP_HREF = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent("Please load my vessel list")}&body=${encodeURIComponent("Attach your spreadsheet in any format and we will load it into your lab.")}`;

interface Logged {
  cultivarName: string;
  barcodes: string[];
}

// Setup has one job: get the lab's first vessels on screen. Facility,
// locations, labels and team are all optional and come after.
export default function OnboardingPage() {
  const [cultivarName, setCultivarName] = useState("");
  const [count, setCount] = useState("10");
  const [stage, setStage] = useState<string>("multiplication");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [logged, setLogged] = useState<Logged | null>(null);
  // How many vessels this lab can add now: the plan's remaining room, capped
  // by the typo guard. Starts at the free plan's limit until the plan loads.
  const [maxCount, setMaxCount] = useState(50);

  // Setup is the welcome. Without this the feature-tour modal opens on top of
  // the vessel list or dashboard the moment the user leaves this page.
  useEffect(() => {
    try { localStorage.setItem(WELCOME_KEY, "1"); } catch { /* private browsing */ }
  }, []);

  useEffect(() => {
    fetch("/api/billing/status")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        const limits = data?.limits;
        if (!limits || typeof limits.maxVessels !== "number") return;
        const room = limits.maxVessels === -1 ? MAX_STARTER_VESSELS : limits.maxVessels - (limits.currentVessels ?? 0);
        setMaxCount(Math.max(0, Math.min(MAX_STARTER_VESSELS, room)));
      })
      .catch(() => { /* Keep the default; the server enforces the real limit. */ });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    const vesselCount = parseInt(count, 10);
    if (!cultivarName.trim()) { setError("Enter what you are growing, for example Monstera or Russet Burbank."); return; }
    if (maxCount === 0) { setError("Your plan's vessel limit is full. Contact support to increase it."); return; }
    if (!Number.isInteger(vesselCount) || vesselCount < 1 || vesselCount > maxCount) {
      setError(`Enter a number of vessels from 1 to ${maxCount}. You can add the rest after this step.`);
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/onboarding/first-vessels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cultivarName: cultivarName.trim(), count: vesselCount, stage }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Your vessels could not be saved. Try again."); return; }
      setLogged({ cultivarName: data.cultivar.name, barcodes: data.barcodes });
    } catch {
      setError("Could not confirm this save. Check your vessel list before trying again.");
    } finally {
      setSaving(false);
    }
  };

  if (logged) {
    const first = logged.barcodes[0];
    const last = logged.barcodes[logged.barcodes.length - 1];
    return (
      <div className="space-y-6">
        <PageHeader title="Your vessels are in" description="Your lab is live. Everything below is optional." />
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle className="text-2xl">{logged.barcodes.length} {logged.cultivarName} vessel{logged.barcodes.length === 1 ? "" : "s"} logged</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Numbered <span className="font-mono text-foreground">{first}</span>
              {logged.barcodes.length > 1 && <> to <span className="font-mono text-foreground">{last}</span></>}. You can print labels for them or keep working without labels.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button asChild className="flex-1"><Link href="/vessels">See my vessels</Link></Button>
              <Button asChild variant="outline" className="flex-1"><Link href="/labels">Print labels</Link></Button>
            </div>
          </CardContent>
        </Card>
        <Card className="max-w-2xl">
          <CardHeader><CardTitle className="text-base">Have more vessels in a spreadsheet?</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">Import the file yourself, or send it to us and we will load it for you at no charge.</p>
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="outline"><Link href="/import">Import a CSV</Link></Button>
              <Button asChild variant="outline"><a href={IMPORT_HELP_HREF}>Email it to us</a></Button>
            </div>
          </CardContent>
        </Card>
        <div className="flex flex-wrap gap-3">
          <Button asChild variant="ghost"><Link href="/locations">Add growth rooms and shelves</Link></Button>
          <Button asChild variant="ghost"><Link href="/admin">Invite your team</Link></Button>
        </div>
        <DeviceSetup />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Log your first vessels" description="One minute. No barcode labels or setup needed." />
      <form onSubmit={handleSubmit} aria-busy={saving} className="w-full max-w-2xl space-y-6">
        <Card>
          <CardHeader><CardTitle>What is on your shelves right now?</CardTitle></CardHeader>
          <CardContent className="space-y-5">
            <p className="text-sm text-muted-foreground">Pick one plant you have in culture today. We will number the vessels for you, and you can add everything else afterward.</p>
            {error && <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">{error}</p>}
            <div>
              <Label htmlFor="setup-cultivar">What are you growing?</Label>
              <Input id="setup-cultivar" disabled={saving} value={cultivarName} onChange={(e) => setCultivarName(e.target.value)} placeholder="e.g., Monstera Thai Constellation" className="mt-1" autoFocus maxLength={120} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="setup-count">How many vessels of it?</Label>
                <Input id="setup-count" type="number" inputMode="numeric" min={1} max={maxCount} disabled={saving} value={count} onChange={(e) => setCount(e.target.value)} className="mt-1" />
                <p className="mt-1 text-xs text-muted-foreground">Up to {maxCount} for now. A rough count is fine.</p>
              </div>
              <div>
                <Label htmlFor="setup-stage">What stage are they in?</Label>
                <Select disabled={saving} value={stage} onValueChange={setStage}>
                  <SelectTrigger id="setup-stage" className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>{STAGES.map((s) => <SelectItem key={s} value={s}>{STAGE_LABELS[s] || s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <Button type="submit" disabled={saving} className="w-full" size="lg">{saving ? "Logging your vessels…" : "Log my vessels"}</Button>
          </CardContent>
        </Card>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
          <Link href="/import" className="font-medium underline underline-offset-4">I have a spreadsheet to import</Link>
          <a href={IMPORT_HELP_HREF} className="font-medium underline underline-offset-4">Load my data for me</a>
          <Link href="/" className="text-muted-foreground underline underline-offset-4">Skip for now</Link>
        </div>
      </form>
    </div>
  );
}
