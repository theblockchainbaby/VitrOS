import { NextRequest, NextResponse } from "next/server";
import { suppressEmail, verifyUnsubscribeToken } from "@/lib/unsubscribe";

const BASE_URL = process.env.AUTH_URL || "https://vitroslabs.com";

/**
 * GET /api/unsubscribe?e=user@example.com&t=<hmac>
 *
 * One-click unsubscribe. Verifies the HMAC token (so URLs are not guessable),
 * inserts into the suppression list, and redirects to /unsubscribed.
 *
 * Per CAN-SPAM, this MUST work from a single GET so mail-client previewers
 * and one-click-unsubscribe headers behave correctly.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("e")?.trim().toLowerCase();
  const token = searchParams.get("t");

  if (!email || !token || !verifyUnsubscribeToken(email, token)) {
    return NextResponse.redirect(
      new URL("/unsubscribed?status=invalid", BASE_URL),
    );
  }

  try {
    await suppressEmail(email, "user_unsubscribed");
  } catch (err) {
    console.error("[unsubscribe] DB write failed:", err);
    return NextResponse.redirect(
      new URL("/unsubscribed?status=error", BASE_URL),
    );
  }

  return NextResponse.redirect(
    new URL(`/unsubscribed?e=${encodeURIComponent(email)}`, BASE_URL),
  );
}

/**
 * POST is supported too — Gmail's one-click List-Unsubscribe header (RFC 8058)
 * sends POST with empty body. Mirror the same flow.
 */
export async function POST(req: NextRequest) {
  return GET(req);
}
