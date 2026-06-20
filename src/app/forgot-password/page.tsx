"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import Image from "next/image";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        setError("Something went wrong. Please try again.");
        setLoading(false);
        return;
      }

      // Always show the same confirmation regardless of whether the
      // email exists — the API never reveals account existence.
      setSubmitted(true);
      setLoading(false);
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30">
      <div className="w-full max-w-md mx-4">
        <div className="rounded-xl border bg-card p-8 shadow-sm">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Image src="/logo.png" alt="VitrOS" width={500} height={488} className="h-14 w-auto" />
          </div>
          <p className="text-center text-muted-foreground mb-6">
            Reset your password
          </p>

          {submitted ? (
            <div className="space-y-4">
              <div className="rounded-lg bg-primary/10 text-foreground text-sm p-4">
                If an account exists for <strong>{email}</strong>, we&apos;ve sent a
                password reset link. Check your inbox and follow the
                instructions. The link expires in 1 hour.
              </div>
              <p className="text-center text-sm text-muted-foreground">
                <Link href="/login" className="text-primary hover:underline font-medium">
                  Back to sign in
                </Link>
              </p>
            </div>
          ) : (
            <>
              {error && (
                <div className="rounded-lg bg-destructive/10 text-destructive text-sm p-3 mb-4">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
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
                  <p className="text-xs text-muted-foreground">
                    We&apos;ll email you a link to reset your password.
                  </p>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Sending..." : "Send Reset Link"}
                </Button>
              </form>

              <p className="text-center text-sm text-muted-foreground mt-6">
                Remembered it?{" "}
                <Link href="/login" className="text-primary hover:underline font-medium">
                  Sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
