import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import {
  sendSubcultureReminderEmail,
  sendLowInventoryAlert,
  sendContaminationSpikeAlert,
  operationalEmailEnabled,
} from "@/lib/email";

// This endpoint is called by Vercel Cron daily
// Configure in vercel.json: { "crons": [{ "path": "/api/cron/daily-alerts", "schedule": "0 8 * * *" }] }

// In-app alert rows stay current on every run: a standing condition refreshes
// its recent row (counts, severity) instead of piling up duplicates, and a
// severity escalation marks the row unread again. Email has its own throttle
// so the same condition does not re-mail managers every day: one email per
// alert type (per item, for inventory) per window, except when severity
// escalates to critical. On top of that, ALL operational email sits behind
// OPERATIONAL_EMAILS_ENABLED, so in-app alerts keep working while email to
// organizations stays off until explicitly enabled.
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

  const emailsEnabled = operationalEmailEnabled();

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
    // Returns whether this run is allowed to email for the condition: yes for
    // a new row in the window, yes on escalation to critical, no otherwise.
    const upsertAlert = async (opts: {
      type: AlertType;
      severity: "warning" | "critical";
      title: string;
      message: string;
      entityType?: string;
      entityId?: string;
    }): Promise<{ shouldEmail: boolean }> => {
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
        await prisma.alert.create({
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
        return { shouldEmail: true };
      }

      const escalated = existing.severity !== "critical" && opts.severity === "critical";
      await prisma.alert.update({
        where: { id: existing.id },
        data: {
          severity: opts.severity,
          title: opts.title,
          message: opts.message,
          // An escalation deserves fresh attention in the app too
          ...(escalated ? { isRead: false } : {}),
        },
      });
      return { shouldEmail: escalated };
    };

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
      const { shouldEmail } = await upsertAlert({
        type: "subculture_due",
        severity: overdueCount > 10 ? "critical" : "warning",
        title: `${overdueCount} overdue, ${dueTodayCount} due today`,
        message: `${overdueCount} vessel${overdueCount !== 1 ? "s" : ""} overdue for subculture and ${dueTodayCount} due today. Review and process these vessels to stay on schedule.`,
      });

      if (!shouldEmail) {
        subculture = "cooldown";
      } else if (!emailsEnabled) {
        subculture = "disabled";
      } else {
        const managers = await getManagers(["admin", "manager", "lead_tech"]);
        if (managers.length === 0) {
          subculture = "no_recipients";
        } else {
          const sent = await sendSubcultureReminderEmail({
            overdueCount,
            dueTodayCount,
            recipientEmails: managers.map((m) => m.email),
          });
          subculture = sent ? "sent" : "failed";
        }
      }
    }

    // 2. Low inventory alerts (deduplicated per item, not per org)
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
      const emailable: typeof alertItems = [];
      for (const item of alertItems) {
        const { shouldEmail } = await upsertAlert({
          type: "low_inventory",
          severity: item.currentStock === 0 ? "critical" : "warning",
          title: `Low stock: ${item.name}`,
          message: `${item.name} is at ${item.currentStock} ${item.unit} (reorder level: ${item.reorderLevel} ${item.unit}). Restock soon to avoid disruptions.`,
          entityType: "inventory_item",
          entityId: item.id,
        });
        if (shouldEmail) emailable.push(item);
      }

      if (emailable.length === 0) {
        inventory = "cooldown";
      } else if (!emailsEnabled) {
        inventory = "disabled";
      } else {
        const managers = await getManagers(["admin", "manager"]);
        if (managers.length === 0) {
          inventory = "no_recipients";
        } else {
          let allSent = true;
          for (const item of emailable) {
            const sent = await sendLowInventoryAlert({
              itemName: item.name,
              currentStock: item.currentStock,
              reorderLevel: item.reorderLevel!,
              unit: item.unit,
              recipientEmails: managers.map((m) => m.email),
            });
            if (!sent) allSent = false;
          }
          inventory = allSent ? "sent" : "failed";
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
      const { shouldEmail } = await upsertAlert({
        type: "contamination_spike",
        severity: "critical",
        title: `Contamination spike: ${currentWeekCount} cases this week`,
        message: `${currentWeekCount} contamination cases detected this week vs ${previousWeekCount} last week. Investigate environmental conditions, media batches, and procedural compliance immediately.`,
      });

      if (!shouldEmail) {
        contaminationSpike = "cooldown";
      } else if (!emailsEnabled) {
        contaminationSpike = "disabled";
      } else {
        const managers = await getManagers(["admin", "manager", "lead_tech"]);
        if (managers.length === 0) {
          contaminationSpike = "no_recipients";
        } else {
          const sent = await sendContaminationSpikeAlert({
            currentWeekCount,
            previousWeekCount,
            orgName: org.name,
            recipientEmails: managers.map((m) => m.email),
          });
          contaminationSpike = sent ? "sent" : "failed";
        }
      }
    }

    results.push({ org: org.name, subculture, inventory, contaminationSpike });
  }

  return NextResponse.json({
    success: true,
    operationalEmails: emailsEnabled ? "enabled" : "disabled",
    results,
  });
}
