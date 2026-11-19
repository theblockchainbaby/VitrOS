"use client";

import { usePathname, useRouter } from "next/navigation";
import { useHardwareScanner } from "@/lib/use-hardware-scanner";

// A scan from a paired hardware scanner on any workspace page opens that
// vessel. The Scan page listens for itself so it can stay in place.
export function GlobalScanner() {
  const router = useRouter();
  const pathname = usePathname();
  // Pages with their own barcode workflow keep the scan for themselves.
  const ownsScans = ["/scan", "/labels", "/batch", "/multiply", "/integrations", "/onboarding", "/import"].some((root) => pathname === root || pathname.startsWith(`${root}/`));
  useHardwareScanner((code) => router.push(`/scan?code=${encodeURIComponent(code)}`), !ownsScans);
  return null;
}
