import { PublicPage, ProductScreenshot } from "@/components/public-site";
import { publicPageMetadata } from "@/lib/seo";
import Link from "next/link";
import Image from "next/image";
import {
  FlaskConical, Scan, ShieldAlert, BarChart3, Microscope, Users,
  ArrowRight, GitBranch, Bell, Layers, Smartphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = publicPageMetadata({
  title: "Vessel Tracking & Tissue Culture Software Features | VitrOS",
  description:
    "Explore VitrOS tools for vessel tracking, barcode labels, subculture scheduling, media records, contamination review, and tissue culture production planning.",
  path: "/features",
});

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
      "Review contamination patterns and flagged conditions by cultivar, location, media type, and technician to guide your next inspection.",
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
      "Role-based access control with Admin, Manager, Lead Tech, Tech, and Media Maker roles. Shared activity records show who performed recorded lab operations.",
    keywords: "laboratory automation software",
  },
];

const ADDITIONAL_FEATURES = [
  { icon: GitBranch, title: "Lineage Trees", description: "Trace any vessel back to its mother plant through a visual family tree. Full parent-child lineage tracking across generations." },
  { icon: Layers, title: "Batch Operations", description: "Select multiple vessels and advance stages, update health, or dispose in bulk. Review and update your selected vessels together." },
  { icon: Bell, title: "Lab Notifications", description: "Review in-app reminders for due subcultures, overdue stages, and flagged contamination conditions." },
  { icon: Smartphone, title: "Mobile-First Design", description: "Built for the lab floor. Scan barcodes, log health checks, and update vessels from your phone or tablet." },
  { icon: BarChart3, title: "Demand Forecasting", description: "Project vessel output weeks ahead based on your pipeline. Plan production around customer orders and seasonal demand." },
  { icon: ShieldAlert, title: "Activity History", description: "Review recorded activities with who, what, and when. Export reports for client deliverables and internal review." },
];

export default function FeaturesPage() {
  return (
    <PublicPage>

      {/* Hero */}
      <section className="py-16 md:py-24 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="mb-5 flex items-center justify-center gap-2 text-sm font-medium text-primary"><FlaskConical aria-hidden="true" className="size-4" /> Built around the culture lifecycle</p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight mb-6">
            Vessel tracking and tissue culture lab tools
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            VitrOS brings vessel records, lineage, bench work, and production planning into one connected workspace.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Button asChild size="lg"><Link href="/signup">Start free <ArrowRight className="size-4" /></Link></Button>
            <Button asChild size="lg" variant="outline"><Link href="/demo">Explore the demo</Link></Button>
          </div>
          <nav aria-label="Feature views" className="mt-8 flex flex-wrap justify-center gap-2 sm:gap-3">
            {[["#vessel-tracking", "Vessel records"], ["#lineage", "Lineage"], ["#scanning", "Barcode scanning"]].map(([href, label]) => <a key={href} href={href} className="rounded-md border bg-card px-4 py-2.5 text-xs transition-colors hover:border-primary/50 hover:text-primary focus-visible:outline-2 focus-visible:outline-ring sm:text-sm">{label} <span aria-hidden="true">↘</span></a>)}
          </nav>
        </div>
      </section>

      <section id="vessel-tracking" className="scroll-mt-20 border-y bg-muted/30 px-4 py-16 sm:px-6 md:py-24">
        <div className="mx-auto grid max-w-6xl items-center gap-8 lg:grid-cols-[310px_1fr] lg:gap-14">
          <div className="max-w-xl">
            <p className="mb-4 text-xs font-medium tracking-wide text-primary">01 / Vessel records</p>
            <h2 className="text-3xl sm:text-4xl">Every culture has a story. Keep it with the vessel.</h2>
            <p className="mt-5 leading-relaxed text-muted-foreground">See the cultivar, stage, health, location, and activity behind a single culture. Bring the details together in a record your team can use.</p>
            <Link href="/demo" className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-primary">Explore vessel tracking <ArrowRight aria-hidden="true" className="size-4" /></Link>
          </div>
          <ProductScreenshot src="/images/product/vessel-record.png" alt="VitrOS record for vessel TC-2026-0042 with cultivar, production stage, health, location, and next subculture date" caption="Vessel record · TC-2026-0042" sizes="(max-width: 767px) calc(100vw - 32px), (max-width: 1023px) calc(100vw - 48px), 786px" />
        </div>
      </section>

      <section id="lineage" className="scroll-mt-20 border-b px-4 py-16 sm:px-6 md:py-24">
        <div className="mx-auto grid max-w-6xl items-center gap-8 lg:grid-cols-[1fr_310px] lg:gap-14">
          <div className="max-w-xl lg:order-2">
            <p className="mb-4 text-xs font-medium tracking-wide text-primary">02 / Culture lineage</p>
            <h2 className="text-3xl sm:text-4xl">Follow the line.<br />Keep the context.</h2>
            <p className="mt-5 leading-relaxed text-muted-foreground">Trace parent and child vessels across generations. See where a culture came from and follow the records that grew from it.</p>
            <Link href="/demo" className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-primary">Explore culture lineage <ArrowRight aria-hidden="true" className="size-4" /></Link>
          </div>
          <ProductScreenshot src="/images/product/culture-lineage.png" alt="VitrOS lineage tree connecting parent and child culture records across generations" caption="Culture lineage · connected generations" sizes="(max-width: 767px) calc(100vw - 32px), (max-width: 1023px) calc(100vw - 48px), 786px" />
        </div>
      </section>

      <section id="scanning" className="scroll-mt-20 border-b bg-card px-4 py-16 sm:px-6 md:py-24">
        <div className="mx-auto grid max-w-6xl items-center gap-8 lg:grid-cols-[310px_1fr] lg:gap-14">
          <div className="max-w-xl">
            <p className="mb-4 text-xs font-medium tracking-wide text-primary">03 / Tools for the bench</p>
            <h2 className="text-3xl sm:text-4xl">From the barcode<br />to the next step.</h2>
            <p className="mt-5 leading-relaxed text-muted-foreground">Look up a vessel from the bench. Scan its barcode or enter its identifier to bring the record into view.</p>
            <Link href="/demo" className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-primary">Explore the scan workflow <ArrowRight aria-hidden="true" className="size-4" /></Link>
            <figure className="mt-8 flex items-center gap-4 border-t pt-6">
              <a href="/images/product/vessel-label-preview.png" target="_blank" rel="noopener noreferrer" className="w-[105px] shrink-0 overflow-hidden rounded-md border bg-white focus-visible:outline-2 focus-visible:outline-ring" aria-label="Open full-size VitrOS QR label preview for TC-2026-0042">
                <Image src="/images/product/vessel-label-preview.png" alt="VitrOS QR label for TC-2026-0042, Monstera deliciosa, multiplication stage" width={500} height={398} sizes="105px" className="h-auto w-full" />
              </a>
              <figcaption>
                <p className="text-sm font-medium">A label that follows the culture.</p>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">Actual VitrOS label preview.<br />Demonstration data.</p>
                <a href="/images/product/label-printing.png" target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-primary">View label printing <ArrowRight aria-hidden="true" className="size-3" /></a>
              </figcaption>
            </figure>
          </div>
          <ProductScreenshot src="/images/product/vessel-scanning.png" alt="VitrOS Scan Vessel interface showing record TC-2026-0042 and fields to update the culture from the bench" caption="Scan · find a vessel at the bench" sizes="(max-width: 767px) calc(100vw - 32px), (max-width: 1023px) calc(100vw - 48px), 786px" />
        </div>
      </section>

      {/* Core Features */}
      <section className="py-16 md:py-24 px-4 sm:px-6">
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
      <section className="py-16 md:py-24 px-4 sm:px-6 bg-muted/30">
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

      {/* CTA */}
      <section className="py-16 md:py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            See the culture lifecycle,<br />one record at a time.
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Explore with demonstration data, or start your own lab workspace.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Button asChild size="lg"><Link href="/signup">Start free <ArrowRight className="size-4" /></Link></Button>
            <Button asChild size="lg" variant="outline"><Link href="/demo">Explore the demo</Link></Button>
          </div>
        </div>
      </section>


    </PublicPage>
  );
}
