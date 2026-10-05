import { PublicPage } from "@/components/public-site";
import { publicPageMetadata } from "@/lib/seo";
import Link from "next/link";
import { ArrowRight, FileText, Scan, ShieldAlert, Clock, BarChart3, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = publicPageMetadata({
  title: "Replace Tissue Culture Spreadsheets with VitrOS",
  description:
    "Move tissue culture records from spreadsheets and paper logs into connected vessel tracking, lineage, media records, and shared lab workflows with VitrOS.",
  path: "/why-vitros",
});

const PAIN_POINTS = [
  {
    icon: FileText,
    problem: "Paper logs and spreadsheets",
    solution: "Digital vessel tracking with barcode scanning",
    detail:
      "Every lab starts on paper or Excel. It works until it doesn't — lost notebooks, unsearchable data, no real-time visibility. VitrOS gives every vessel a digital identity from day one.",
  },
  {
    icon: ShieldAlert,
    problem: "Contamination found too late",
    solution: "Real-time contamination analytics and alerts",
    detail:
      "Separate records can make it difficult to spot contamination patterns. VitrOS tracks contamination by cultivar, location, media batch, and technician — and alerts you when rates spike.",
  },
  {
    icon: Clock,
    problem: "No idea what's coming next week",
    solution: "Demand forecasting and production pipeline",
    detail:
      "When you can't see your pipeline, you can't plan. VitrOS shows you exactly how many vessels are in each stage, projects output weeks ahead, and ties production to customer orders.",
  },
  {
    icon: Layers,
    problem: "Slow, manual data entry",
    solution: "Barcode scanning from your phone",
    detail:
      "Phone-camera and barcode-scanner input connects each vessel to its record. Update cultures at the bench without transcribing the same information into a separate log.",
  },
];

const COMPARISONS = [
  { label: "Spreadsheets", issues: ["Flexible general-purpose records", "Requires a shared file process", "Scanning needs extra tools", "Manual workflow coordination"] },
  { label: "Paper Logs", issues: ["Familiar at the bench", "Physical storage and handoffs", "Manual reporting", "History across separate logs"] },
  { label: "Custom Software", issues: ["Tailored to your requirements", "Needs ongoing maintenance", "Support depends on the team", "Integration work to plan"] },
  { label: "VitrOS", wins: ["Connected culture records", "Phone-based scanning", "Built-in lab analytics", "Shared workflow history"] },
];

export default function WhyVitrOSPage() {
  return (
    <PublicPage>

      {/* Hero */}
      <section className="py-16 md:py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight mb-6">
            Tissue culture records beyond spreadsheets
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Most tissue culture labs rely on paper, Excel, or aging custom software that can&apos;t keep up.
            VitrOS is modern plant propagation automation software designed for how labs actually operate today.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/signup">
              <Button size="lg">Start Free <ArrowRight className="h-4 w-4 ml-1" /></Button>
            </Link>
            <Link href="/demo">
              <Button size="lg" variant="outline">See a Demo</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Pain Points → Solutions */}
      <section className="py-16 md:py-24 px-4 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-center mb-4">
            The Problems We Solve
          </h2>
          <p className="text-muted-foreground text-lg text-center mb-14 max-w-2xl mx-auto">
            Automated plant propagation starts with the right software.
            Connect the record-keeping, quality review, and production planning your team already does.
          </p>
          <div className="space-y-8">
            {PAIN_POINTS.map((p) => (
              <div key={p.problem} className="bg-background rounded-xl border p-6 md:p-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <p.icon className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mb-2">
                      <h3 className="font-semibold text-lg text-muted-foreground">{p.problem}</h3>
                      <ArrowRight className="h-4 w-4 text-primary hidden sm:block" />
                      <h3 className="font-semibold text-lg text-primary">{p.solution}</h3>
                    </div>
                    <p className="text-muted-foreground text-sm leading-relaxed">{p.detail}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="py-16 md:py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-center mb-14">
            How VitrOS Compares
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {COMPARISONS.map((c) => (
              <div
                key={c.label}
                className={`rounded-xl border p-6 ${
                  c.wins ? "border-primary bg-primary/5 ring-1 ring-primary/20" : ""
                }`}
              >
                <h3 className={`font-bold text-lg mb-4 ${c.wins ? "text-primary" : ""}`}>{c.label}</h3>
                <ul className="space-y-2">
                  {(c.issues || c.wins || []).map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm">
                      {c.wins ? (
                        <span className="text-primary mt-0.5">&#10003;</span>
                      ) : (
                        <span className="text-muted-foreground mt-0.5">&#10007;</span>
                      )}
                      <span className={c.wins ? "" : "text-muted-foreground"}>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who It's For */}
      <section className="py-16 md:py-24 px-4 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-center mb-4">
            Who VitrOS Is Built For
          </h2>
          <p className="text-muted-foreground text-lg text-center mb-12 max-w-2xl mx-auto">
            Any lab that propagates plants at scale — whether tissue culture, nursery propagation, or research.
          </p>
          <div className="grid sm:grid-cols-3 gap-6">
            <div className="bg-background rounded-xl border p-6 text-center">
              <Scan className="h-8 w-8 mx-auto mb-3 text-primary" />
              <h3 className="font-semibold mb-2">Tissue Culture Labs</h3>
              <p className="text-muted-foreground text-sm">
                Commercial TC labs running thousands of vessels through multi-stage pipelines.
              </p>
            </div>
            <div className="bg-background rounded-xl border p-6 text-center">
              <BarChart3 className="h-8 w-8 mx-auto mb-3 text-primary" />
              <h3 className="font-semibold mb-2">Large Nurseries</h3>
              <p className="text-muted-foreground text-sm">
                Nursery teams managing tissue culture propagation and the production stages that follow.
              </p>
            </div>
            <div className="bg-background rounded-xl border p-6 text-center">
              <ShieldAlert className="h-8 w-8 mx-auto mb-3 text-primary" />
              <h3 className="font-semibold mb-2">Research Facilities</h3>
              <p className="text-muted-foreground text-sm">
                University and corporate R&D labs that need rigorous tracking and audit trails.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Ready to upgrade from spreadsheets?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Start a workspace and try the vessel, quality, and planning workflows with your team.
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
