import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import {
  sendSubcultureReminderEmail,
  sendLowInventoryAlert,
  sendContaminationSpikeAlert,
  operationalEmailEnabled,
  type OperationalSendResult,
} from "@/lib/email";

// This endpoint is called by Vercel Cron daily
// Configure in vercel.json: { "crons": [{ "path": "/api/cron/daily-alerts", "schedule": "0 8 * * *" }] }

// In-app alert rows stay current on every run: a standing condition refreshes
// its recent row (counts, severity) instead of piling up duplicates, and a
// severity escalation marks the row unread and un-dismissed again.
//
// Email is throttled separately, keyed on the last SUCCESSFUL submission
// (emailedAt + emailedSeverity), never on row creation or current row
// severity: failed sends and gated runs do not consume the window, and an
// escalation to critical keeps retrying until a critical email actually goes
// out, even when an earlier failed attempt already marked the in-app row
// critical. All senders used here pass through sendOperationalEmail, which
// enforces OPERATIONAL_EMAILS_ENABLED.
const EMAIL_WINDOW_DAYS = {
  subculture_due: 7,
  low_inventory: 3,
  contamination_spike: 1,
} as const;

type AlertType = keyof typeof EMAIL_WINDOW_DAYS;
type EmailStatus = "none" | "sent" | "failed" | "cooldown" | "disabled" | "no_recipients";

export async function GET(req: NextRequest) {
  // Verify cron secret to prevent unauthorized calls.
  // Reject outright when CRON_SECRET is unset: otherwise the comparison target
  // becomes the literal string "Bearer undefined", which anyone could send.
  const authHeader = req.headers.get("authorization");
  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const orgs = await prisma.organization.findMany({
    select: { id: true, name: true },
  });

  const results: {
    org: string;
    subculture: EmailStatus;
    inventory: EmailStatus;
    contaminationSpike: EmailStatus;
  }[] = [];

  for (const org of orgs) {
    const now = new Date();

    const windowStart = (type: AlertType) => {
      const d = new Date(now);
      d.setDate(d.getDate() - EMAIL_WINDOW_DAYS[type]);
      return d;
    };

    // Refresh the recent in-app alert row when one exists, create otherwise.
    const upsertAlert = async (opts: {
      type: AlertType;
      severity: "warning" | "critical";
      title: string;
      message: string;
      entityType?: string;
      entityId?: string;
    }): Promise<{ alertId: string }> => {
      const existing = await prisma.alert.findFirst({
        where: {
          organizationId: org.id,
          type: opts.type,
          ...(opts.entityId ? { entityId: opts.entityId } : {}),
          createdAt: { gte: windowStart(opts.type) },
        },
        orderBy: { createdAt: "desc" },
      });

      if (!existing) {
        const created = await prisma.alert.create({
          data: {
            type: opts.type,
            severity: opts.severity,
            title: opts.title,
            message: opts.message,
            entityType: opts.entityType,
            entityId: opts.entityId,
            organizationId: org.id,
          },
        });
        return { alertId: created.id };
      }

      const escalated = existing.severity !== "critical" && opts.severity === "critical";
      await prisma.alert.update({
        where: { id: existing.id },
        data: {
          severity: opts.severity,
          title: opts.title,
          message: opts.message,
          // An escalation deserves fresh attention: resurface it even if the
          // earlier, milder alert was read or dismissed.
          ...(escalated ? { isRead: false, isDismissed: false } : {}),
        },
      });
      return { alertId: existing.id };
    };

    // Email eligibility, judged ONLY against the ledger of successful sends:
    // email when nothing of this type (and entity) was successfully emailed
    // inside the window, or when the condition is critical and the last
    // successful email went out at a milder severity. The in-app row's
    // current severity is deliberately not consulted; a failed escalation
    // send must stay retryable.
    const needsEmail = async (
      type: AlertType,
      severity: "warning" | "critical",
      entityId?: string
    ) => {
      const lastSent = await prisma.alert.findFirst({
        where: {
          organizationId: org.id,
          type,
          ...(entityId ? { entityId } : {}),
          emailedAt: { gte: windowStart(type) },
        },
        orderBy: { emailedAt: "desc" },
        select: { emailedSeverity: true },
      });
      if (!lastSent) return true;
      return severity === "critical" && lastSent.emailedSeverity !== "critical";
    };

    const markEmailed = (alertId: string, severity: "warning" | "critical") =>
      prisma.alert.update({
        where: { id: alertId },
        data: { emailedAt: now, emailedSeverity: severity },
      });

    const getManagers = (roles: string[]) =>
      prisma.user.findMany({
        where: { organizationId: org.id, role: { in: roles }, isActive: true },
        select: { email: true },
      });

    // 1. Subculture reminders
    const endOfToday = new Date(now);
    endOfToday.setHours(23, 59, 59, 999);

    const [overdueCount, dueTodayCount] = await Promise.all([
      prisma.vessel.count({
        where: {
          organizationId: org.id,
          status: { notIn: ["disposed", "multiplied"] },
          nextSubcultureDate: { lt: now },
        },
      }),
      prisma.vessel.count({
        where: {
          organizationId: org.id,
          status: { notIn: ["disposed", "multiplied"] },
          nextSubcultureDate: { gte: now, lte: endOfToday },
        },
      }),
    ]);

    let subculture: EmailStatus = "none";
    if (overdueCount > 0 || dueTodayCount > 0) {
      const severity = overdueCount > 10 ? "critical" : "warning";
      const { alertId } = await upsertAlert({
        type: "subculture_due",
        severity,
        title: `${overdueCount} overdue, ${dueTodayCount} due today`,
        message: `${overdueCount} vessel${overdueCount !== 1 ? "s" : ""} overdue for subculture and ${dueTodayCount} due today. Review and process these vessels to stay on schedule.`,
      });

      if (!(await needsEmail("subculture_due", severity))) {
        subculture = "cooldown";
      } else {
        const managers = await getManagers(["admin", "manager", "lead_tech"]);
        if (managers.length === 0) {
          subculture = "no_recipients";
        } else {
          const sendResult: OperationalSendResult = await sendSubcultureReminderEmail({
            overdueCount,
            dueTodayCount,
            recipientEmails: managers.map((m) => m.email),
          });
          subculture = sendResult;
          if (sendResult === "sent") await markEmailed(alertId, severity);
        }
      }
    }

    // 2. Low inventory alerts (deduplicated and throttled per item)
    let inventory: EmailStatus = "none";
    const lowStockItems = await prisma.inventoryItem.findMany({
      where: {
        organizationId: org.id,
        reorderLevel: { not: null },
      },
    });

    const alertItems = lowStockItems.filter(
      (item) => item.reorderLevel !== null && item.currentStock <= item.reorderLevel
    );

    if (alertItems.length > 0) {
      const emailable: {
        item: (typeof alertItems)[number];
        alertId: string;
        severity: "warning" | "critical";
      }[] = [];
      for (const item of alertItems) {
        const severity = item.currentStock === 0 ? "critical" : "warning";
        const { alertId } = await upsertAlert({
          type: "low_inventory",
          severity,
          title: `Low stock: ${item.name}`,
          message: `${item.name} is at ${item.currentStock} ${item.unit} (reorder level: ${item.reorderLevel} ${item.unit}). Restock soon to avoid disruptions.`,
          entityType: "inventory_item",
          entityId: item.id,
        });
        if (await needsEmail("low_inventory", severity, item.id)) {
          emailable.push({ item, alertId, severity });
        }
      }

      if (emailable.length === 0) {
        inventory = "cooldown";
      } else {
        const managers = await getManagers(["admin", "manager"]);
        if (managers.length === 0) {
          inventory = "no_recipients";
        } else {
          let sawFailure = false;
          let sawDisabled = false;
          for (const { item, alertId, severity } of emailable) {
            const sendResult = await sendLowInventoryAlert({
              itemName: item.name,
              currentStock: item.currentStock,
              reorderLevel: item.reorderLevel!,
              unit: item.unit,
              recipientEmails: managers.map((m) => m.email),
            });
            if (sendResult === "sent") await markEmailed(alertId, severity);
            else if (sendResult === "disabled") sawDisabled = true;
            else sawFailure = true;
          }
          inventory = sawFailure ? "failed" : sawDisabled ? "disabled" : "sent";
        }
      }
    }

    // 3. Contamination spike detection
    let contaminationSpike: EmailStatus = "none";
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const twoWeeksAgo = new Date(now);
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    const [currentWeekCount, previousWeekCount] = await Promise.all([
      prisma.vessel.count({
        where: {
          organizationId: org.id,
          contaminationDate: { gte: weekAgo },
        },
      }),
      prisma.vessel.count({
        where: {
          organizationId: org.id,
          contaminationDate: { gte: twoWeeksAgo, lt: weekAgo },
        },
      }),
    ]);

    const isSpike = currentWeekCount >= 3 && (previousWeekCount === 0 || currentWeekCount >= previousWeekCount * 2);

    if (isSpike) {
      const { alertId } = await upsertAlert({
        type: "contamination_spike",
        severity: "critical",
        title: `Contamination spike: ${currentWeekCount} cases this week`,
        message: `${currentWeekCount} contamination cases detected this week vs ${previousWeekCount} last week. Investigate environmental conditions, media batches, and procedural compliance immediately.`,
      });

      if (!(await needsEmail("contamination_spike", "critical"))) {
        contaminationSpike = "cooldown";
      } else {
        const managers = await getManagers(["admin", "manager", "lead_tech"]);
        if (managers.length === 0) {
          contaminationSpike = "no_recipients";
        } else {
          const sendResult: OperationalSendResult = await sendContaminationSpikeAlert({
            currentWeekCount,
            previousWeekCount,
            orgName: org.name,
            recipientEmails: managers.map((m) => m.email),
          });
          contaminationSpike = sendResult;
          if (sendResult === "sent") await markEmailed(alertId, "critical");
        }
      }
    }

    results.push({ org: org.name, subculture, inventory, contaminationSpike });
  }

  return NextResponse.json({
    success: true,
    operationalEmails: operationalEmailEnabled() ? "enabled" : "disabled",
    results,
  });
}
