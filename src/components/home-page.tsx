"use client";

import { useSession } from "next-auth/react";
import Dashboard from "@/components/dashboard";
import { LandingPage } from "@/components/landing-page";

export function HomePage() {
  const { status } = useSession();

  if (status === "authenticated") return <Dashboard />;

  // Keep the existing landing page during loading and unauthenticated sessions.
  return <LandingPage />;
}
