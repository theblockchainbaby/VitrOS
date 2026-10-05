import { PublicPage } from "@/components/public-site";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, Clock, Scan, BarChart3, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Get a Demo | VitrOS Tissue Culture Lab Software",
  description:
    "See how VitrOS replaces spreadsheets and legacy systems with modern vessel tracking, barcode scanning, and real-time dashboards. Explore the demo or arrange a guided walkthrough.",
  keywords: [
    "lab sample tracking system",
    "tissue culture tools",
    "plant lab OS",
    "tissue culture lab software demo",
    "lab management demo",
  ],
  openGraph: {
    title: "Get a Demo | VitrOS Tissue Culture Lab Software",
    description:
      "See how VitrOS replaces spreadsheets and legacy systems with modern vessel tracking, barcode scanning, and real-time dashboards.",
  },
};

const DEMO_HIGHLIGHTS = [
  {
    icon: Scan,
    title: "Barcode Scanning",
    description: "See how a phone-camera scan opens a vessel record for creation, review, or update.",
  },
  {
    icon: BarChart3,
    title: "Production Pipeline",
    description: "See your entire operation in one view — every stage, every cultivar, every vessel accounted for.",
  },
  {
    icon: ShieldAlert,
    title: "Contamination Tracking",
    description: "Real-time contamination analytics that spot trends before they become outbreaks.",
  },
  {
    icon: Clock,
    title: "Demand Forecasting",
    description: "Project vessel output weeks ahead based on your actual pipeline data and order schedule.",
  },
];

export default function DemoPage() {
  return (
    <PublicPage>

      {/* Hero */}
      <section className="py-16 md:py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight mb-6">
            See VitrOS in Action
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            VitrOS is the lab sample tracking system that replaces spreadsheets, paper logs, and legacy
            software with modern tissue culture tools built for how labs actually work.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="#try-demo">
              <Button size="lg" className="w-full sm:w-auto">
                Explore the demo <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
            <a href="mailto:support@vitroslabs.com?subject=VitrOS Demo Request">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Request a walkthrough
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Video Walkthrough */}
      <section className="py-16 md:py-24 px-4 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold tracking-tight text-center mb-4">
            Watch VitrOS in Action
          </h2>
          <p className="text-muted-foreground text-lg text-center mb-10 max-w-2xl mx-auto">
            See how tissue culture labs use VitrOS to track vessels, manage cultivars, and monitor contamination — all in under two minutes.
          </p>
          <div className="aspect-video rounded-xl overflow-hidden border">
            <iframe
              width="100%"
              height="100%"
              src="https://www.youtube.com/embed/SZJQchXmCtU"
              title="VitrOS Demo — Tissue Culture Lab Management Software"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              loading="lazy"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
        </div>
      </section>

      {/* Try It Now */}
      <section id="try-demo" className="py-16 md:py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold tracking-tight text-center mb-4">
            Try the Demo Yourself
          </h2>
          <p className="text-muted-foreground text-lg text-center mb-10 max-w-2xl mx-auto">
            No signup required. Log into our demo environment and explore the full plant lab OS
            with demonstration data. Open Demo fills in the shared credentials below.
          </p>
          <div className="bg-card rounded-xl border p-5 sm:p-8 max-w-lg mx-auto">
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-1">Demo Login</p>
                <code className="text-sm bg-muted px-3 py-2 rounded block">demo@vitros.app</code>
              </div>
              <div>
                <p className="text-sm font-medium mb-1">Password</p>
                <code className="text-sm bg-muted px-3 py-2 rounded block">demo1234</code>
              </div>
              <div>
                <p className="text-sm font-medium mb-1">Quick PIN</p>
                <code className="text-sm bg-muted px-3 py-2 rounded block">0000</code>
              </div>
              <Link href="/login?demo=true" className="block mt-6">
                <Button className="w-full">Open Demo <ArrowRight className="h-4 w-4 ml-1" /></Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* What You'll See */}
      <section className="py-16 md:py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold tracking-tight text-center mb-4">
            What You&apos;ll See in the Demo
          </h2>
          <p className="text-muted-foreground text-lg text-center mb-14 max-w-2xl mx-auto">
            A fully loaded lab sample tracking system with real cultivar data, vessel pipelines, and analytics.
          </p>
          <div className="grid sm:grid-cols-2 gap-8">
            {DEMO_HIGHLIGHTS.map((h) => (
              <div key={h.title} className="flex gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <h.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">{h.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{h.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Demo CTA */}
      <section className="py-16 md:py-24 px-4 bg-primary text-primary-foreground">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Want a Personalized Walkthrough?
          </h2>
          <p className="text-lg opacity-90 mb-4">
            We&apos;ll set up a demo environment with your cultivars, your stages, and your data.
            See exactly how VitrOS fits your operation.
          </p>
          <ul className="inline-flex flex-col gap-2 text-left mb-8">
            <li className="flex items-center gap-2"><Check className="h-4 w-4" /> 30-minute live walkthrough</li>
            <li className="flex items-center gap-2"><Check className="h-4 w-4" /> Your cultivars pre-loaded</li>
            <li className="flex items-center gap-2"><Check className="h-4 w-4" /> No commitment required</li>
          </ul>
          <div>
            <a href="mailto:support@vitroslabs.com?subject=VitrOS Demo Request&body=Hi, I'd like to schedule a personalized demo of VitrOS for my lab.">
              <Button size="lg" variant="secondary">
                Schedule a Demo <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </a>
          </div>
        </div>
      </section>


    </PublicPage>
  );
}
