import { PublicPage, ProductScreenshot } from "@/components/public-site";
import type { Metadata } from "next";
import Link from "next/link";
import {
  FlaskConical, Scan, ShieldAlert, BarChart3, Microscope, Users,
  ArrowRight, GitBranch, Bell, Layers, Smartphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Features | Vessel Tracking & Lab Automation | VitrOS",
  description:
    "Track vessels from initiation to ship-out, automate subculture scheduling, scan barcodes at the bench, and monitor contamination—all in one tissue culture platform.",
  keywords: [
    "lab tracking software",
    "laboratory automation software",
    "vessel management platform",
    "culture lifecycle platform",
    "plant lab command center",
    "tissue culture workflow automation",
  ],
  openGraph: {
    title: "Features | Vessel Tracking & Lab Automation | VitrOS",
    description:
      "Track vessels from initiation to ship-out, automate subculture scheduling, scan barcodes at the bench, and monitor contamination—all in one tissue culture platform.",
  },
};

const CORE_FEATURES = [
  {
    icon: FlaskConical,
    title: "Vessel-Level Tracking",
    description:
      "Every vessel gets a unique ID from initiation through subculture, rooting, acclimation, and ship-out. Know exactly where every culture is in your pipeline at all times.",
    keywords: "vessel management platform",
  },
  {
    icon: Scan,
    title: "Barcode Scanning",
    description:
      "Scan vessel barcodes with your phone camera — no dedicated hardware required. Look up a record, log a health check, or start the next culture run from the bench.",
    keywords: "lab tracking software",
  },
  {
    icon: ShieldAlert,
    title: "Contamination Analytics",
    description:
      "Spot contamination trends by cultivar, location, media type, and technician before they spread. Real-time alerts when contamination rates spike above your thresholds.",
    keywords: "contamination tracking",
  },
  {
    icon: BarChart3,
    title: "Production Pipeline",
    description:
      "See every stage of production at a glance. Know exactly how many vessels are in initiation, multiplication, rooting, and acclimation — broken down by cultivar.",
    keywords: "culture lifecycle platform",
  },
  {
    icon: Microscope,
    title: "Media Management",
    description:
      "Track media recipes, prep schedules, batch quality, and inventory levels. Assign media to vessels and trace any issues back to the batch.",
    keywords: "lab inventory software",
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description:
      "Role-based access control with Admin, Manager, Lead Tech, Tech, and Media Maker roles. Full activity audit logs for every action every team member takes.",
    keywords: "laboratory automation software",
  },
];

const ADDITIONAL_FEATURES = [
  { icon: GitBranch, title: "Lineage Trees", description: "Trace any vessel back to its mother plant through a visual family tree. Full parent-child lineage tracking across generations." },
  { icon: Layers, title: "Batch Operations", description: "Select multiple vessels and advance stages, update health, or dispose in bulk. Review and update your selected vessels together." },
  { icon: Bell, title: "Smart Notifications", description: "Get alerted when vessels are due for subculture, when contamination spikes, or when stages are overdue." },
  { icon: Smartphone, title: "Mobile-First Design", description: "Built for the lab floor. Scan barcodes, log health checks, and update vessels from your phone or tablet." },
  { icon: BarChart3, title: "Demand Forecasting", description: "Project vessel output weeks ahead based on your pipeline. Plan production around customer orders and seasonal demand." },
  { icon: ShieldAlert, title: "Full Audit Trail", description: "Every action logged with who, what, and when. Exportable reports for compliance, client deliverables, and internal review." },
];

export default function FeaturesPage() {
  return (
    <PublicPage>

      {/* Hero */}
      <section className="py-16 md:py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight mb-6">
            Every Tool Your Tissue Culture Lab Needs
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            VitrOS is a vessel management platform that replaces spreadsheets, paper logs, and disconnected tools
            with one integrated laboratory automation software built for tissue culture.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/signup">
              <Button size="lg">Start Free <ArrowRight className="h-4 w-4 ml-1" /></Button>
            </Link>
            <Link href="/demo">
              <Button size="lg" variant="outline">Get a Demo</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section className="py-16 md:py-24 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-center mb-4">
            Core Platform Capabilities
          </h2>
          <p className="text-muted-foreground text-lg text-center mb-14 max-w-2xl mx-auto">
            Lab tracking software designed for every step of the tissue culture workflow — from initiation to ship-out.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {CORE_FEATURES.map((f) => (
              <div key={f.title} className="bg-background rounded-xl border p-6">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <f.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Features */}
      <section className="py-16 md:py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-center mb-4">
            And That&apos;s Just the Start
          </h2>
          <p className="text-muted-foreground text-lg text-center mb-14 max-w-2xl mx-auto">
            Tissue culture workflow automation features that grow with your lab.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {ADDITIONAL_FEATURES.map((f) => (
              <div key={f.title} className="flex gap-4 p-4">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  <f.icon className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{f.title}</h3>
                  <p className="text-muted-foreground text-sm">{f.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-14 md:py-20 bg-muted/30"><div className="max-w-6xl mx-auto"><div className="max-w-xl mb-8"><h2 className="text-3xl mb-4">Your workflow, connected.</h2><p className="text-muted-foreground">Start with a culture record. See how its health, production stage, and next transfer fit into the whole lab.</p></div><ProductScreenshot alt="VitrOS demonstration dashboard showing culture production stages and due work" caption="The VitrOS workspace" /></div></section>

      {/* CTA */}
      <section className="py-16 md:py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Ready to see lifecycle tracking for your tissue lab?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Start free or get a personalized demo of every feature.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/signup">
              <Button size="lg">Start Free <ArrowRight className="h-4 w-4 ml-1" /></Button>
            </Link>
            <Link href="/demo">
              <Button size="lg" variant="outline">Get a Demo</Button>
            </Link>
          </div>
        </div>
      </section>


    </PublicPage>
  );
}
