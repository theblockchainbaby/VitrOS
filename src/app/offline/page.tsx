"use client";
import { WifiOff } from "lucide-react";
import { AuthShell } from "@/components/auth-shell";
import { Button } from "@/components/ui/button";

export default function OfflinePage() {
  return <AuthShell title="You’re offline" description="Reconnect to continue working with your lab data.">
    <WifiOff aria-hidden="true" className="mb-4 size-8 text-muted-foreground" />
    <p className="mb-6 text-sm leading-relaxed text-muted-foreground">VitrOS needs an internet connection to load and save records. Previously viewed pages may still be available; a cached page does not confirm that a change was saved.</p>
    <Button className="w-full" onClick={() => { window.location.href = "/"; }}>Try connecting again</Button>
  </AuthShell>;
}
