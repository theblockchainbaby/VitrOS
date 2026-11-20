"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AlertTriangle, Zap, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

export type BannerType = "past_due" | "trial_expired" | "canceled" | "trial_ending" | "vessel_limit";

export interface BannerData {
  type: BannerType;
  message: string;
  action: string;
}

interface BillingStatus {
  planStatus?: string;
  trialEndsAt?: string | null;
  hasSubscription?: boolean;
  limits?: { maxVessels: number; currentVessels: number };
}

const TRIAL_WARNING_DAYS = 7;

// The one thing a lab most needs to know about its plan right now, or null.
// Ordered by urgency: a failed payment and an ended trial stop work today.
export function bannerFor(status: BillingStatus, now: number = Date.now()): BannerData | null {
  if (status.planStatus === "past_due") {
    return { type: "past_due", message: "Your payment failed. Update your payment method to avoid service interruption.", action: "Fix payment" };
  }
  if (status.planStatus === "trial_expired") {
    return { type: "trial_expired", message: "Your free trial has ended. Your records are safe, but you cannot add vessels or teammates until you choose a plan.", action: "Choose a plan" };
  }
  if (status.planStatus === "canceled") {
    return { type: "canceled", message: "Your subscription was canceled. Resubscribe to add vessels and teammates again.", action: "Resubscribe" };
  }
  if (status.planStatus === "trialing" && !status.hasSubscription && status.trialEndsAt) {
    const daysLeft = Math.ceil((new Date(status.trialEndsAt).getTime() - now) / 86_400_000);
    if (daysLeft > 0 && daysLeft <= TRIAL_WARNING_DAYS) {
      return { type: "trial_ending", message: `Your free trial ends in ${daysLeft} day${daysLeft === 1 ? "" : "s"}. Choose a plan to keep adding vessels.`, action: "Choose a plan" };
    }
  }
  if (status.limits && status.limits.maxVessels > 0) {
    const pct = (status.limits.currentVessels / status.limits.maxVessels) * 100;
    if (pct >= 80) {
      return { type: "vessel_limit", message: `You are using ${Math.round(pct)}% of your plan's ${status.limits.maxVessels.toLocaleString()} vessels.`, action: "Upgrade" };
    }
  }
  return null;
}

const ICONS = { past_due: AlertTriangle, trial_expired: AlertTriangle, canceled: AlertTriangle, trial_ending: Clock, vessel_limit: Zap };
const URGENT = "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400";
const WARNING = "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400";
const COLORS: Record<BannerType, string> = { past_due: URGENT, trial_expired: URGENT, canceled: URGENT, trial_ending: WARNING, vessel_limit: WARNING };

export function UpgradeBanner() {
  const pathname = usePathname();
  const [banner, setBanner] = useState<BannerData | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/billing/status")
      .then((r) => (r.ok ? r.json() : null))
      .then((status) => { if (!cancelled && status) setBanner(bannerFor(status)); })
      .catch(() => { /* The banner is advisory; the server still enforces limits. */ });
    return () => { cancelled = true; };
  }, [pathname]);

  // Billing already shows this, and setup should not open with a sales message.
  if (!banner || pathname.startsWith("/admin/billing") || pathname === "/onboarding") return null;

  const Icon = ICONS[banner.type];
  const urgent = COLORS[banner.type] === URGENT;

  return (
    <div role={urgent ? "alert" : "status"} className={`mb-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3 ${COLORS[banner.type]}`}>
      <div className="flex min-w-0 items-center gap-2 text-sm">
        <Icon className="h-4 w-4 shrink-0" />
        <span>{banner.message}</span>
      </div>
      <Button asChild size="sm" variant={urgent ? "destructive" : "default"}>
        <Link href="/admin/billing">{banner.action}</Link>
      </Button>
    </div>
  );
}
