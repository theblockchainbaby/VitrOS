import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { z } from "zod";
import { sendPasswordResetEmail } from "@/lib/email";

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

// Generic response so we never reveal whether an email is registered.
const GENERIC_RESPONSE = {
  success: true,
  message:
    "If an account exists for that email, a password reset link has been sent.",
};

// Best-effort per-IP throttle so this endpoint can't be scripted to spam a
// victim's inbox or burn Resend quota. In-memory (resets on cold start); a
// durable store would be needed for hard guarantees. Over the limit we still
// return the generic response so nothing is leaked, but skip the email.
const RATE_MAX = 5;
const RATE_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const resetRequests = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = resetRequests.get(ip);
  if (!entry || now > entry.resetAt) {
    resetRequests.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > RATE_MAX;
}

export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    if (isRateLimited(ip)) {
      return NextResponse.json(GENERIC_RESPONSE);
    }

    const { email } = forgotPasswordSchema.parse(await req.json());
    const normalizedEmail = email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true, email: true, passwordHash: true },
    });

    // Only act if the user exists and uses password auth. Either way we
    // return the same generic 200 below.
    if (user?.passwordHash) {
      // Single-use, high-entropy token with ~1h expiry.
      const token = randomBytes(32).toString("hex");
      const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      // Invalidate any prior reset tokens for this user, then store the new one.
      // Reuses the NextAuth-standard VerificationToken model; we namespace the
      // identifier so reset tokens don't collide with other verification flows.
      const identifier = `password-reset:${user.email}`;
      await prisma.verificationToken.deleteMany({ where: { identifier } });
      await prisma.verificationToken.create({
        data: { identifier, token, expires },
      });

      const baseUrl = process.env.AUTH_URL || "https://vitroslabs.com";
      const resetUrl = `${baseUrl}/reset-password?token=${token}`;

      try {
        await sendPasswordResetEmail({ to: user.email, resetUrl });
      } catch (emailError) {
        console.error(
          "[ForgotPassword] Failed to send reset email:",
          emailError,
        );
      }
    }

    return NextResponse.json(GENERIC_RESPONSE);
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Don't leak validation specifics for an auth-adjacent endpoint —
      // still return the generic 200.
      return NextResponse.json(GENERIC_RESPONSE);
    }
    console.error("[ForgotPassword] Error:", error);
    return NextResponse.json(GENERIC_RESPONSE);
  }
}
