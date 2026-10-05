import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Check, FlaskConical, GitBranch, ScanBarcode, ShieldCheck, CalendarClock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PublicPage, ProductScreenshot } from "@/components/public-site";

const capabilities = [
  { icon: FlaskConical, title: "A record for every vessel", text: "Track cultivar, stage, explants, health, and location from initiation through hardening." },
  { icon: GitBranch, title: "Lineage you can follow", text: "Trace parent and child vessels across generations. Keep clone lines and pathogen test history connected." },
  { icon: ShieldCheck, title: "Quality in context", text: "Record health checks and contamination evidence. Review patterns by cultivar, location, media, and technician." },
  { icon: CalendarClock, title: "Production you can plan", text: "See due subcultures, forecast output, and work backward from customer orders to initiation dates." },
  { icon: ScanBarcode, title: "Tools for the bench", text: "Scan barcodes, create and multiply cultures in batches, and print labels using your browser or Zebra printer." },
  { icon: Users, title: "A connected lab team", text: "Manage roles, record shift notes, and follow an activity history with the person and time behind each operation." },
];

export function LandingPage() {
  return <PublicPage>
    <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 md:py-24 lg:grid-cols-[1.05fr_.95fr] lg:gap-16">
      <div>
        <p className="mb-5 flex items-center gap-2 text-sm font-medium text-primary"><FlaskConical className="size-4" /> Built for tissue culture</p>
        <h1 className="max-w-2xl text-[clamp(2.5rem,5vw,4.25rem)]">Every culture.<br />One connected lab.</h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">Track vessels, follow lineage, and plan the next production run. VitrOS brings your lab’s daily work into one clear workspace.</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild size="lg"><Link href="/signup">Start free <ArrowRight className="size-4" /></Link></Button>
          <Button asChild variant="outline" size="lg"><Link href="/demo">Explore the demo</Link></Button>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">30-day free trial. No credit card to create your workspace.</p>
      </div>
      <figure className="min-w-0">
        <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-muted lg:aspect-[4/4.5]">
          <Image src="/images/homepage/tc-verticals.jpg" alt="Barcode-labeled culture vessels arranged on shelves in a tissue culture production room" fill priority sizes="(max-width: 1023px) 100vw, 520px" className="object-cover" />
        </div>
        <figcaption className="mt-3 text-xs text-muted-foreground">Designed around the cultures, people, and routines of a working lab.</figcaption>
      </figure>
    </section>

    <section id="features" className="border-y bg-muted/30 px-4 py-14 sm:px-6 md:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div className="max-w-xl"><h2 className="text-3xl sm:text-4xl">Know what needs your attention.</h2><p className="mt-4 leading-relaxed text-muted-foreground">Bring your vessel records, culture health, and production pipeline together. Follow the record from today’s work to the next decision.</p></div>
          <Link href="/demo" className="inline-flex shrink-0 items-center gap-2 text-sm font-medium text-primary">Take a closer look <ArrowRight className="size-4" /></Link>
        </div>
        <ProductScreenshot alt="VitrOS dashboard showing vessel counts, subculture reminders, and production stages" caption="VitrOS Today view with illustrative records" />
      </div>
    </section>

    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
      <div className="grid gap-8 border-b pb-10 md:grid-cols-[1fr_1.2fr] md:gap-16">
        <h2 className="text-3xl sm:text-4xl">The whole culture lifecycle,<br className="hidden md:block" /> kept together.</h2>
        <p className="max-w-xl text-lg leading-relaxed text-muted-foreground">Paper logs and separate spreadsheets make it hard to connect a culture to its history. VitrOS keeps the details with the vessel, so your team can find them when they matter.</p>
      </div>
      <div className="grid gap-x-12 sm:grid-cols-2 lg:grid-cols-3">
        {capabilities.map(({ icon: Icon, title, text }) => <div key={title} className="border-b py-8">
          <Icon aria-hidden="true" className="mb-5 size-5 text-primary" /><h3 className="mb-3 text-lg font-semibold">{title}</h3><p className="text-sm leading-7 text-muted-foreground">{text}</p>
        </div>)}
      </div>
      <Button asChild variant="outline" className="mt-8"><Link href="/features">See all features <ArrowRight className="size-4" /></Link></Button>
    </section>

    <section className="border-y bg-card px-4 py-16 sm:px-6 md:py-20">
      <div className="mx-auto grid max-w-6xl items-center gap-10 md:grid-cols-2 md:gap-16">
        <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-muted"><Image src="/images/homepage/pain-02.webp" alt="A technician inspecting a tissue culture vessel for signs of contamination" fill sizes="(max-width: 768px) 100vw, 540px" className="object-cover" /></div>
        <div><h2 className="text-3xl sm:text-4xl">Keep the science<br />close to the work.</h2><p className="mt-5 leading-relaxed text-muted-foreground">Review a health check in the context of its cultivar, media batch, and production history. Give the next technician a record they can follow.</p>
          <ul className="mt-6 space-y-4 text-sm">{["Media recipes, preparation batches, and inventory", "Location capacity and environmental readings", "Stage-linked protocols and activity history", "CSV import and export, reports, and API access"].map(item => <li key={item} className="flex items-start gap-3"><Check className="mt-0.5 size-4 shrink-0 text-primary" />{item}</li>)}</ul>
          <Link href="/why-vitros" className="mt-7 inline-flex items-center gap-2 text-sm font-medium text-primary">Why VitrOS <ArrowRight className="size-4" /></Link>
        </div>
      </div>
    </section>

    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
      <div className="grid gap-10 md:grid-cols-[1fr_1.25fr] md:gap-20">
        <div><h2 className="text-3xl sm:text-4xl">Start with your next culture run.</h2><p className="mt-5 leading-relaxed text-muted-foreground">Set up your facility, bring in your records, and build a repeatable workflow. Keep growing with plans for single-bench labs and larger production teams.</p><Link href="/pricing" className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-primary">Compare plans <ArrowRight className="size-4" /></Link></div>
        <ol className="divide-y border-y">{[["Set up your lab", "Add your facility, growth locations, and first cultivars."], ["Bring in your cultures", "Import your CSV records or scan a vessel barcode to get started."], ["Make the next step clear", "Review due work, log health checks, and follow production through each stage."]].map(([title, text], i) => <li key={title} className="flex gap-5 py-6"><span className="pt-0.5 font-mono text-sm text-muted-foreground">0{i + 1}</span><div><h3 className="font-semibold">{title}</h3><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{text}</p></div></li>)}</ol>
      </div>
    </section>

    <section id="demo" className="border-t bg-primary/5 px-4 py-16 sm:px-6 md:py-20">
      <div className="mx-auto flex max-w-6xl flex-col justify-between gap-8 md:flex-row md:items-center"><div><h2 className="text-3xl sm:text-4xl">Give your cultures a connected home.</h2><p className="mt-4 text-muted-foreground">Explore with demonstration data, or start your own lab workspace.</p></div><div className="flex shrink-0 flex-wrap gap-3"><Button asChild size="lg"><Link href="/signup">Start free <ArrowRight className="size-4" /></Link></Button><Button asChild variant="outline" size="lg"><Link href="/demo">See the demo</Link></Button></div></div>
    </section>
  </PublicPage>;
}
