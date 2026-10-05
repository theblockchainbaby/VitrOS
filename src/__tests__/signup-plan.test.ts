import { describe, expect, it } from "vitest";
import { getSignupPlan } from "@/lib/signup-plan";

describe("signup plan context", () => {
  it("preserves a supported plan and annual interval from pricing", () => {
    expect(getSignupPlan("growth", "annual")).toEqual({ key: "growth", name: "Growth", interval: "annual", price: 990 });
  });
  it("uses monthly billing unless annual is explicitly selected", () => {
    expect(getSignupPlan("solo", "unexpected")?.price).toBe(49);
    expect(getSignupPlan("pro", null)?.interval).toBe("monthly");
  });
  it("does not send unsupported or contact-sales plans to checkout", () => {
    for (const plan of [null, "free", "enterprise", "invalid"]) expect(getSignupPlan(plan, "annual")).toBeNull();
  });
});
