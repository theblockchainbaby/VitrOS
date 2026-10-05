"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { AuthShell } from "@/components/auth-shell";
import { PasswordInput } from "@/components/password-input";

type Tab = "email" | "pin";

export default function LoginPage() {
  return <Suspense fallback={<AuthShell title="Sign in to your lab" description="Loading sign-in…"><p role="status">Loading…</p></AuthShell>}><LoginForm /></Suspense>;
}

function LoginForm() {
  const searchParams = useSearchParams();
  const demo = searchParams.get("demo") === "true";
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("email");
  const [email, setEmail] = useState(demo ? "demo@vitros.app" : "");
  const [password, setPassword] = useState(demo ? "demo1234" : "");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (result?.error) {
        setError("Invalid email or password");
      } else {
        router.push("/");
        router.refresh();
      }
    } catch {
      setError("We couldn’t reach the sign-in service. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePinLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("pin", {
        pin,
        organizationId: "default",
        redirect: false,
      });
      if (result?.error) {
        setError("Invalid PIN");
      } else {
        router.push("/");
        router.refresh();
      }
    } catch {
      setError("We couldn’t reach the sign-in service. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Sign in to your lab" description={demo ? "Demo credentials are filled in. Sign in to explore the shared demonstration workspace." : "Pick up where your team left off."}>

        {/* Tabs */}
        <div className="flex rounded-lg bg-muted p-1 mb-6">
          <button
            disabled={loading}
            aria-pressed={tab === "email"}
            onClick={() => { setTab("email"); setError(""); }}
            className={`flex-1 text-sm font-medium py-2 rounded-md transition-colors ${
              tab === "email"
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Email & Password
          </button>
          <button
            disabled={loading}
            aria-pressed={tab === "pin"}
            onClick={() => { setTab("pin"); setError(""); }}
            className={`flex-1 text-sm font-medium py-2 rounded-md transition-colors ${
              tab === "pin"
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Quick PIN
          </button>
        </div>

        {error && (
          <div role="alert" className="rounded-lg bg-destructive/10 text-destructive text-sm p-3 mb-4">
            {error}
          </div>
        )}

        {tab === "email" ? (
          <form aria-busy={loading} onSubmit={handleEmailLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoFocus
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-primary hover:underline font-medium"
                >
                  Forgot password?
                </Link>
              </div>
              <PasswordInput
                id="password"

                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
                autoComplete="current-password"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        ) : (
          <form aria-busy={loading} onSubmit={handlePinLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pin">PIN</Label>
              <Input
                id="pin"
                type="password"
                inputMode="numeric"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Enter your PIN"
                required
                autoFocus
                className="text-center text-2xl tracking-[0.5em] font-mono"
                maxLength={6}
              />
              <p className="text-xs text-muted-foreground text-center">
                Use your assigned PIN for quick access on shared devices
              </p>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign In with PIN"}
            </Button>
          </form>
        )}

        <p className="text-center text-sm text-muted-foreground mt-6">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-primary hover:underline font-medium">
            Create one free
          </Link>
        </p>
    </AuthShell>
  );
}
