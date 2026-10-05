"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { BrandMark } from "@/components/brand-mark";
import styles from "./public-site.module.css";

const links = [["/features", "Features"], ["/why-vitros", "Why VitrOS"], ["/pricing", "Pricing"], ["/blog", "Resources"], ["/demo", "Demo"]];

export function PublicBrand() {
  return <Link href="/" aria-label="VitrOS home" className="inline-flex shrink-0 items-center gap-2.5 rounded-md focus-visible:outline-2 focus-visible:outline-ring">
    <BrandMark className="size-9 shrink-0" />
    <span className="text-xl font-semibold tracking-tight">VitrOS</span>
  </Link>;
}

export function PublicNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  return <header className={styles.header}>
    <a href="#public-content" className={styles.skip}>Skip to content</a>
    <div className={styles.nav}>
      <PublicBrand />
      <nav aria-label="Main navigation" className={styles.desktopNav}>
        {links.map(([href, label]) => <Link key={href} href={href} aria-current={pathname === href ? "page" : undefined}>{label}</Link>)}
      </nav>
      <div className="flex items-center gap-2">
        <div className="hidden sm:block"><ThemeToggle /></div>
        <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex"><Link href="/login">Sign in</Link></Button>
        <Button asChild size="sm"><Link href="/signup">Start free</Link></Button>
        <Button variant="ghost" size="icon" className="lg:hidden size-10" aria-label={open ? "Close navigation" : "Open navigation"} aria-expanded={open} aria-controls="public-mobile-nav" onClick={() => setOpen(!open)}>
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </Button>
      </div>
    </div>
    {open && <nav id="public-mobile-nav" aria-label="Mobile navigation" className={styles.mobileNav} onKeyDown={(event) => { if (event.key === "Escape") { setOpen(false); document.querySelector<HTMLButtonElement>('[aria-controls="public-mobile-nav"]')?.focus(); } }}>
      {[...links, ["/login", "Sign in"]].map(([href, label]) => <Link key={href} href={href} onClick={() => setOpen(false)} aria-current={pathname === href ? "page" : undefined}>{label}</Link>)}
    </nav>}
  </header>;
}

export function PublicFooter() {
  return <footer className={styles.footer}>
    <div className={styles.footerInner}>
      <div><PublicBrand /><p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">A connected workspace for tissue culture labs, from the first explant to the next production run.</p></div>
      <nav aria-label="Footer navigation" className={styles.footerLinks}>
        {links.map(([href, label]) => <Link key={href} href={href}>{label}</Link>)}
        <a href="mailto:support@vitroslabs.com">Contact</a>
      </nav>
    </div>
    <div className={styles.colophon}><span>© {new Date().getFullYear()} VitrOS Labs</span><span>Built for tissue culture. Powered by Caipher.</span></div>
  </footer>;
}

export function PublicPage({ children }: { children: React.ReactNode }) {
  return <div className={styles.site}><PublicNav /><main id="public-content" className={styles.content}>{children}</main><PublicFooter /></div>;
}

export function ProductScreenshot({ src = "/images/product/tissue-culture-dashboard.png", alt, caption, sizes = "(max-width: 767px) calc(100vw - 32px), (max-width: 1199px) calc(100vw - 48px), 1152px" }: { src?: string; alt: string; caption: string; sizes?: string }) {
  return <figure className="min-w-0 overflow-hidden rounded-xl border bg-card">
    <a href={src} target="_blank" rel="noopener noreferrer" aria-label={`Open full-size screenshot: ${alt}`} className="block focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-[-3px]">
      <Image src={src} alt={alt} width={1440} height={1080} sizes={sizes} className="h-auto w-full" />
    </a>
    <figcaption className="border-t px-4 py-3 text-xs leading-relaxed text-muted-foreground">{caption} · Actual VitrOS interface with demonstration data. Open image to inspect.</figcaption>
  </figure>;
}
