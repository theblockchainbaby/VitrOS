import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireRole, handleApiError, ApiError } from "@/lib/api-helpers";
import { stripe, PlanName, resolvePriceId, isLiveSubscriptionStatus } from "@/lib/stripe";
import { assertNotDemoAccount } from "@/lib/demo-account";
import { z } from "zod";

const checkoutSchema = z.object({
  plan: z.enum(["solo", "growth", "pro", "enterprise"]),
  interval: z.enum(["monthly", "annual"]).default("monthly"),
  coupon: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    requireRole(user, "admin", "manager");
    assertNotDemoAccount(user, "start a subscription");
    const body = await req.json();
    const { plan, interval, coupon } = checkoutSchema.parse(body);

    const org = await prisma.organization.findUnique({
      where: { id: user.organizationId },
    });
    if (!org) throw new ApiError("Organization not found", 404);

    const priceId = resolvePriceId(plan as PlanName, interval);
    if (!priceId) {
      throw new ApiError(
        `Stripe ${interval} price not configured for this plan. Contact support.`,
        400
      );
    }

    const origin =
      req.headers.get("origin") ||
      process.env.AUTH_URL ||
      "https://vitroslabs.com";

    let customerId = org.stripeCustomerId;

    // A lab that already subscribes must never get a second subscription.
    // Ask Stripe, not our own row: the row lags behind a checkout whose
    // webhook has not landed yet.
    if (customerId) {
      const existing = await stripe.subscriptions.list({ customer: customerId, status: "all", limit: 20 });
      const live = existing.data.find((sub) => isLiveSubscriptionStatus(sub.status));
      if (live) {
        if (live.status === "past_due" || live.status === "unpaid") {
          throw new ApiError("Your last payment failed. Update your payment method under Manage Billing before changing plans.", 409);
        }
        const item = live.items.data[0];
        if (!item) throw new ApiError("Your subscription could not be read. Contact support.", 409);
        if (item.price.id === priceId) {
          throw new ApiError("You are already on this plan.", 409);
        }
        // Switch the plan on the subscription they have. Stripe prorates the
        // difference on the next invoice.
        const updated = await stripe.subscriptions.update(live.id, {
          items: [{ id: item.id, price: priceId }],
          proration_behavior: "create_prorations",
          metadata: { ...live.metadata, organizationId: org.id },
        });
        await prisma.organization.update({
          where: { id: org.id },
          data: {
            stripeSubscriptionId: updated.id,
            stripePriceId: priceId,
            plan,
            planStatus: updated.status === "trialing" ? "trialing" : "active",
          },
        });
        return NextResponse.json({ updated: true, url: `${origin}/admin/billing?success=true` });
      }
    }

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: org.name,
        metadata: {
          organizationId: org.id,
          organizationSlug: org.slug,
        },
      });
      customerId = customer.id;
      await prisma.organization.update({
        where: { id: org.id },
        data: { stripeCustomerId: customerId },
      });
    }

    const sessionParams: Record<string, unknown> = {
      customer: customerId,
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      subscription_data: {
        trial_period_days:
          org.plan === "free" && !org.trialEndsAt ? 30 : undefined,
        metadata: { organizationId: org.id },
      },
      success_url: `${origin}/admin/billing?success=true`,
      cancel_url: `${origin}/admin/billing?canceled=true`,
      metadata: { organizationId: org.id },
    };

    // Apply coupon (e.g. Founding Partner discount)
    if (coupon) {
      sessionParams.discounts = [{ coupon }];
      // Can't combine discounts with trial_period_days
      (sessionParams.subscription_data as Record<string, unknown>).trial_period_days = undefined;
    }

    const session = await stripe.checkout.sessions.create(
      sessionParams as Parameters<typeof stripe.checkout.sessions.create>[0]
    );

    return NextResponse.json({ url: session.url });
  } catch (error) {
    return handleApiError(error);
  }
}
