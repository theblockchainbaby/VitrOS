import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM_EMAIL = process.env.EMAIL_FROM || "VitrOS <noreply@vitroslabs.com>";
const REPLY_TO_EMAIL = process.env.EMAIL_REPLY_TO || "support@vitroslabs.com";

interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
  if (!resend) {
    console.warn("[Email] RESEND_API_KEY not configured — skipping email:", subject);
    return null;
  }

  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: Array.isArray(to) ? to : [to],
      replyTo: REPLY_TO_EMAIL,
      subject,
      html,
    });
    // Resend reports rejections as { data: null, error } instead of throwing,
    // and that object is truthy. Verify explicitly: a send only counts when
    // the provider returned a message id.
    if (result.error || !result.data?.id) {
      console.error("[Email] Send rejected:", result.error ?? "no message id returned");
      return null;
    }
    return result;
  } catch (error) {
    console.error("[Email] Failed to send:", error);
    return null;
  }
}

// Account / transactional templates

const APP_URL = process.env.AUTH_URL || "https://vitroslabs.com";

// Operational (system-initiated) email: daily alerts, weekly reports.
// Disabled unless OPERATIONAL_EMAILS_ENABLED="true", so restoring the email
// key cannot start unsolicited mail to dormant orgs. User-initiated
// transactional mail (welcome, password reset) is never gated by this.
export function operationalEmailEnabled(): boolean {
  return process.env.OPERATIONAL_EMAILS_ENABLED === "true";
}

export type OperationalSendResult = "sent" | "failed" | "disabled";

// Every system-initiated email must pass through this wrapper so the
// operational gate cannot be bypassed at a call site. "sent" means the
// provider returned a message id; anything else did not go out.
export async function sendOperationalEmail(opts: EmailOptions): Promise<OperationalSendResult> {
  if (!operationalEmailEnabled()) return "disabled";
  return (await sendEmail(opts)) ? "sent" : "failed";
}

export async function sendWelcomeEmail(params: {
  to: string;
  name: string;
  orgName: string;
}) {
  return sendEmail({
    to: params.to,
    subject: "Welcome to VitrOS",
    html: `
      <div style="font-family: Arial, Helvetica, sans-serif; max-width: 560px; margin: 24px auto; color: #25352e; line-height: 1.6;">
        <div style="background: #235c43; color: white; padding: 20px 24px; border-radius: 10px 10px 0 0;">
          <p style="margin: 0 0 10px; font-size: 13px; font-weight: bold; letter-spacing: 0.5px;">VitrOS</p>
          <h2 style="margin: 0; font-size: 20px; line-height: 1.3;">Welcome to VitrOS</h2>
        </div>
        <div style="border: 1px solid #dbe3dc; border-top: none; padding: 24px; border-radius: 0 0 10px 10px; background: #ffffff;">
          <p style="margin: 0 0 12px; font-size: 14px; color: #34463c;">Hi ${params.name},</p>
          <p style="margin: 0 0 12px; font-size: 14px; color: #34463c;">
            Your lab <strong>${params.orgName}</strong> is set up and ready. VitrOS helps you track vessels, catch contamination early, and keep your tissue culture operation running smoothly.
          </p>
          <p style="margin: 0 0 16px; font-size: 14px; color: #34463c;">
            Your free trial is active. Log in to add your first vessels and invite your team.
          </p>
          <a href="${APP_URL}" style="display: inline-block; background: #235c43; color: white; padding: 12px 20px; border-radius: 6px; font-weight: bold; text-decoration: none; font-size: 14px;">Open VitrOS</a>
          <p style="margin-top: 16px; font-size: 13px; color: #607068;">Questions? Just reply to this email and we'll help.</p>
        </div>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(params: {
  to: string;
  resetUrl: string;
}) {
  return sendEmail({
    to: params.to,
    subject: "Reset your VitrOS password",
    html: `
      <div style="font-family: Arial, Helvetica, sans-serif; max-width: 560px; margin: 24px auto; color: #25352e; line-height: 1.6;">
        <div style="background: #235c43; color: white; padding: 20px 24px; border-radius: 10px 10px 0 0;">
          <p style="margin: 0 0 10px; font-size: 13px; font-weight: bold; letter-spacing: 0.5px;">VitrOS</p>
          <h2 style="margin: 0; font-size: 20px; line-height: 1.3;">Reset your password</h2>
        </div>
        <div style="border: 1px solid #dbe3dc; border-top: none; padding: 24px; border-radius: 0 0 10px 10px; background: #ffffff;">
          <p style="margin: 0 0 12px; font-size: 14px; color: #34463c;">
            We received a request to reset the password for your VitrOS account. Click the button below to choose a new password. This link expires in 1 hour.
          </p>
          <a href="${params.resetUrl}" style="display: inline-block; background: #235c43; color: white; padding: 12px 20px; border-radius: 6px; font-weight: bold; text-decoration: none; font-size: 14px;">Reset Password</a>
          <p style="margin-top: 16px; font-size: 13px; color: #607068;">
            If you didn't request this, you can safely ignore this email and your password will stay the same.
          </p>
          <p style="margin-top: 12px; font-size: 12px; color: #607068; word-break: break-all;">
            Or paste this link into your browser: ${params.resetUrl}
          </p>
        </div>
      </div>
    `,
  });
}

// Pre-built alert templates

export async function sendContaminationAlert(params: {
  vesselBarcode: string;
  contaminationType: string;
  detectedBy: string;
  recipientEmails: string[];
}) {
  return sendOperationalEmail({
    to: params.recipientEmails,
    subject: `[VitrOS Alert] Contamination Detected — ${params.vesselBarcode}`,
    html: `
      <div style="font-family: Arial, Helvetica, sans-serif; max-width: 560px; margin: 24px auto; color: #25352e; line-height: 1.6;">
        <div style="background: #dc2626; color: white; padding: 20px 24px; border-radius: 10px 10px 0 0;">
          <p style="margin: 0 0 10px; font-size: 13px; font-weight: bold; letter-spacing: 0.5px;">VitrOS</p>
          <h2 style="margin: 0; font-size: 20px; line-height: 1.3;">Contamination Alert</h2>
        </div>
        <div style="border: 1px solid #dbe3dc; border-top: none; padding: 24px; border-radius: 0 0 10px 10px; background: #ffffff;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 6px 0; color: #607068;">Vessel</td><td style="padding: 6px 0; font-family: monospace; font-weight: bold;">${params.vesselBarcode}</td></tr>
            <tr><td style="padding: 6px 0; color: #607068;">Type</td><td style="padding: 6px 0; text-transform: capitalize;">${params.contaminationType}</td></tr>
            <tr><td style="padding: 6px 0; color: #607068;">Detected by</td><td style="padding: 6px 0;">${params.detectedBy}</td></tr>
            <tr><td style="padding: 6px 0; color: #607068;">Time</td><td style="padding: 6px 0;">${new Date().toLocaleString()}</td></tr>
          </table>
          <p style="margin-top: 16px; font-size: 14px; color: #34463c;">Isolate this vessel immediately and check nearby vessels for cross-contamination.</p>
        </div>
      </div>
    `,
  });
}

export async function sendBatchDisposeAlert(params: {
  vesselCount: number;
  disposedBy: string;
  reason: string;
  recipientEmails: string[];
}) {
  return sendOperationalEmail({
    to: params.recipientEmails,
    subject: `[VitrOS Alert] ${params.vesselCount} Vessels Disposed`,
    html: `
      <div style="font-family: Arial, Helvetica, sans-serif; max-width: 560px; margin: 24px auto; color: #25352e; line-height: 1.6;">
        <div style="background: #875c16; color: white; padding: 20px 24px; border-radius: 10px 10px 0 0;">
          <p style="margin: 0 0 10px; font-size: 13px; font-weight: bold; letter-spacing: 0.5px;">VitrOS</p>
          <h2 style="margin: 0; font-size: 20px; line-height: 1.3;">Batch Disposal Alert</h2>
        </div>
        <div style="border: 1px solid #dbe3dc; border-top: none; padding: 24px; border-radius: 0 0 10px 10px; background: #ffffff;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 6px 0; color: #607068;">Vessels Disposed</td><td style="padding: 6px 0; font-weight: bold;">${params.vesselCount}</td></tr>
            <tr><td style="padding: 6px 0; color: #607068;">Reason</td><td style="padding: 6px 0;">${params.reason}</td></tr>
            <tr><td style="padding: 6px 0; color: #607068;">Disposed by</td><td style="padding: 6px 0;">${params.disposedBy}</td></tr>
            <tr><td style="padding: 6px 0; color: #607068;">Time</td><td style="padding: 6px 0;">${new Date().toLocaleString()}</td></tr>
          </table>
        </div>
      </div>
    `,
  });
}

export async function sendSubcultureReminderEmail(params: {
  overdueCount: number;
  dueTodayCount: number;
  recipientEmails: string[];
}) {
  return sendOperationalEmail({
    to: params.recipientEmails,
    subject: `[VitrOS] ${params.overdueCount} overdue, ${params.dueTodayCount} due today — Subculture Reminder`,
    html: `
      <div style="font-family: Arial, Helvetica, sans-serif; max-width: 560px; margin: 24px auto; color: #25352e; line-height: 1.6;">
        <div style="background: #235c43; color: white; padding: 20px 24px; border-radius: 10px 10px 0 0;">
          <p style="margin: 0 0 10px; font-size: 13px; font-weight: bold; letter-spacing: 0.5px;">VitrOS</p>
          <h2 style="margin: 0; font-size: 20px; line-height: 1.3;">Daily Subculture Reminder</h2>
        </div>
        <div style="border: 1px solid #dbe3dc; border-top: none; padding: 24px; border-radius: 0 0 10px 10px; background: #ffffff;">
          <div style="display: flex; gap: 16px; margin-bottom: 16px;">
            <div style="text-align: center; flex: 1;">
              <div style="font-size: 28px; font-weight: bold; color: ${params.overdueCount > 0 ? '#dc2626' : '#235c43'};">${params.overdueCount}</div>
              <div style="font-size: 12px; color: #607068;">Overdue</div>
            </div>
            <div style="text-align: center; flex: 1;">
              <div style="font-size: 28px; font-weight: bold; color: #875c16;">${params.dueTodayCount}</div>
              <div style="font-size: 12px; color: #607068;">Due Today</div>
            </div>
          </div>
          <p style="font-size: 14px; color: #34463c;">Log in to VitrOS to view and process these vessels.</p>
        </div>
      </div>
    `,
  });
}

export async function sendContaminationSpikeAlert(params: {
  currentWeekCount: number;
  previousWeekCount: number;
  orgName: string;
  recipientEmails: string[];
}) {
  return sendOperationalEmail({
    to: params.recipientEmails,
    subject: `[VitrOS Alert] Contamination Spike Detected — ${params.orgName}`,
    html: `
      <div style="font-family: Arial, Helvetica, sans-serif; max-width: 560px; margin: 24px auto; color: #25352e; line-height: 1.6;">
        <div style="background: #dc2626; color: white; padding: 20px 24px; border-radius: 10px 10px 0 0;">
          <p style="margin: 0 0 10px; font-size: 13px; font-weight: bold; letter-spacing: 0.5px;">VitrOS</p>
          <h2 style="margin: 0; font-size: 20px; line-height: 1.3;">Contamination Spike Detected</h2>
        </div>
        <div style="border: 1px solid #dbe3dc; border-top: none; padding: 24px; border-radius: 0 0 10px 10px; background: #ffffff;">
          <div style="display: flex; gap: 16px; margin-bottom: 16px;">
            <div style="text-align: center; flex: 1;">
              <div style="font-size: 28px; font-weight: bold; color: #dc2626;">${params.currentWeekCount}</div>
              <div style="font-size: 12px; color: #607068;">This Week</div>
            </div>
            <div style="text-align: center; flex: 1;">
              <div style="font-size: 28px; font-weight: bold; color: #607068;">${params.previousWeekCount}</div>
              <div style="font-size: 12px; color: #607068;">Last Week</div>
            </div>
          </div>
          <p style="margin: 0; font-size: 14px; color: #34463c;">
            Contamination cases have ${params.previousWeekCount === 0 ? "appeared" : `increased ${Math.round((params.currentWeekCount / params.previousWeekCount) * 100 - 100)}%`} compared to last week. Review affected vessels immediately and check for environmental or procedural causes.
          </p>
          <p style="margin-top: 12px; font-size: 13px; color: #607068;">Log in to VitrOS to view contamination analytics and affected vessels.</p>
        </div>
      </div>
    `,
  });
}

export async function sendLowInventoryAlert(params: {
  itemName: string;
  currentStock: number;
  reorderLevel: number;
  unit: string;
  recipientEmails: string[];
}) {
  return sendOperationalEmail({
    to: params.recipientEmails,
    subject: `[VitrOS Alert] Low Stock — ${params.itemName}`,
    html: `
      <div style="font-family: Arial, Helvetica, sans-serif; max-width: 560px; margin: 24px auto; color: #25352e; line-height: 1.6;">
        <div style="background: #875c16; color: white; padding: 20px 24px; border-radius: 10px 10px 0 0;">
          <p style="margin: 0 0 10px; font-size: 13px; font-weight: bold; letter-spacing: 0.5px;">VitrOS</p>
          <h2 style="margin: 0; font-size: 20px; line-height: 1.3;">Low Inventory Alert</h2>
        </div>
        <div style="border: 1px solid #dbe3dc; border-top: none; padding: 24px; border-radius: 0 0 10px 10px; background: #ffffff;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 6px 0; color: #607068;">Item</td><td style="padding: 6px 0; font-weight: bold;">${params.itemName}</td></tr>
            <tr><td style="padding: 6px 0; color: #607068;">Current Stock</td><td style="padding: 6px 0; color: #dc2626; font-weight: bold;">${params.currentStock} ${params.unit}</td></tr>
            <tr><td style="padding: 6px 0; color: #607068;">Reorder Level</td><td style="padding: 6px 0;">${params.reorderLevel} ${params.unit}</td></tr>
          </table>
          <p style="margin-top: 16px; font-size: 14px; color: #34463c;">Restock this item as soon as possible to avoid disruptions.</p>
        </div>
      </div>
    `,
  });
}
