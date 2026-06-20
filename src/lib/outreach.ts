import { Resend } from "resend";
import { isSuppressed, unsubscribeUrl } from "./unsubscribe";

const resend = process.env.OUTREACH_RESEND_API_KEY
  ? new Resend(process.env.OUTREACH_RESEND_API_KEY)
  : null;

/**
 * Cold-outreach / marketing email path. Distinct from src/lib/email.ts
 * (which handles transactional alerts) because outreach has different
 * sender domain, suppression-check, and CAN-SPAM requirements.
 *
 * Uses a SEPARATE Resend key (OUTREACH_RESEND_API_KEY) from the
 * transactional path (RESEND_API_KEY) so cold outreach can never route
 * through the transactional account — any deliverability or reputation
 * hit on cold sending stays isolated from account/transactional mail.
 *
 * Default FROM domain is outreach.vitroslabs.com so any deliverability hit
 * is isolated from the primary domain.
 */

const OUTREACH_FROM =
  process.env.OUTREACH_FROM_EMAIL || "York Sims <york@outreach.vitroslabs.com>";

const OUTREACH_REPLY_TO = "york@vitroslabs.com";

interface OutreachOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  campaignId?: string;
}

interface OutreachResult {
  ok: boolean;
  skipped?: "suppressed" | "no_api_key";
  error?: string;
  resendId?: string;
}

/**
 * Send a single outreach email through Resend. Checks the suppression list
 * first and aborts with skipped:"suppressed" if the address has opted out
 * or been marked as a bounce / complaint.
 *
 * Sets the RFC 8058 List-Unsubscribe and List-Unsubscribe-Post headers so
 * Gmail and Apple Mail render a native one-click unsubscribe button.
 */
export async function sendOutreach(opts: OutreachOptions): Promise<OutreachResult> {
  if (!resend) {
    console.warn("[Outreach] OUTREACH_RESEND_API_KEY not configured");
    return { ok: false, skipped: "no_api_key" };
  }

  const suppressed = await isSuppressed(opts.to);
  if (suppressed) {
    console.log(
      `[Outreach] Skipping ${opts.to} (suppressed: ${suppressed.reason})`,
    );
    return { ok: false, skipped: "suppressed" };
  }

  const unsubUrl = unsubscribeUrl(opts.to);

  try {
    const result = await resend.emails.send({
      from: OUTREACH_FROM,
      to: [opts.to],
      replyTo: OUTREACH_REPLY_TO,
      subject: opts.subject,
      html: opts.html,
      text: opts.text,
      headers: {
        // RFC 8058 one-click unsubscribe (Gmail, Apple Mail)
        "List-Unsubscribe": `<${unsubUrl}>, <mailto:unsubscribe@vitroslabs.com?subject=unsubscribe>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
        ...(opts.campaignId ? { "X-Campaign-Id": opts.campaignId } : {}),
      },
    });

    if (result.error) {
      return { ok: false, error: result.error.message };
    }
    return { ok: true, resendId: result.data?.id };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[Outreach] Failed to send to ${opts.to}: ${msg}`);
    return { ok: false, error: msg };
  }
}

/**
 * Throttled bulk send. Sequences sends at the given interval (default 2s
 * between sends, ~30/min) so we don't spike. Returns a per-recipient result
 * array suitable for logging.
 */
export async function sendOutreachBatch(
  items: OutreachOptions[],
  options: { delayMs?: number } = {},
): Promise<Array<{ to: string } & OutreachResult>> {
  const delay = options.delayMs ?? 2000;
  const results: Array<{ to: string } & OutreachResult> = [];
  for (const item of items) {
    const r = await sendOutreach(item);
    results.push({ to: item.to, ...r });
    if (delay > 0) {
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  return results;
}
