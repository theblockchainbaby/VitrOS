import { PublicPage } from "@/components/public-site";
import { publicPageMetadata } from "@/lib/seo";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const metadata = publicPageMetadata({
  title: "Tissue Culture Software Pricing & Plans | VitrOS",
  description:
    "Compare VitrOS plans for tissue culture labs, including vessel limits, team access, and lab management features. Choose a plan for your operation.",
  path: "/pricing",
});

const PLANS = [
  {
    name: "Solo",
    price: 49,
    priceAnnual: 490,
    contactUs: false,
    description: "For single-bench labs, hobbyists, and small startups",
    features: [
      "1 user, 1 location",
      "Up to 500 active vessels",
      "Barcode scanning",
      "Vessel tracking & stage pipeline",
      "Basic contamination tracking",
      "Media recipe management",
      "Email support",
    ],
  },
  {
    name: "Growth",
    price: 99,
    priceAnnual: 990,
    contactUs: false,
    description: "For mid-size operations scaling production",
    popular: true,
    features: [
      "Up to 5 users, 3 locations",
      "Up to 5,000 active vessels",
      "Everything in Solo, plus:",
      "Advanced analytics & dashboards",
      "Contamination trend analysis",
      "Production pipeline views",
      "Demand forecasting",
      "Lineage tree tracking",
      "Batch operations",
      "Priority support",
    ],
  },
  {
    name: "Pro",
    price: 199,
    priceAnnual: 1990,
    contactUs: false,
    description: "For serious operations needing full lab management",
    features: [
      "Unlimited users & locations",
      "Unlimited active vessels",
      "Everything in Growth, plus:",
      "Tech performance & incentive tracking",
      "Station & hood contamination correlation",
      "Media batch correlation",
      "Backward production scheduling",
      "Shift handoff notes",
      "Zebra ZPL label printing",
      "Priority support",
    ],
  },
  {
    name: "Enterprise",
    price: null,
    priceAnnual: null,
    contactUs: true,
    description: "For large-scale operations with custom needs",
    features: [
      "Everything in Pro, plus:",
      "Custom integrations & API access",
      "Dedicated account manager",
      "Discuss service-level requirements",
      "On-site training & onboarding",
      "Custom reporting",
      "Discuss identity and security requirements",
      "White-glove onboarding",
    ],
  },
];

const FAQ = [
  {
    q: "Is there a free trial?",
    a: "Create a workspace with a 30-day trial and no credit card. If you select a paid plan, checkout shows the payment details and any applicable trial before you subscribe.",
  },
  {
    q: "Can I switch plans later?",
    a: "Manage your subscription from Billing. Review the effective date and any charge shown in checkout or the billing portal before confirming a change.",
  },
  {
    q: "What counts as an 'active vessel'?",
    a: "Any vessel that hasn't been disposed or shipped out. Archived vessels don't count toward your limit.",
  },
  {
    q: "Do you offer discounts for annual billing?",
    a: "Yes. Pay annually and get 2 months free on any plan. That means Solo is just $490/year, Growth is $990/year, and Pro is $1,990/year.",
  },
  {
    q: "What if I need more vessels but not Enterprise features?",
    a: "Pro gives you unlimited vessels and users. If you need custom integrations or dedicated support on top of that, Enterprise is the way to go.",
  },
];

export default async function PricingPage({
  searchParams,
}: {
  searchParams: Promise<{ billing?: string }>;
}) {
  const { billing } = await searchParams;
  const annual = billing === "annual";
  return (
    <PublicPage>

      {/* Hero */}
      <section className="py-16 md:py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight mb-6">
            Tissue culture software pricing
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Lab workflow software that grows with your operation. Every plan includes vessel tracking,
            barcode scanning, and real-time dashboards. Start from $49/mo. Pay annually and get 2 months free.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-16 md:pb-24 px-4">
        {/* Billing interval toggle */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex items-center rounded-lg border p-1 text-sm">
            <Link
              href="/pricing"
              scroll={false}
              className={`px-4 py-1.5 rounded-md transition-colors ${
                !annual ? "bg-primary text-primary-foreground" : "text-muted-foreground"
              }`}
            >
              Monthly
            </Link>
            <Link
              href="/pricing?billing=annual"
              scroll={false}
              className={`px-4 py-1.5 rounded-md transition-colors ${
                annual ? "bg-primary text-primary-foreground" : "text-muted-foreground"
              }`}
            >
              Annual
              <span className="ml-1.5 text-xs opacity-80">2 months free</span>
            </Link>
          </div>
        </div>
        {/* Main 4 plans */}
        <div className="max-w-6xl mx-auto grid sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-xl border bg-background p-6 flex flex-col ${
                plan.popular ? "border-primary shadow-lg ring-1 ring-primary/20 relative" : ""
              }`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">
                  For growing labs
                </Badge>
              )}
              <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
              <p className="text-xs text-muted-foreground mb-4">{plan.description}</p>
              <div className="mb-6">
                {plan.contactUs ? (
                  <span className="text-2xl font-bold text-muted-foreground">Contact Us</span>
                ) : (
                  <>
                    <span className="text-3xl font-bold">
                      ${(annual ? plan.priceAnnual! : plan.price!).toLocaleString()}
                    </span>
                    <span className="text-muted-foreground">{annual ? "/yr" : "/mo"}</span>
                  </>
                )}
              </div>
              <ul className="space-y-2 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6">
                {plan.contactUs ? (
                  <a href="mailto:support@vitroslabs.com">
                    <Button className="w-full" variant="outline">
                      Contact Us
                    </Button>
                  </a>
                ) : (
                  <Link href={`/signup?plan=${plan.name.toLowerCase()}&interval=${annual ? "annual" : "monthly"}`}>
                    <Button className="w-full" variant={plan.popular ? "default" : "outline"}>
                      Start Free Trial
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>

      </section>

      {/* FAQ */}
      <section className="py-16 md:py-24 px-4 bg-muted/30">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold tracking-tight text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {FAQ.map((item) => (
              <div key={item.q} className="bg-background rounded-lg border p-6">
                <h3 className="font-semibold mb-2">{item.q}</h3>
                <p className="text-muted-foreground text-sm">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold tracking-tight mb-4">
            Start tracking today
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Try VitrOS free for 30 days. No credit card required. Includes full access to tissue tracking software,
            lab inventory software, and all platform features.
          </p>
          <Link href="/signup">
            <Button size="lg">Start Free Trial <ArrowRight className="h-4 w-4 ml-1" /></Button>
          </Link>
        </div>
      </section>


    </PublicPage>
  );
}
