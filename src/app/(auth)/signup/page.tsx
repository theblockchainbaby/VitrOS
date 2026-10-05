"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { getSignupPlan } from "@/lib/signup-plan";
import { AuthShell } from "@/components/auth-shell";
import { PasswordInput } from "@/components/password-input";

export default function SignupPage() {
  return (
    <Suspense>
      <SignupForm />
    </Suspense>
  );
}

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const plan = getSignupPlan(searchParams.get("plan"), searchParams.get("interval"));
  const selectedPlan = plan?.key;
  const billingInterval = searchParams.get("interval") === "annual" ? "annual" : "monthly";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [labName, setLabName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [accountCreated, setAccountCreated] = useState(false);
  const [signedIn, setSignedIn] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          organizationName: labName,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed");
        setLoading(false);
        return;
      }

      setAccountCreated(true);

      // Auto sign-in after registration
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Account created but sign-in failed. Please go to login.");
        setLoading(false);
        return;
      }

      setSignedIn(true);

      // If a plan was selected from pricing, redirect to checkout
      if (selectedPlan) {
        try {
          const checkoutRes = await fetch("/api/billing/checkout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              plan: selectedPlan,
              interval: billingInterval,
            }),
          });
          const checkoutData = await checkoutRes.json();
          if (checkoutData.url) {
            window.location.assign(checkoutData.url);
            return;
          }
          setError("Your workspace is ready, but checkout could not be opened. Continue setup and choose your plan in Billing.");
        } catch {
          setError("Your workspace is ready, but checkout could not be reached. Continue setup and choose your plan in Billing.");
        }
        setLoading(false);
        return;
      }

      router.push("/onboarding");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Create your lab workspace" description="Start tracking your cultures with a 30-day free trial.">

        <div className="mb-6 rounded-lg border bg-muted/30 p-4 text-sm">
          {plan ? <><p className="font-medium">{plan.name} · {plan.interval === "annual" ? "Annual billing" : "Monthly billing"}</p><p className="mt-1 text-muted-foreground">${plan.price.toLocaleString()} per {plan.interval === "annual" ? "year" : "month"}. Review payment details and any trial eligibility in checkout before subscribing.</p><Link href="/pricing" className="mt-2 inline-block text-primary underline underline-offset-4">Compare plans</Link></> : <><p className="font-medium">Your 30-day trial</p><p className="mt-1 text-muted-foreground">No credit card needed to create your workspace. Choose a paid plan when you’re ready.</p></>}
        </div>
        {error && (
          <div role="alert" className="rounded-lg bg-destructive/10 text-destructive text-sm p-3 mb-4">
            {error}
          </div>
        )}

        {accountCreated && error ? <Button asChild className="w-full"><Link href={signedIn ? "/onboarding" : "/login"}>{signedIn ? "Continue setup" : "Go to sign in"}</Link></Button> : <form aria-busy={loading} onSubmit={handleSignup} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="labName">Lab / Organization Name</Label>
            <Input
              id="labName"
              type="text"
              value={labName}
              onChange={(e) => setLabName(e.target.value)}
              placeholder="e.g. Sunshine Tissue Culture"
              required
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Your Name</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              required
              autoComplete="name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@yourlab.com"
              required
              autoComplete="email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <PasswordInput
              id="password"

              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              required
              minLength={8}
              autoComplete="new-password"
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating your lab..." : "Create Account"}
          </Button>
        </form>}

        <p className="text-center text-sm text-muted-foreground mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:underline font-medium">
            Sign in
          </Link>
        </p>
    </AuthShell>
  );
}
