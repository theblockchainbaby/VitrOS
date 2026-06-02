import { createHmac, timingSafeEqual } from "crypto";
import { prisma } from "./prisma";

const SECRET = process.env.AUTH_SECRET || "fallback-not-for-prod";

/**
 * Deterministic 16-char hex token derived from the email + AUTH_SECRET.
 * Used in the unsubscribe URL so random people can't unsubscribe arbitrary
 * addresses by guessing URLs. Not a security boundary, just a sanity check.
 */
export function unsubscribeToken(email: string): string {
  return createHmac("sha256", SECRET)
    .update(email.trim().toLowerCase())
    .digest("hex")
    .slice(0, 16);
}

export function verifyUnsubscribeToken(email: string, token: string): boolean {
  const expected = unsubscribeToken(email);
  if (token.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(token), Buffer.from(expected));
}

/**
 * Full unsubscribe URL for a given recipient. Use in email signatures and
 * marketing footers.
 */
export function unsubscribeUrl(email: string, baseUrl = "https://vitroslabs.com"): string {
  const e = email.trim().toLowerCase();
  return `${baseUrl}/api/unsubscribe?e=${encodeURIComponent(e)}&t=${unsubscribeToken(e)}`;
}

/**
 * Check if an address has unsubscribed (or bounced / complained). Call before
 * every Resend send. Returns the suppression record or null.
 */
export async function isSuppressed(email: string) {
  return prisma.emailSuppression.findUnique({
    where: { email: email.trim().toLowerCase() },
  });
}

/**
 * Mark an address as suppressed. Idempotent — re-suppressing an existing
 * address just refreshes the record.
 */
export async function suppressEmail(
  email: string,
  reason: string = "user_unsubscribed",
  campaignId?: string,
) {
  const lower = email.trim().toLowerCase();
  return prisma.emailSuppression.upsert({
    where: { email: lower },
    update: { reason, campaignId: campaignId ?? null },
    create: { email: lower, reason, campaignId: campaignId ?? null },
  });
}
