import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { isTrialExpired, checkVesselLimit, getOrgPlanStatus } from "@/lib/plan-limits";
import { bannerFor } from "@/components/upgrade-banner";
import { isDemoAddress, currentLoginEmail } from "@/lib/demo-account";
import { isLiveSubscriptionStatus } from "@/lib/stripe";

const DAY = 86_400_000;
const NOW = new Date("2026-11-19T12:00:00Z");

describe("trial expiry", () => {
  const trial = (endsInDays: number, sub: string | null = null) => ({
    planStatus: "trialing",
    trialEndsAt: new Date(NOW.getTime() + endsInDays * DAY),
    stripeSubscriptionId: sub,
  });

  it("is live before the end date and expired after it", () => {
    expect(isTrialExpired(trial(3), NOW)).toBe(false);
    expect(isTrialExpired(trial(-1), NOW)).toBe(true);
  });
  it("never expires a trial that belongs to a Stripe subscription", () => {
    expect(isTrialExpired(trial(-10, "sub_123"), NOW)).toBe(false);
  });
  it("does not touch paying or seeded active labs", () => {
    expect(isTrialExpired({ planStatus: "active", trialEndsAt: new Date(0), stripeSubscriptionId: null }, NOW)).toBe(false);
  });

  it("blocks new vessels once the trial has ended, and says why", async () => {
    vi.mocked(prisma.organization.findUnique).mockResolvedValueOnce({
      plan: "free", planStatus: "trialing", vesselLimitOverride: null,
      trialEndsAt: new Date(Date.now() - 5 * DAY), stripeSubscriptionId: null,
    } as never);
    await expect(checkVesselLimit("org")).rejects.toThrow(/free trial ended on .*Choose a plan/);
  });

  it("reports the derived trial_expired status to the client", async () => {
    vi.mocked(prisma.organization.findUnique).mockResolvedValueOnce({
      plan: "free", planStatus: "trialing", trialEndsAt: new Date(Date.now() - DAY), currentPeriodEnd: null,
      stripeSubscriptionId: null, vesselLimitOverride: null, _count: { users: 1, vessels: 4 },
    } as never);
    const status = await getOrgPlanStatus("org");
    expect(status.planStatus).toBe("trial_expired");
    expect(status.limits.maxVessels).toBe(1000);
  });
});

describe("upgrade banner", () => {
  const now = NOW.getTime();
  const limits = { maxVessels: 1000, currentVessels: 10 };
  it("says nothing to a healthy lab", () => {
    expect(bannerFor({ planStatus: "active", hasSubscription: true, limits }, now)).toBeNull();
    expect(bannerFor({ planStatus: "trialing", hasSubscription: false, trialEndsAt: new Date(now + 20 * DAY).toISOString(), limits }, now)).toBeNull();
  });
  it("warns in the last week of a trial", () => {
    const banner = bannerFor({ planStatus: "trialing", hasSubscription: false, trialEndsAt: new Date(now + 2.5 * DAY).toISOString(), limits }, now);
    expect(banner).toMatchObject({ type: "trial_ending", message: expect.stringContaining("3 days") });
  });
  it("tells an expired trial to choose a plan", () => {
    expect(bannerFor({ planStatus: "trial_expired", limits }, now)).toMatchObject({ type: "trial_expired", action: "Choose a plan" });
  });
  it("puts a failed payment ahead of everything else", () => {
    expect(bannerFor({ planStatus: "past_due", limits: { maxVessels: 100, currentVessels: 99 } }, now)?.type).toBe("past_due");
  });
  it("warns near the vessel limit and ignores unlimited plans", () => {
    expect(bannerFor({ planStatus: "active", limits: { maxVessels: 5000, currentVessels: 4100 } }, now)).toMatchObject({ type: "vessel_limit", message: expect.stringContaining("82%") });
    expect(bannerFor({ planStatus: "active", limits: { maxVessels: -1, currentVessels: 999999 } }, now)).toBeNull();
  });
});

describe("demo addresses", () => {
  it("recognises the demo login, seeded users and the unowned legacy domains", () => {
    for (const email of ["demo@vitroslabs.com", "Sarah@demo.vitroslabs.com", "tech1@oglesby.demo.vitroslabs.com", "demo@vitros.app", "tech1@rebel.vitros.app", "x@vitros.io"]) {
      expect(isDemoAddress(email)).toBe(true);
    }
  });
  it("maps demo logins sent out on the old domain to their current address", () => {
    expect(currentLoginEmail("demo@vitros.app")).toBe("demo@vitroslabs.com");
    expect(currentLoginEmail("Demo@Oglesby.vitros.app")).toBe("Demo@Oglesby.demo.vitroslabs.com");
    expect(currentLoginEmail(" demo@conception.vitros.app ")).toBe("demo@conception.demo.vitroslabs.com");
    expect(currentLoginEmail("h.moritz@perfectplants.co.za")).toBe("h.moritz@perfectplants.co.za");
    expect(currentLoginEmail("someone@notvitros.app")).toBe("someone@notvitros.app");
  });
  it("leaves real customers and staff alone", () => {
    for (const email of ["york@vitroslabs.com", "support@vitroslabs.com", "h.moritz@perfectplants.co.za", "someone@notvitros.app.example.com"]) {
      expect(isDemoAddress(email)).toBe(false);
    }
  });
});

const stripeMock = vi.hoisted(() => ({
  subscriptions: { list: vi.fn(), update: vi.fn() },
  customers: { create: vi.fn() },
  checkout: { sessions: { create: vi.fn() } },
}));
vi.mock("@/lib/stripe", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/stripe")>();
  return { ...actual, stripe: stripeMock, resolvePriceId: (plan: string, interval: string) => `price_${plan}_${interval}` };
});

describe("POST /api/billing/checkout", () => {
  const post = async (body: unknown) => {
    const { POST } = await import("@/app/api/billing/checkout/route");
    return POST(new NextRequest("http://localhost:3000/api/billing/checkout", {
      method: "POST", body: JSON.stringify(body), headers: { "Content-Type": "application/json", origin: "http://localhost:3000" },
    }));
  };
  const org = (extra: Record<string, unknown> = {}) => ({ id: "test-org-id", name: "Lab", slug: "lab", plan: "free", trialEndsAt: new Date(), stripeCustomerId: "cus_1", ...extra });
  const orgUpdate = vi.fn();

  beforeEach(() => {
    stripeMock.subscriptions.list.mockReset().mockResolvedValue({ data: [] });
    stripeMock.subscriptions.update.mockReset();
    stripeMock.customers.create.mockReset().mockResolvedValue({ id: "cus_new" });
    stripeMock.checkout.sessions.create.mockReset().mockResolvedValue({ url: "https://checkout.stripe.test/s" });
    orgUpdate.mockReset();
    (prisma as unknown as { organization: Record<string, unknown> }).organization.update = orgUpdate;
    vi.mocked(prisma.organization.findUnique).mockReset().mockResolvedValue(org() as never);
    vi.mocked(auth).mockResolvedValue({ user: { id: "u", name: "Admin", email: "admin@lab.com", role: "admin", organizationId: "test-org-id" } } as never);
  });

  it("opens checkout for a lab with no subscription", async () => {
    const res = await post({ plan: "solo" });
    expect(await res.json()).toEqual({ url: "https://checkout.stripe.test/s" });
    expect(stripeMock.checkout.sessions.create).toHaveBeenCalledOnce();
  });

  it("switches the existing subscription instead of opening a second one", async () => {
    stripeMock.subscriptions.list.mockResolvedValue({ data: [{ id: "sub_1", status: "active", metadata: {}, items: { data: [{ id: "si_1", price: { id: "price_solo_monthly" } }] } }] });
    stripeMock.subscriptions.update.mockResolvedValue({ id: "sub_1", status: "active" });
    const res = await post({ plan: "growth" });
    expect(res.status).toBe(200);
    expect((await res.json()).updated).toBe(true);
    expect(stripeMock.checkout.sessions.create).not.toHaveBeenCalled();
    expect(stripeMock.subscriptions.update).toHaveBeenCalledWith("sub_1", expect.objectContaining({ items: [{ id: "si_1", price: "price_growth_monthly" }] }));
    expect(orgUpdate.mock.calls[0][0].data).toMatchObject({ plan: "growth", stripeSubscriptionId: "sub_1" });
  });

  it("refuses to re-buy the plan the lab is already on", async () => {
    stripeMock.subscriptions.list.mockResolvedValue({ data: [{ id: "sub_1", status: "active", metadata: {}, items: { data: [{ id: "si_1", price: { id: "price_solo_monthly" } }] } }] });
    const res = await post({ plan: "solo" });
    expect(res.status).toBe(409);
    expect(stripeMock.checkout.sessions.create).not.toHaveBeenCalled();
    expect(stripeMock.subscriptions.update).not.toHaveBeenCalled();
  });

  it("ignores canceled subscriptions when deciding", async () => {
    stripeMock.subscriptions.list.mockResolvedValue({ data: [{ id: "sub_old", status: "canceled", metadata: {}, items: { data: [] } }] });
    await post({ plan: "solo" });
    expect(stripeMock.checkout.sessions.create).toHaveBeenCalledOnce();
    expect(isLiveSubscriptionStatus("canceled")).toBe(false);
    expect(isLiveSubscriptionStatus("past_due")).toBe(true);
  });

  it("keeps technicians and the shared demo login out of billing", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "u", name: "Tech", email: "tech@lab.com", role: "tech", organizationId: "test-org-id" } } as never);
    expect((await post({ plan: "solo" })).status).toBe(403);
    vi.mocked(auth).mockResolvedValue({ user: { id: "u", name: "Demo", email: "demo@vitroslabs.com", role: "admin", organizationId: "test-org-id" } } as never);
    const res = await post({ plan: "solo" });
    expect(res.status).toBe(403);
    expect((await res.json()).error).toContain("demo workspace");
    expect(stripeMock.checkout.sessions.create).not.toHaveBeenCalled();
  });
});
