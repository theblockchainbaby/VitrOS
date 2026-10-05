const signupPlans = {
  solo: { name: "Solo", monthly: 49, annual: 490 },
  growth: { name: "Growth", monthly: 99, annual: 990 },
  pro: { name: "Pro", monthly: 199, annual: 1990 },
};

export function getSignupPlan(plan: string | null, interval: string | null) {
  if (!plan || !Object.prototype.hasOwnProperty.call(signupPlans, plan)) return null;
  const key = plan as keyof typeof signupPlans;
  const billing = interval === "annual" ? "annual" : "monthly";
  return { key, name: signupPlans[key].name, interval: billing, price: signupPlans[key][billing] };
}
