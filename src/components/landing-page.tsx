"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, type CSSProperties } from "react";

// VitrOS homepage — Variant H (photo-led, dark Anduril school, real customer photos)
// Origin: /Users/york/Documents/VitrOS_Homepage_Redesign_Brief_20260605/variant_H_photo_led.html
// Ported to Next.js 2026-06-08. All styles scoped under .lp-root.

const HOMEPAGE_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap');

.lp-root {
  --color-paper:      oklch(8%  0.008 240);
  --color-paper-2:    oklch(12% 0.010 240);
  --color-paper-3:    oklch(16% 0.012 240);
  --color-rule:       oklch(26% 0.012 240);
  --color-rule-soft:  oklch(20% 0.010 240);
  --color-ink:        oklch(96% 0.005 240);
  --color-ink-2:      oklch(80% 0.008 240);
  --color-muted:      oklch(64% 0.010 240);
  --color-faint:      oklch(48% 0.010 240);
  --color-accent:     oklch(72% 0.21 138);
  --color-accent-ink: oklch(12% 0.008 240);
  --color-signal-ok:  oklch(72% 0.21 138);
  --color-signal-warn:oklch(78% 0.16 70);
  --color-signal-bad: oklch(70% 0.20 25);
  --color-cyan:       oklch(82% 0.14 200);
  --color-focus:      oklch(82% 0.20 138);

  --font-display: "Geist", ui-sans-serif, system-ui, sans-serif;
  --font-body:    "Geist", ui-sans-serif, system-ui, sans-serif;
  --font-mono:    "JetBrains Mono", ui-monospace, "SF Mono", Menlo, monospace;

  --text-xs:    0.6875rem;
  --text-sm:    0.8125rem;
  --text-base:  1rem;
  --text-md:    1.125rem;
  --text-lg:    1.375rem;
  --text-xl:    1.75rem;
  --text-2xl:   2.25rem;
  --text-display-s: clamp(2.25rem, 4vw + 0.75rem, 3.5rem);
  --text-display:   clamp(2.5rem, 5.5vw + 0.5rem, 5rem);

  --space-2xs: 0.25rem;
  --space-xs:  0.5rem;
  --space-sm:  0.75rem;
  --space-md:  1rem;
  --space-lg:  1.5rem;
  --space-xl:  2.5rem;
  --space-2xl: 4rem;
  --space-3xl: 6rem;
  --space-4xl: 9rem;

  --rule-hair: 1px;
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in:  cubic-bezier(0.7, 0, 0.84, 0);
  --dur-short: 220ms;
  --dur-long: 420ms;

  --z-sticky-nav: 300;
  --page-gutter: clamp(1.5rem, 4.5vw, 4rem);

  background: var(--color-paper);
  color: var(--color-ink);
  font-family: var(--font-body);
  font-size: var(--text-base);
  font-weight: 400;
  line-height: 1.55;
  -webkit-font-smoothing: antialiased;
  overflow-x: clip;
}
.lp-root *, .lp-root *::before, .lp-root *::after { box-sizing: border-box; }
.lp-root a { color: inherit; text-decoration: none; }
.lp-root img { display: block; max-width: 100%; }
.lp-root h1, .lp-root h2, .lp-root h3 { margin: 0; font-weight: 600; letter-spacing: -0.022em; overflow-wrap: anywhere; min-width: 0; }
.lp-root p { margin: 0; }
.lp-root .mono { font-family: var(--font-mono); font-feature-settings: "tnum" 1; letter-spacing: -0.005em; }
.lp-root .tnum { font-variant-numeric: tabular-nums; }

.lp-root .nav {
  position: fixed; inset: 0 0 auto 0;
  display: flex; justify-content: space-between; align-items: center;
  padding: var(--space-md) var(--page-gutter);
  z-index: var(--z-sticky-nav);
  background: linear-gradient(to bottom, color-mix(in oklch, var(--color-paper) 80%, transparent), transparent);
  transition: background-color var(--dur-short) var(--ease-out);
}
.lp-root .nav--scrolled {
  background: color-mix(in oklch, var(--color-paper) 88%, transparent);
  backdrop-filter: blur(12px) saturate(140%);
  -webkit-backdrop-filter: blur(12px) saturate(140%);
  border-bottom: var(--rule-hair) solid var(--color-rule-soft);
}
.lp-root .nav__brand {
  display: inline-flex; align-items: center; gap: 0.55rem;
  font-family: var(--font-mono); font-size: var(--text-sm); font-weight: 500;
  letter-spacing: 0.06em; text-transform: uppercase; color: var(--color-ink);
}
.lp-root .nav__brand-mark {
  height: 60px; width: auto;
  object-fit: contain; display: block;
  filter: invert(1) hue-rotate(180deg);
}
.lp-root .nav__right { display: flex; align-items: center; gap: var(--space-md); }
.lp-root .nav__link {
  display: none;
  font-size: var(--text-sm);
  color: var(--color-ink-2);
  padding: 0.4rem 0.6rem;
  border-radius: var(--radius-sm);
  transition: color var(--dur-short) var(--ease-out);
}
.lp-root .nav__link:hover { color: var(--color-ink); }
@media (min-width: 56rem) { .lp-root .nav__link { display: inline-flex; } }
.lp-root .nav__cta {
  display: inline-flex; align-items: center; gap: 0.4rem;
  padding: 0.5rem 0.95rem; min-height: 36px; line-height: 1;
  font-size: var(--text-sm); font-weight: 500; color: var(--color-ink);
  background: color-mix(in oklch, var(--color-paper) 50%, transparent);
  border: var(--rule-hair) solid color-mix(in oklch, var(--color-ink) 30%, transparent);
  border-radius: var(--radius-sm); white-space: nowrap;
  backdrop-filter: blur(8px);
  transition: border-color var(--dur-short) var(--ease-out), color var(--dur-short) var(--ease-out), background-color var(--dur-short) var(--ease-out);
}
.lp-root .nav__cta:hover { border-color: var(--color-accent); color: var(--color-accent); }
.lp-root .nav__cta:focus-visible { outline: 2px solid var(--color-focus); outline-offset: 2px; }

.lp-root .btn {
  display: inline-flex; align-items: center; gap: 0.4rem;
  padding: 0.85rem 1.25rem; min-height: 44px; line-height: 1;
  font-size: var(--text-sm); font-weight: 500;
  border-radius: var(--radius-sm); white-space: nowrap;
  transition: transform var(--dur-short) var(--ease-out), background-color var(--dur-short) var(--ease-out), border-color var(--dur-short) var(--ease-out);
}
.lp-root .btn--primary { background: var(--color-accent); color: var(--color-accent-ink); }
.lp-root .btn--primary:hover { background: color-mix(in oklch, var(--color-accent) 88%, white); transform: translateY(-1px); }
.lp-root .btn--primary:active { transform: translateY(0); }
.lp-root .btn--ghost {
  background: color-mix(in oklch, var(--color-paper) 30%, transparent);
  color: var(--color-ink);
  border: var(--rule-hair) solid color-mix(in oklch, var(--color-ink) 25%, transparent);
  backdrop-filter: blur(8px);
}
.lp-root .btn--ghost:hover { border-color: var(--color-accent); color: var(--color-accent); transform: translateY(-1px); }
.lp-root .btn--ghost:active { transform: translateY(0); }
.lp-root .btn:focus-visible { outline: 2px solid var(--color-focus); outline-offset: 2px; }

.lp-root .hero {
  position: relative;
  min-height: clamp(78vh, 92dvh, 100dvh);
  display: grid; align-content: end;
  padding: clamp(5rem, 10vh, 8rem) var(--page-gutter) clamp(7rem, 14vh, 11rem);
  overflow: hidden; isolation: isolate;
  border-bottom: var(--rule-hair) solid var(--color-rule-soft);
}
.lp-root .hero__bg { object-fit: cover; z-index: -2; filter: saturate(0.85) brightness(0.65); }
.lp-root .hero__scrim {
  position: absolute; inset: 0; z-index: -1;
  background:
    linear-gradient(to top, var(--color-paper) 5%, color-mix(in oklch, var(--color-paper) 55%, transparent) 35%, transparent 65%),
    linear-gradient(to right, color-mix(in oklch, var(--color-paper) 80%, transparent) 0%, color-mix(in oklch, var(--color-paper) 35%, transparent) 45%, transparent 75%);
}
.lp-root .hero__body { max-width: 60rem; }
.lp-root .hero__eyebrow {
  display: inline-flex; align-items: center; gap: 0.5rem;
  margin-bottom: var(--space-xl); padding: 0.3rem 0.7rem;
  font-family: var(--font-mono); font-size: var(--text-xs); font-weight: 500;
  letter-spacing: 0.1em; text-transform: uppercase; color: var(--color-ink);
  background: color-mix(in oklch, var(--color-paper) 60%, transparent);
  border: var(--rule-hair) solid color-mix(in oklch, var(--color-ink) 18%, transparent);
  border-radius: 999px; backdrop-filter: blur(8px);
}
.lp-root .hero__eyebrow::before {
  content: ""; width: 6px; height: 6px;
  background: var(--color-accent); border-radius: 50%;
  box-shadow: 0 0 0 3px color-mix(in oklch, var(--color-accent) 22%, transparent);
}
.lp-root .hero__display {
  font-family: var(--font-display); font-size: var(--text-display); font-weight: 600;
  line-height: 1.02; letter-spacing: -0.032em; color: var(--color-ink);
  margin-bottom: var(--space-lg); max-width: 22ch; text-wrap: balance;
}
.lp-root .hero__lede {
  font-size: var(--text-lg); line-height: 1.5; color: var(--color-ink-2);
  max-width: 46ch; margin-bottom: var(--space-xl);
}
.lp-root .hero__cta { display: flex; flex-wrap: wrap; gap: var(--space-md); align-items: center; }
.lp-root .hero__cta-note {
  margin-top: var(--space-md);
  font-family: var(--font-mono); font-size: var(--text-xs);
  letter-spacing: 0.06em; color: var(--color-ink-2);
}
.lp-root .hero__caption {
  position: absolute; bottom: var(--space-md); right: var(--page-gutter);
  font-family: var(--font-mono); font-size: var(--text-xs);
  letter-spacing: 0.04em; color: color-mix(in oklch, var(--color-ink) 60%, transparent);
}

.lp-root .scale {
  display: grid; grid-template-columns: repeat(3, minmax(0, 1fr));
  border-bottom: var(--rule-hair) solid var(--color-rule-soft);
  background: var(--color-paper);
}
.lp-root .scale__cell {
  padding: var(--space-xl) var(--page-gutter);
  border-right: var(--rule-hair) solid var(--color-rule-soft);
}
.lp-root .scale__cell:last-child { border-right: 0; }
.lp-root .scale__n {
  font-family: var(--font-mono); font-size: clamp(1.5rem, 2.8vw, 2.25rem);
  font-weight: 500; line-height: 1; letter-spacing: -0.025em;
  color: var(--color-ink); font-variant-numeric: tabular-nums;
  margin-bottom: var(--space-sm);
}
.lp-root .scale__l {
  font-family: var(--font-mono); font-size: var(--text-xs);
  letter-spacing: 0.08em; text-transform: uppercase; color: var(--color-faint);
}
@media (max-width: 56rem) {
  .lp-root .scale { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .lp-root .scale__cell:nth-child(2n) { border-right: 0; }
  .lp-root .scale__cell:nth-child(-n+2) { border-bottom: var(--rule-hair) solid var(--color-rule-soft); }
}

.lp-root .pain { padding-block: var(--space-3xl); border-bottom: var(--rule-hair) solid var(--color-rule-soft); }
.lp-root .pain__inner { max-width: 90rem; margin: 0 auto; padding-inline: var(--page-gutter); }
.lp-root .pain__head { max-width: 50rem; margin-bottom: var(--space-2xl); }
.lp-root .pain__kicker {
  font-family: var(--font-mono); font-size: var(--text-xs); font-weight: 500;
  letter-spacing: 0.1em; text-transform: uppercase; color: var(--color-accent);
  margin-bottom: var(--space-md);
}
.lp-root .pain__title {
  font-family: var(--font-display); font-size: clamp(1.875rem, 3.2vw + 0.5rem, 2.625rem);
  font-weight: 600; line-height: 1.08; letter-spacing: -0.022em; color: var(--color-ink);
  max-width: 18ch; margin-bottom: var(--space-md);
}
.lp-root .pain__lede { font-size: var(--text-md); line-height: 1.55; color: var(--color-ink-2); max-width: 52ch; }
.lp-root .pain__grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: var(--space-md); }
.lp-root .pcard {
  padding: var(--space-lg);
  background: var(--color-paper-2);
  border: var(--rule-hair) solid var(--color-rule);
  border-radius: var(--radius-md);
}
.lp-root .pcard__mark {
  width: 32px; height: 32px; display: grid; place-content: center;
  background: color-mix(in oklch, var(--color-signal-bad) 20%, transparent);
  color: var(--color-signal-bad);
  font-family: var(--font-mono); font-size: var(--text-md);
  border-radius: var(--radius-sm);
  margin-bottom: var(--space-md);
}
.lp-root .pcard__title {
  font-family: var(--font-display); font-size: var(--text-md); font-weight: 600;
  letter-spacing: -0.018em; color: var(--color-ink); margin-bottom: var(--space-sm);
}
.lp-root .pcard__text { font-size: var(--text-sm); line-height: 1.55; color: var(--color-ink-2); }
@media (max-width: 56rem) { .lp-root .pain__grid { grid-template-columns: 1fr; } }

.lp-root .anchor { padding-block: var(--space-3xl); border-bottom: var(--rule-hair) solid var(--color-rule-soft); }
.lp-root .anchor__inner {
  max-width: 90rem; margin: 0 auto; padding-inline: var(--page-gutter);
  display: grid; grid-template-columns: minmax(0, 4fr) minmax(0, 7fr);
  gap: var(--space-2xl); align-items: center;
}
.lp-root .anchor__kicker {
  font-family: var(--font-mono); font-size: var(--text-xs); font-weight: 500;
  letter-spacing: 0.1em; text-transform: uppercase; color: var(--color-accent);
  margin-bottom: var(--space-md);
}
.lp-root .anchor__title {
  font-family: var(--font-display); font-size: clamp(1.75rem, 3vw + 0.5rem, 2.5rem);
  font-weight: 600; line-height: 1.1; letter-spacing: -0.022em; color: var(--color-ink);
  max-width: 18ch; margin-bottom: var(--space-md);
}
.lp-root .anchor__text {
  font-size: var(--text-md); line-height: 1.55; color: var(--color-ink-2);
  max-width: 48ch; margin-bottom: var(--space-lg);
}
.lp-root .anchor__meta {
  display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-md);
  padding-top: var(--space-md); border-top: var(--rule-hair) solid var(--color-rule-soft);
  font-family: var(--font-mono); font-size: var(--text-xs); letter-spacing: 0.04em;
}
.lp-root .anchor__meta dt {
  text-transform: uppercase; color: var(--color-faint);
  letter-spacing: 0.08em; margin-bottom: var(--space-2xs);
}
.lp-root .anchor__meta dd { margin: 0; color: var(--color-ink-2); }
.lp-root .anchor__figure { margin: 0; position: relative; }
.lp-root .anchor__img-wrap {
  position: relative; width: 100%; aspect-ratio: 3 / 2;
  border-radius: var(--radius-md); overflow: hidden;
  border: var(--rule-hair) solid var(--color-rule);
}
.lp-root .anchor__img-wrap img { object-fit: cover; }
.lp-root .anchor__cap {
  font-family: var(--font-mono); font-size: var(--text-xs);
  letter-spacing: 0.04em; color: var(--color-faint);
  margin-top: var(--space-sm);
  display: flex; justify-content: space-between; flex-wrap: wrap; gap: var(--space-sm);
}
@media (max-width: 56rem) { .lp-root .anchor__inner { grid-template-columns: 1fr; gap: var(--space-xl); } }

.lp-root .workbench { padding-block: var(--space-3xl); border-bottom: var(--rule-hair) solid var(--color-rule-soft); }
.lp-root .workbench__inner { max-width: 90rem; margin: 0 auto; padding-inline: var(--page-gutter); }
.lp-root .workbench__head { margin-bottom: var(--space-2xl); max-width: 60rem; }
.lp-root .workbench__title {
  font-family: var(--font-display); font-size: clamp(1.875rem, 3.2vw + 0.5rem, 2.625rem);
  font-weight: 600; line-height: 1.08; letter-spacing: -0.022em; color: var(--color-ink);
  max-width: 18ch; margin-bottom: var(--space-md);
}
.lp-root .workbench__lede { font-size: var(--text-md); line-height: 1.55; color: var(--color-ink-2); max-width: 56ch; }
.lp-root .feature {
  display: grid; grid-template-columns: minmax(0, 5fr) minmax(0, 6fr);
  gap: var(--space-2xl); align-items: center;
  padding-block: var(--space-2xl);
  border-top: var(--rule-hair) solid var(--color-rule-soft);
}
.lp-root .feature:first-of-type { border-top: 0; }
.lp-root .feature--reverse .feature__copy { order: 2; }
.lp-root .feature__copy { max-width: 36rem; }
.lp-root .feature__title {
  font-family: var(--font-display); font-size: clamp(1.5rem, 2.4vw + 0.5rem, 2rem);
  font-weight: 600; line-height: 1.1; letter-spacing: -0.022em; color: var(--color-ink);
  max-width: 18ch; margin-bottom: var(--space-md);
}
.lp-root .feature__text {
  font-size: var(--text-md); line-height: 1.6; color: var(--color-ink-2);
  margin-bottom: var(--space-lg); max-width: 48ch;
}
.lp-root .feature__meta {
  display: flex; flex-wrap: wrap; gap: var(--space-lg);
  font-family: var(--font-mono); font-size: var(--text-xs);
  letter-spacing: 0.06em; text-transform: uppercase; color: var(--color-faint);
}
.lp-root .feature__meta b { color: var(--color-ink-2); font-weight: 500; margin-right: 0.4rem; }
.lp-root .surface {
  background: var(--color-paper-2);
  border: var(--rule-hair) solid var(--color-rule);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  position: relative; overflow: hidden;
}
.lp-root .surface__label {
  display: flex; justify-content: space-between; align-items: center;
  font-family: var(--font-mono); font-size: var(--text-xs);
  letter-spacing: 0.08em; text-transform: uppercase;
  color: var(--color-faint); margin-bottom: var(--space-md);
}
.lp-root .surface__label .dot { display: inline-flex; align-items: center; gap: 0.4rem; color: var(--color-signal-ok); }
.lp-root .surface__label .dot::before {
  content: ""; width: 6px; height: 6px;
  background: currentColor; border-radius: 50%;
  box-shadow: 0 0 0 3px color-mix(in oklch, currentColor 18%, transparent);
}
@media (max-width: 56rem) {
  .lp-root .feature { grid-template-columns: 1fr; gap: var(--space-xl); padding-block: var(--space-2xl); }
  .lp-root .feature--reverse .feature__copy { order: 0; }
}

.lp-root .shelf {
  display: grid; gap: var(--space-sm);
  padding: var(--space-md) var(--space-md) var(--space-sm);
  background: var(--color-paper);
  border-radius: var(--radius-md);
  border: var(--rule-hair) solid var(--color-rule-soft);
}
.lp-root .shelf__colhead {
  display: grid; grid-template-columns: 1.4rem 1fr;
  gap: var(--space-sm); align-items: center;
  padding-bottom: var(--space-xs);
  border-bottom: var(--rule-hair) solid var(--color-rule-soft);
}
.lp-root .shelf__colhead-nums { display: grid; grid-template-columns: repeat(8, minmax(0, 1fr)); gap: 4px; }
.lp-root .shelf__colhead-nums span {
  font-family: var(--font-mono); font-size: 10px; text-align: center;
  color: var(--color-faint); letter-spacing: 0.04em;
}
.lp-root .shelf__row { display: grid; grid-template-columns: 1.4rem 1fr; gap: var(--space-sm); align-items: center; }
.lp-root .shelf__rowlabel {
  font-family: var(--font-mono); font-size: var(--text-xs);
  font-weight: 500; color: var(--color-ink-2);
  letter-spacing: 0.04em; text-align: right;
}
.lp-root .shelf__slots { display: grid; grid-template-columns: repeat(8, minmax(0, 1fr)); gap: 4px; }
.lp-root .vessel {
  display: grid; gap: 2px; justify-items: stretch;
  position: relative; aspect-ratio: 1 / 1.18;
}
.lp-root .vessel__jar { width: 100%; height: auto; display: block; }
.lp-root .vessel__rim { fill: var(--color-paper-2); stroke: var(--color-rule); stroke-width: 1; }
.lp-root .vessel__contents {
  fill: color-mix(in oklch, var(--color-signal-ok) 55%, var(--color-paper-3));
  transform-origin: center; transform-box: fill-box;
  animation: vessel-ok-breathe 5s ease-in-out infinite;
  animation-delay: calc(var(--i, 0) * -130ms);
}
.lp-root .vessel--cyan .vessel__contents {
  fill: color-mix(in oklch, var(--color-cyan) 55%, var(--color-paper-3));
  animation: vessel-cyan-breathe 6s ease-in-out infinite;
  animation-delay: calc(var(--i, 0) * -160ms);
}
.lp-root .vessel--warn .vessel__contents {
  fill: color-mix(in oklch, var(--color-signal-warn) 65%, var(--color-paper-3));
  animation: vessel-warn-pulse 4s ease-in-out infinite;
}
.lp-root .vessel--warn .vessel__rim { stroke: color-mix(in oklch, var(--color-signal-warn) 50%, var(--color-rule)); }
.lp-root .vessel--bad .vessel__rim {
  stroke: var(--color-signal-bad);
  fill: color-mix(in oklch, var(--color-signal-bad) 12%, var(--color-paper-2));
  animation: vessel-bad-alert 6s ease-out infinite;
}
.lp-root .vessel--bad .vessel__contents {
  fill: color-mix(in oklch, var(--color-signal-bad) 70%, var(--color-paper-3));
  animation: vessel-bad-alert 6s ease-out infinite;
}
.lp-root .vessel--empty .vessel__rim {
  stroke: var(--color-rule-soft); fill: transparent;
  stroke-dasharray: 2 2;
}
.lp-root .vessel--empty .vessel__contents { display: none; }
.lp-root .vessel__id {
  font-family: var(--font-mono); font-size: 9px;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.01em; text-align: center; color: var(--color-faint);
}
.lp-root .vessel--bad .vessel__id { color: var(--color-signal-bad); }
.lp-root .vessel--empty .vessel__id { color: var(--color-rule); }
@keyframes vessel-ok-breathe { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.82; transform: scale(0.95); } }
@keyframes vessel-cyan-breathe { 0%, 100% { opacity: 0.88; transform: scale(0.96); } 50% { opacity: 1; transform: scale(1.02); } }
@keyframes vessel-warn-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } }
@keyframes vessel-bad-alert { 0%, 55%, 100% { opacity: 1; } 58% { opacity: 0.35; } 62% { opacity: 1; } 66% { opacity: 0.35; } 70% { opacity: 1; } }

.lp-root .lineage { width: 100%; height: auto; }
.lp-root .lineage line, .lp-root .lineage path { stroke: var(--color-rule); stroke-width: 1; fill: none; }
.lp-root .lineage .branch--active {
  stroke: var(--color-accent); stroke-width: 1.5;
  stroke-dasharray: 80; stroke-dashoffset: 80;
  animation: lineage-trace 5s cubic-bezier(0.65, 0, 0.35, 1) infinite;
}
.lp-root .lineage .branch--active:nth-of-type(8) { animation-delay: 0.0s; }
.lp-root .lineage .branch--active:nth-of-type(9) { animation-delay: 0.4s; }
.lp-root .lineage .branch--active:nth-of-type(10) { animation-delay: 0.8s; }
.lp-root .lineage .node { fill: var(--color-paper-3); stroke: var(--color-rule); stroke-width: 1; }
.lp-root .lineage .node--active {
  fill: var(--color-accent); stroke: var(--color-accent);
  transform-origin: center; transform-box: fill-box;
  animation: lineage-node-pulse 3s ease-in-out infinite;
}
.lp-root .lineage .node--ok {
  fill: var(--color-signal-ok); stroke: var(--color-signal-ok);
  transform-origin: center; transform-box: fill-box;
  animation: lineage-node-pulse 3s ease-in-out infinite;
  animation-delay: 1.5s;
}
.lp-root .lineage text {
  font-family: var(--font-mono); font-size: 9px;
  fill: var(--color-ink-2); letter-spacing: 0.04em;
}
@keyframes lineage-trace { 0% { stroke-dashoffset: 80; opacity: 0.25; } 20% { stroke-dashoffset: 0; opacity: 1; } 80% { stroke-dashoffset: 0; opacity: 1; } 100% { stroke-dashoffset: -80; opacity: 0.25; } }
@keyframes lineage-node-pulse { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.4); opacity: 0.7; } }

.lp-root .eventlog {
  display: grid; gap: 1px;
  background: var(--color-rule-soft);
  border: var(--rule-hair) solid var(--color-rule-soft);
  border-radius: var(--radius-md); overflow: hidden;
}
.lp-root .eventlog__row {
  display: grid; grid-template-columns: 7rem 6.5rem 1fr auto;
  gap: var(--space-md); padding: 0.7rem var(--space-md);
  background: var(--color-paper); align-items: center;
  font-size: var(--text-sm);
  animation: row-receive 8s ease-out infinite;
}
.lp-root .eventlog__row:nth-child(1) { animation-delay: 0s; }
.lp-root .eventlog__row:nth-child(2) { animation-delay: 2s; }
.lp-root .eventlog__row:nth-child(3) { animation-delay: 4s; }
.lp-root .eventlog__row:nth-child(4) { animation-delay: 6s; }
.lp-root .eventlog__row--bad {
  background: color-mix(in oklch, var(--color-signal-bad) 8%, var(--color-paper));
  animation-name: row-alert;
}
.lp-root .eventlog__time { font-family: var(--font-mono); font-size: var(--text-xs); color: var(--color-faint); }
.lp-root .eventlog__type {
  font-family: var(--font-mono); font-size: var(--text-xs);
  color: var(--color-ink-2); text-transform: uppercase; letter-spacing: 0.06em;
}
.lp-root .eventlog__msg { color: var(--color-ink); font-size: var(--text-sm); }
.lp-root .eventlog__chip {
  font-family: var(--font-mono); font-size: var(--text-xs);
  padding: 0.15rem 0.5rem; border-radius: var(--radius-sm);
  letter-spacing: 0.06em; text-transform: uppercase;
}
.lp-root .eventlog__chip--ok { color: var(--color-signal-ok); border: var(--rule-hair) solid color-mix(in oklch, var(--color-signal-ok) 30%, transparent); }
.lp-root .eventlog__chip--warn { color: var(--color-signal-warn); border: var(--rule-hair) solid color-mix(in oklch, var(--color-signal-warn) 30%, transparent); }
.lp-root .eventlog__chip--bad {
  color: var(--color-signal-bad);
  border: var(--rule-hair) solid color-mix(in oklch, var(--color-signal-bad) 35%, transparent);
  background: color-mix(in oklch, var(--color-signal-bad) 12%, transparent);
}
@keyframes row-receive { 0%, 3%, 18%, 100% { background: var(--color-paper); } 4%, 8% { background: color-mix(in oklch, var(--color-accent) 16%, var(--color-paper)); } }
@keyframes row-alert { 0%, 3%, 24%, 100% { background: color-mix(in oklch, var(--color-signal-bad) 8%, var(--color-paper)); } 4%, 9% { background: color-mix(in oklch, var(--color-signal-bad) 34%, var(--color-paper)); } 14%, 19% { background: color-mix(in oklch, var(--color-signal-bad) 22%, var(--color-paper)); } }
@media (max-width: 32rem) { .lp-root .eventlog__row { grid-template-columns: 1fr; gap: 0.3rem; padding: 0.6rem var(--space-sm); } }

.lp-root .verticals { padding-block: var(--space-3xl); border-bottom: var(--rule-hair) solid var(--color-rule-soft); }
.lp-root .verticals__inner { max-width: 90rem; margin: 0 auto; padding-inline: var(--page-gutter); }
.lp-root .verticals__head {
  display: grid; grid-template-columns: minmax(0, 1fr) auto;
  gap: var(--space-md); align-items: end;
  margin-bottom: var(--space-md); max-width: 60rem;
}
.lp-root .verticals__title {
  font-family: var(--font-display); font-size: clamp(1.75rem, 3vw + 0.5rem, 2.5rem);
  font-weight: 600; letter-spacing: -0.022em; line-height: 1.1;
  max-width: 22ch;
}
.lp-root .verticals__meta {
  font-family: var(--font-mono); font-size: var(--text-xs);
  letter-spacing: 0.08em; text-transform: uppercase; color: var(--color-faint);
  white-space: nowrap;
}
.lp-root .verticals__lede {
  font-size: var(--text-md); line-height: 1.55; color: var(--color-ink-2);
  max-width: 56ch; margin-bottom: var(--space-2xl);
}
.lp-root .verticals__primary {
  display: grid; grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-lg); margin-bottom: var(--space-lg);
}
.lp-root .vprimary {
  display: block;
  background: var(--color-paper-2);
  border: var(--rule-hair) solid var(--color-rule);
  border-radius: var(--radius-md);
  overflow: hidden; position: relative;
  transition: border-color var(--dur-short) var(--ease-out), transform var(--dur-short) var(--ease-out);
}
.lp-root .vprimary:hover { border-color: var(--color-accent); transform: translateY(-2px); }
.lp-root .vprimary:focus-visible { outline: 2px solid var(--color-focus); outline-offset: 3px; }
.lp-root .vprimary__frame {
  display: block; aspect-ratio: 16 / 10;
  overflow: hidden; position: relative;
}
.lp-root .vprimary__frame img { object-fit: cover; transition: transform 600ms var(--ease-out); }
.lp-root .vprimary:hover .vprimary__frame img { transform: scale(1.04); }
.lp-root .vprimary__scrim {
  position: absolute; inset: 0;
  background: linear-gradient(to top, color-mix(in oklch, var(--color-paper) 90%, transparent) 0%, transparent 55%);
}
.lp-root .vprimary__body { position: absolute; inset: auto 0 0 0; padding: var(--space-lg); }
.lp-root .vprimary__top { display: flex; justify-content: space-between; align-items: flex-start; gap: var(--space-md); margin-bottom: var(--space-sm); }
.lp-root .vprimary__name {
  font-family: var(--font-display); font-size: var(--text-xl); font-weight: 600;
  color: var(--color-ink); letter-spacing: -0.022em; line-height: 1.1;
}
.lp-root .vprimary__code {
  font-family: var(--font-mono); font-size: var(--text-xs);
  letter-spacing: 0.06em; text-transform: uppercase;
  color: color-mix(in oklch, var(--color-ink) 70%, transparent);
  margin-top: var(--space-2xs);
}
.lp-root .vprimary__desc { font-size: var(--text-sm); line-height: 1.5; color: var(--color-ink-2); max-width: 36ch; }
.lp-root .vstatus {
  display: inline-flex; align-items: center; gap: 0.4rem;
  font-family: var(--font-mono); font-size: var(--text-xs);
  letter-spacing: 0.06em; text-transform: uppercase;
  padding: 0.25rem 0.55rem;
  background: color-mix(in oklch, var(--color-paper) 70%, transparent);
  border: var(--rule-hair) solid color-mix(in oklch, var(--color-ink) 18%, transparent);
  border-radius: 999px; backdrop-filter: blur(8px); white-space: nowrap;
}
.lp-root .vstatus::before { content: ""; width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
.lp-root .vstatus--live { color: var(--color-signal-ok); }
.lp-root .vstatus--rollout { color: var(--color-accent); }
.lp-root .vstatus--design { color: var(--color-muted); }
.lp-root .verticals__secondary-head {
  font-family: var(--font-mono); font-size: var(--text-xs);
  letter-spacing: 0.1em; text-transform: uppercase; color: var(--color-faint);
  margin: var(--space-2xl) 0 var(--space-md);
  padding-top: var(--space-md);
  border-top: var(--rule-hair) solid var(--color-rule-soft);
}
.lp-root .verticals__secondary {
  display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 1px;
  background: var(--color-rule-soft);
  border: var(--rule-hair) solid var(--color-rule-soft);
  border-radius: var(--radius-md); overflow: hidden;
}
.lp-root .vsec {
  padding: var(--space-md);
  background: var(--color-paper-2);
  display: grid; gap: var(--space-sm); align-content: space-between;
  min-height: 7rem;
}
.lp-root .vsec__name {
  font-family: var(--font-display); font-size: var(--text-md); font-weight: 600;
  color: var(--color-ink-2); letter-spacing: -0.018em;
}
.lp-root .vsec__code {
  font-family: var(--font-mono); font-size: var(--text-xs);
  letter-spacing: 0.06em; text-transform: uppercase; color: var(--color-faint);
}
@media (max-width: 64rem) {
  .lp-root .verticals__primary { grid-template-columns: 1fr; }
  .lp-root .verticals__secondary { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 40rem) { .lp-root .verticals__secondary { grid-template-columns: 1fr; } }

.lp-root .kit { padding-block: var(--space-3xl); border-bottom: var(--rule-hair) solid var(--color-rule-soft); }
.lp-root .kit__inner { max-width: 90rem; margin: 0 auto; padding-inline: var(--page-gutter); }
.lp-root .kit__head { margin-bottom: var(--space-2xl); max-width: 60rem; }
.lp-root .kit__title {
  font-family: var(--font-display); font-size: clamp(1.875rem, 3.2vw + 0.5rem, 2.625rem);
  font-weight: 600; line-height: 1.08; letter-spacing: -0.022em; color: var(--color-ink);
  max-width: 18ch; margin-bottom: var(--space-md);
}
.lp-root .kit__lede { font-size: var(--text-md); line-height: 1.55; color: var(--color-ink-2); max-width: 56ch; }
.lp-root .kit__grid {
  display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 1px;
  background: var(--color-rule-soft);
  border: var(--rule-hair) solid var(--color-rule-soft);
  border-radius: var(--radius-md); overflow: hidden;
}
.lp-root .kcard {
  padding: var(--space-lg);
  background: var(--color-paper);
  display: grid; gap: var(--space-sm); align-content: start;
}
.lp-root .kcard__num {
  font-family: var(--font-mono); font-size: var(--text-xs);
  letter-spacing: 0.08em; color: var(--color-accent);
  margin-bottom: var(--space-2xs);
}
.lp-root .kcard__title {
  font-family: var(--font-display); font-size: var(--text-md); font-weight: 600;
  color: var(--color-ink); letter-spacing: -0.018em;
}
.lp-root .kcard__text { font-size: var(--text-sm); line-height: 1.55; color: var(--color-ink-2); }
@media (max-width: 56rem) { .lp-root .kit__grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 36rem) { .lp-root .kit__grid { grid-template-columns: 1fr; } }

.lp-root .speed { padding-block: var(--space-3xl); border-bottom: var(--rule-hair) solid var(--color-rule-soft); }
.lp-root .speed__inner {
  max-width: 90rem; margin: 0 auto; padding-inline: var(--page-gutter);
  display: grid; grid-template-columns: auto 1fr; gap: var(--space-2xl);
  align-items: center;
}
.lp-root .speed__big {
  font-family: var(--font-mono); font-size: clamp(4rem, 12vw, 9rem);
  font-weight: 500; line-height: 0.9; letter-spacing: -0.04em;
  color: var(--color-accent); font-variant-numeric: tabular-nums;
}
.lp-root .speed__copy { max-width: 36rem; }
.lp-root .speed__title {
  font-family: var(--font-display); font-size: clamp(1.5rem, 2.4vw + 0.5rem, 2rem);
  font-weight: 600; line-height: 1.1; letter-spacing: -0.022em; color: var(--color-ink);
  margin-bottom: var(--space-md); max-width: 22ch;
}
.lp-root .speed__text { font-size: var(--text-md); line-height: 1.55; color: var(--color-ink-2); }
@media (max-width: 56rem) { .lp-root .speed__inner { grid-template-columns: 1fr; gap: var(--space-md); } }

.lp-root .changelog { padding-block: var(--space-3xl); border-bottom: var(--rule-hair) solid var(--color-rule-soft); }
.lp-root .changelog__inner { max-width: 90rem; margin: 0 auto; padding-inline: var(--page-gutter); }
.lp-root .changelog__head {
  display: flex; justify-content: space-between; align-items: baseline;
  gap: var(--space-md); flex-wrap: wrap; margin-bottom: var(--space-xl);
}
.lp-root .changelog__title {
  font-family: var(--font-display); font-size: clamp(1.625rem, 2.6vw + 0.5rem, 2.125rem);
  font-weight: 600; letter-spacing: -0.022em;
}
.lp-root .changelog__meta { font-family: var(--font-mono); font-size: var(--text-xs); letter-spacing: 0.08em; text-transform: uppercase; color: var(--color-faint); }
.lp-root .changelog__list { border-top: var(--rule-hair) solid var(--color-rule-soft); }
.lp-root .crow {
  display: grid; grid-template-columns: 8rem 1fr auto;
  gap: var(--space-lg); padding: var(--space-lg) 0;
  border-bottom: var(--rule-hair) solid var(--color-rule-soft); align-items: baseline;
}
.lp-root .crow__date { font-family: var(--font-mono); font-size: var(--text-xs); color: var(--color-faint); }
.lp-root .crow__title { font-family: var(--font-display); font-size: var(--text-md); font-weight: 500; margin-bottom: var(--space-2xs); }
.lp-root .crow__desc { font-size: var(--text-sm); color: var(--color-ink-2); max-width: 56ch; }
.lp-root .crow__tag { font-family: var(--font-mono); font-size: var(--text-xs); color: var(--color-accent); letter-spacing: 0.06em; text-transform: uppercase; }
@media (max-width: 48rem) { .lp-root .crow { grid-template-columns: 1fr; gap: var(--space-xs); } }

.lp-root .final { padding-block: var(--space-4xl); border-bottom: var(--rule-hair) solid var(--color-rule-soft); }
.lp-root .final__inner { max-width: 90rem; margin: 0 auto; padding-inline: var(--page-gutter); }
.lp-root .final__title {
  font-family: var(--font-display); font-size: clamp(2rem, 4vw + 0.5rem, 3.5rem);
  font-weight: 600; line-height: 1.05; letter-spacing: -0.028em; color: var(--color-ink);
  max-width: 22ch; margin-bottom: var(--space-md); text-wrap: balance;
}
.lp-root .final__sub {
  font-size: var(--text-lg); line-height: 1.5; color: var(--color-ink-2);
  max-width: 42ch; margin-bottom: var(--space-xl);
}
.lp-root .final__cta { display: flex; flex-wrap: wrap; gap: var(--space-md); align-items: center; }
.lp-root .final__note {
  margin-top: var(--space-md);
  font-family: var(--font-mono); font-size: var(--text-xs);
  letter-spacing: 0.06em; color: var(--color-faint);
}

.lp-root .foot { padding: var(--space-3xl) var(--page-gutter) var(--space-xl); max-width: 90rem; margin: 0 auto; }
.lp-root .foot__top {
  display: grid; grid-template-columns: minmax(0, 2fr) repeat(4, minmax(0, 1fr));
  gap: var(--space-xl); padding-bottom: var(--space-2xl);
  border-bottom: var(--rule-hair) solid var(--color-rule-soft);
  margin-bottom: var(--space-lg);
}
.lp-root .foot__brand {
  display: inline-flex; align-items: center; gap: 0.65rem;
  font-family: var(--font-display); font-size: var(--text-xl); font-weight: 600;
  letter-spacing: -0.022em; color: var(--color-ink); margin-bottom: var(--space-sm);
}
.lp-root .foot__brand-mark {
  height: 88px; width: auto;
  object-fit: contain; display: block;
  filter: invert(1) hue-rotate(180deg);
}
.lp-root .foot__tag {
  font-family: var(--font-mono); font-size: var(--text-xs);
  letter-spacing: 0.06em; text-transform: uppercase; color: var(--color-faint);
  max-width: 38ch; line-height: 1.6;
}
.lp-root .foot__col h4 {
  font-family: var(--font-mono); font-size: var(--text-xs);
  font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase;
  color: var(--color-faint); margin: 0 0 var(--space-md);
}
.lp-root .foot__col ul { list-style: none; margin: 0; padding: 0; display: grid; gap: var(--space-sm); }
.lp-root .foot__col a, .lp-root .foot__col li {
  font-size: var(--text-sm); color: var(--color-ink-2);
  transition: color var(--dur-short) var(--ease-out);
}
.lp-root .foot__col a:hover { color: var(--color-accent); }
.lp-root .foot__bottom {
  display: flex; justify-content: space-between; flex-wrap: wrap; gap: var(--space-md);
  font-family: var(--font-mono); font-size: var(--text-xs);
  letter-spacing: 0.04em; color: var(--color-faint);
}
.lp-root .foot__status { display: inline-flex; align-items: center; gap: 0.4rem; color: var(--color-signal-ok); }
.lp-root .foot__status::before { content: ""; width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
@media (max-width: 64rem) { .lp-root .foot__top { grid-template-columns: 1fr 1fr; } }
@media (max-width: 40rem) { .lp-root .foot__top { grid-template-columns: 1fr; } }

.lp-root .reveal {
  opacity: 0; transform: translateY(8px);
  animation: reveal var(--dur-long) var(--ease-out) forwards;
  animation-delay: calc(var(--i, 0) * 70ms);
}
@keyframes reveal { to { opacity: 1; transform: none; } }

@media (prefers-reduced-motion: reduce) {
  .lp-root *, .lp-root *::before, .lp-root *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
  .lp-root .reveal { opacity: 1; transform: none; }
}
`;

type CellState = "ok" | "cyan" | "warn" | "bad" | "empty";
const SHELF_STATE: CellState[][] = [
  ["ok", "ok", "ok", "cyan", "ok", "ok", "ok", "ok"],
  ["ok", "ok", "cyan", "cyan", "ok", "ok", "warn", "ok"],
  ["ok", "cyan", "bad", "bad", "cyan", "ok", "ok", "ok"],
  ["ok", "ok", "ok", "ok", "empty", "ok", "ok", "cyan"],
];

export function LandingPage() {
  useEffect(() => {
    const nav = document.getElementById("lp-nav");
    if (!nav) return;
    const handler = () => {
      if (window.scrollY > 80) nav.classList.add("nav--scrolled");
      else nav.classList.remove("nav--scrolled");
    };
    window.addEventListener("scroll", handler, { passive: true });
    handler();
    return () => window.removeEventListener("scroll", handler);
  }, []);

  let nextId = 1841;
  const shelfRows = SHELF_STATE.map((row, ri) =>
    row.map((s, ci) => {
      const id = s === "empty" ? null : nextId++;
      return { state: s, id, key: `${ri}-${ci}` };
    })
  );

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: HOMEPAGE_CSS }} />
      <div className="lp-root">

        <nav id="lp-nav" className="nav" aria-label="Primary">
          <Link className="nav__brand" href="/" aria-label="VitrOS home">
            <img className="nav__brand-mark" src="/logo.png" alt="VitrOS" />
          </Link>
          <div className="nav__right">
            <Link className="nav__link" href="/features">Features</Link>
            <Link className="nav__link" href="/pricing">Pricing</Link>
            <Link className="nav__link" href="/demo">Demo</Link>
            <Link className="nav__link" href="/login">Sign in</Link>
            <Link className="nav__cta" href="/signup">Start free &nbsp;→</Link>
          </div>
        </nav>

        <main id="top">

          <section className="hero">
            <Image
              className="hero__bg"
              src="/images/homepage/nursery.jpg"
              alt=""
              fill
              priority
              sizes="100vw"
            />
            <div className="hero__scrim" aria-hidden="true" />
            <div className="hero__body">
              <p className="hero__eyebrow reveal" style={{ "--i": 0 } as CSSProperties}>VitrOS / Tissue culture &amp; plant production</p>
              <h1 className="hero__display reveal" style={{ "--i": 1 } as CSSProperties}>The operating system for tissue culture labs.</h1>
              <p className="hero__lede reveal" style={{ "--i": 2 } as CSSProperties}>
                Track every vessel, manage your lab inventory, and streamline workflows. VitrOS replaces paper logs and spreadsheets so you can scale with confidence. Built for tissue culture and the plant production stages that follow.
              </p>
              <div className="hero__cta reveal" style={{ "--i": 3 } as CSSProperties}>
                <Link className="btn btn--primary" href="/signup">Start free &nbsp;→</Link>
                <Link className="btn btn--ghost" href="/features">See the platform</Link>
              </div>
              <p className="hero__cta-note reveal" style={{ "--i": 4 } as CSSProperties}>30-day free trial. No credit card.</p>
            </div>
            <p className="hero__caption" aria-hidden="true">Plate 01 &nbsp;·&nbsp; Commercial propagation greenhouse</p>
          </section>

          <section className="scale" aria-label="Scale">
            <div className="scale__cell">
              <div className="scale__n tnum">80%</div>
              <div className="scale__l">Reduction in logging time</div>
            </div>
            <div className="scale__cell">
              <div className="scale__n tnum">3.0s</div>
              <div className="scale__l">Avg vessel entry</div>
            </div>
            <div className="scale__cell">
              <div className="scale__n tnum">~5×</div>
              <div className="scale__l">Faster than manual</div>
            </div>
          </section>

          <section className="pain">
            <div className="pain__inner">
              <div className="pain__head">
                <p className="pain__kicker">Sound familiar?</p>
                <h2 className="pain__title">Tissue culture wasn&rsquo;t built for spreadsheets.</h2>
                <p className="pain__lede">Every lab we&rsquo;ve talked to runs into the same three walls. None of them are solvable with another spreadsheet column.</p>
              </div>
              <div className="pain__grid">
                <div className="pcard">
                  <div className="pcard__mark" aria-hidden="true">!</div>
                  <h3 className="pcard__title">Paper &amp; spreadsheet chaos.</h3>
                  <p className="pcard__text">A new vessel takes 15 seconds to log by hand. A new clone line spawns a tab nobody opens again. The audit trail lives in someone&rsquo;s memory.</p>
                </div>
                <div className="pcard">
                  <div className="pcard__mark" aria-hidden="true">!</div>
                  <h3 className="pcard__title">Contamination blind spots.</h3>
                  <p className="pcard__text">A contamination event spreads across a shelf before anyone notices the pattern. By the time the trend shows up in the weekly review, the line is already lost.</p>
                </div>
                <div className="pcard">
                  <div className="pcard__mark" aria-hidden="true">!</div>
                  <h3 className="pcard__title">Zero production visibility.</h3>
                  <p className="pcard__text">Nobody can answer &ldquo;what ships next week&rdquo; without walking the lab. Demand forecasting is a guess. Customer commitments are a leap of faith.</p>
                </div>
              </div>
            </div>
          </section>

          <section className="workbench" id="features">
            <div className="workbench__inner">
              <header className="workbench__head">
                <h2 className="workbench__title">Three primitives. One source of truth.</h2>
                <p className="workbench__lede">Vessel state, clone-line lineage, and event routing live in one schema. The product surface is built on those three primitives, not bolted on top of them.</p>
              </header>

              <div className="feature">
                <div className="feature__copy">
                  <h3 className="feature__title">Every vessel, accounted for.</h3>
                  <p className="feature__text">Log a vessel in three seconds. Scan the barcode with your phone camera, no dedicated hardware required. Update stage, contamination, and lineage from any device. The grid is the single source of truth across the lab.</p>
                  <div className="feature__meta">
                    <span><b>Average entry</b>3.0 s</span>
                    <span><b>Manual baseline</b>15 s</span>
                  </div>
                </div>
                <figure className="surface" aria-label="Multiplication shelf, top-down view">
                  <div className="surface__label">
                    <span>Lab B / Mult. shelf 4 / TC-04 &middot; Solanum tuberosum</span>
                    <span className="dot">Live &middot; 32 vessels</span>
                  </div>
                  <div className="shelf" aria-hidden="true">
                    <div className="shelf__colhead">
                      <span />
                      <div className="shelf__colhead-nums">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => <span key={n}>{n}</span>)}
                      </div>
                    </div>
                    {shelfRows.map((row, ri) => (
                      <div key={ri} className="shelf__row">
                        <span className="shelf__rowlabel">{["A", "B", "C", "D"][ri]}</span>
                        <div className="shelf__slots">
                          {row.map((cell, ci) => {
                            const i = ri * 8 + ci;
                            const r = cell.state === "bad" ? 11 : (cell.id !== null ? 8 + ((cell.id * 13) % 5) : 9);
                            return (
                              <div
                                key={cell.key}
                                className={`vessel vessel--${cell.state}`}
                                style={{ "--i": i } as CSSProperties}
                              >
                                <svg viewBox="0 0 40 40" className="vessel__jar">
                                  <rect x={4} y={4} width={32} height={32} rx={5} className="vessel__rim" />
                                  {cell.state !== "empty" && (
                                    <circle cx={20} cy={20} r={r} className="vessel__contents" />
                                  )}
                                </svg>
                                <span className="vessel__id">{cell.id === null ? "—" : `V${cell.id}`}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </figure>
              </div>

              <div className="feature feature--reverse">
                <div className="feature__copy">
                  <h3 className="feature__title">Trace any clone back to its mother.</h3>
                  <p className="feature__text">Cell-line lineage is a first-class object, not a column. Walk the tree, branch a sub-line, archive a generation. The audit trail comes for free, and every clone in the lab carries its genealogy on its label.</p>
                  <div className="feature__meta">
                    <span><b>Generations</b>unlimited</span>
                    <span><b>Branch in</b>2 clicks</span>
                  </div>
                </div>
                <figure className="surface" aria-label="Lineage tree visualization">
                  <div className="surface__label">
                    <span>Cultivar / Solanum tuberosum / TC-04</span>
                    <span className="mono">G4 → G7</span>
                  </div>
                  <svg className="lineage" viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
                    <line x1={40}  y1={100} x2={100} y2={100} />
                    <line x1={100} y1={100} x2={160} y2={60} />
                    <line x1={100} y1={100} x2={160} y2={140} />
                    <line x1={160} y1={60}  x2={220} y2={40} />
                    <line x1={160} y1={60}  x2={220} y2={80} />
                    <line x1={160} y1={140} x2={220} y2={120} />
                    <line x1={160} y1={140} x2={220} y2={160} />
                    <line className="branch--active" x1={220} y1={80} x2={290} y2={80} />
                    <line className="branch--active" x1={290} y1={80} x2={350} y2={60} />
                    <line className="branch--active" x1={290} y1={80} x2={350} y2={100} />
                    <circle className="node" cx={40}  cy={100} r={5} />
                    <circle className="node" cx={100} cy={100} r={5} />
                    <circle className="node" cx={160} cy={60}  r={5} />
                    <circle className="node" cx={160} cy={140} r={5} />
                    <circle className="node" cx={220} cy={40}  r={5} />
                    <circle className="node node--active" cx={220} cy={80}  r={5} />
                    <circle className="node" cx={220} cy={120} r={5} />
                    <circle className="node" cx={220} cy={160} r={5} />
                    <circle className="node node--active" cx={290} cy={80}  r={5} />
                    <circle className="node node--ok" cx={350} cy={60}  r={5} />
                    <circle className="node node--ok" cx={350} cy={100} r={5} />
                    <text x={32}  y={120}>G0</text>
                    <text x={92}  y={120}>G1</text>
                    <text x={152} y={80}>G2</text>
                    <text x={212} y={100}>G3</text>
                    <text x={282} y={100}>G4</text>
                    <text x={342} y={80}>G5</text>
                  </svg>
                </figure>
              </div>

              <div className="feature">
                <div className="feature__copy">
                  <h3 className="feature__title">Route a contamination event in seconds.</h3>
                  <p className="feature__text">Flag a vessel, the system fans the alert out: shelf neighbours quarantined, mother plant flagged, technician notified, audit log written. Patterns surface by cultivar, location, and media type before the line is lost.</p>
                  <div className="feature__meta">
                    <span><b>Alert fan-out</b>under 2 s</span>
                    <span><b>Audit</b>immutable</span>
                  </div>
                </div>
                <figure className="surface" aria-label="Event log visualization">
                  <div className="surface__label">
                    <span>Event stream / Lab B</span>
                    <span className="mono">21:04:18</span>
                  </div>
                  <div className="eventlog">
                    <div className="eventlog__row">
                      <span className="eventlog__time">21:04:11</span>
                      <span className="eventlog__type">Stage</span>
                      <span className="eventlog__msg">V-1842 promoted to rooting medium.</span>
                      <span className="eventlog__chip eventlog__chip--ok">OK</span>
                    </div>
                    <div className="eventlog__row">
                      <span className="eventlog__time">21:04:13</span>
                      <span className="eventlog__type">Lineage</span>
                      <span className="eventlog__msg">Branch G4 → G5 opened on cultivar TC-04.</span>
                      <span className="eventlog__chip eventlog__chip--ok">OK</span>
                    </div>
                    <div className="eventlog__row eventlog__row--bad">
                      <span className="eventlog__time">21:04:16</span>
                      <span className="eventlog__type">Contam</span>
                      <span className="eventlog__msg">V-2031 flagged. Shelf 4 row C quarantined. 14 neighbours isolated.</span>
                      <span className="eventlog__chip eventlog__chip--bad">Routed</span>
                    </div>
                    <div className="eventlog__row">
                      <span className="eventlog__time">21:04:18</span>
                      <span className="eventlog__type">Notify</span>
                      <span className="eventlog__msg">Technician (KO) paged. Mother plant flagged for review.</span>
                      <span className="eventlog__chip eventlog__chip--warn">Pending</span>
                    </div>
                  </div>
                </figure>
              </div>
            </div>
          </section>

          <section className="verticals" id="verticals">
            <div className="verticals__inner">
              <div className="verticals__head">
                <h2 className="verticals__title">Built for tissue culture. Extending to plant production.</h2>
                <span className="verticals__meta">2 shipping &middot; 4 in design</span>
              </div>
              <p className="verticals__lede">The schema is multi-vertical. The product surface ships in two today: tissue culture labs and commercial nurseries. Four more verticals are in design on the same engine.</p>

              <div className="verticals__primary">
                <Link className="vprimary" href="/signup">
                  <div className="vprimary__frame">
                    <Image
                      src="/images/homepage/tc-verticals.jpg"
                      alt="Working commercial tissue culture production room: long stainless steel rack stacked five shelves high, hundreds of glass culture jars with barcode-labeled white lids."
                      fill
                      sizes="(max-width: 64rem) 100vw, 50vw"
                    />
                    <div className="vprimary__scrim" aria-hidden="true" />
                    <div className="vprimary__body">
                      <div className="vprimary__top">
                        <div>
                          <div className="vprimary__name">Tissue culture labs</div>
                          <div className="vprimary__code">VitrOS</div>
                        </div>
                        <span className="vstatus vstatus--live">Live</span>
                      </div>
                      <p className="vprimary__desc">Micropropagation, clone-line tracking, contamination routing, vessel inventory, media management, audit logs.</p>
                    </div>
                  </div>
                </Link>

                <Link className="vprimary" href="/signup">
                  <div className="vprimary__frame">
                    <Image
                      src="/images/homepage/nursery.jpg"
                      alt="Commercial nursery greenhouse with rows of plug trays under horticultural LED grow lights, deep receding perspective."
                      fill
                      sizes="(max-width: 64rem) 100vw, 50vw"
                    />
                    <div className="vprimary__scrim" aria-hidden="true" />
                    <div className="vprimary__body">
                      <div className="vprimary__top">
                        <div>
                          <div className="vprimary__name">Commercial nurseries</div>
                          <div className="vprimary__code">GreenhouseOS</div>
                        </div>
                        <span className="vstatus vstatus--rollout">In rollout</span>
                      </div>
                      <p className="vprimary__desc">Plug trays, hardening blocks, irrigation runs, dispatch queues, multi-site inventory, demand forecasting.</p>
                    </div>
                  </div>
                </Link>
              </div>

              <p className="verticals__secondary-head">On the engine, in design</p>
              <div className="verticals__secondary">
                <div className="vsec">
                  <div className="vsec__name">Mycology</div>
                  <div>
                    <div className="vsec__code">MycoOS</div>
                    <span className="vstatus vstatus--design" style={{ marginTop: "0.5rem" }}>In design</span>
                  </div>
                </div>
                <div className="vsec">
                  <div className="vsec__name">Aquaculture</div>
                  <div>
                    <div className="vsec__code">HatcheryOS</div>
                    <span className="vstatus vstatus--design" style={{ marginTop: "0.5rem" }}>In design</span>
                  </div>
                </div>
                <div className="vsec">
                  <div className="vsec__name">Fermentation</div>
                  <div>
                    <div className="vsec__code">FermentOS</div>
                    <span className="vstatus vstatus--design" style={{ marginTop: "0.5rem" }}>In design</span>
                  </div>
                </div>
                <div className="vsec">
                  <div className="vsec__name">Pharma precursors</div>
                  <div>
                    <div className="vsec__code">PharmOS</div>
                    <span className="vstatus vstatus--design" style={{ marginTop: "0.5rem" }}>In design</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="kit">
            <div className="kit__inner">
              <header className="kit__head">
                <h2 className="kit__title">Everything your lab needs.</h2>
                <p className="kit__lede">A complete operating system, not a collection of add-ons. Six core surfaces, all built on the same schema.</p>
              </header>
              <div className="kit__grid">
                <div className="kcard">
                  <div className="kcard__num">01</div>
                  <h3 className="kcard__title">Barcode-based tracking</h3>
                  <p className="kcard__text">From initiation through every subculture to hardening and ship-out. One barcode follows the vessel through its whole lifecycle.</p>
                </div>
                <div className="kcard">
                  <div className="kcard__num">02</div>
                  <h3 className="kcard__title">Phone-camera scanning</h3>
                  <p className="kcard__text">Scan vessel barcodes with the phone in your pocket. No dedicated hardware required, no scanner gun to misplace.</p>
                </div>
                <div className="kcard">
                  <div className="kcard__num">03</div>
                  <h3 className="kcard__title">Contamination intelligence</h3>
                  <p className="kcard__text">Spot contamination trends by cultivar, location, and media type before they spread across the shelf.</p>
                </div>
                <div className="kcard">
                  <div className="kcard__num">04</div>
                  <h3 className="kcard__title">Production visibility</h3>
                  <p className="kcard__text">See every stage of production at a glance. Know exactly what&rsquo;s ready, what&rsquo;s pending, what&rsquo;s blocked.</p>
                </div>
                <div className="kcard">
                  <div className="kcard__num">05</div>
                  <h3 className="kcard__title">Media &amp; batch management</h3>
                  <p className="kcard__text">Track media recipes, prep schedules, and batch quality in one place. Tie every vessel back to the media it sits in.</p>
                </div>
                <div className="kcard">
                  <div className="kcard__num">06</div>
                  <h3 className="kcard__title">Roles &amp; audit logs</h3>
                  <p className="kcard__text">Role-based access control with full activity audit logs for every team member. Every change traceable to a person and a time.</p>
                </div>
              </div>
            </div>
          </section>

          <section className="speed">
            <div className="speed__inner">
              <div className="speed__big tnum">80%</div>
              <div className="speed__copy">
                <h2 className="speed__title">Less time logging. More time working.</h2>
                <p className="speed__text">VitrOS cuts vessel logging time by 80%. A technician logging 96 vessels saves 19 minutes per pass. Across a production shift, that&rsquo;s two hours back on the bench.</p>
              </div>
            </div>
          </section>

          <section className="changelog" id="changelog">
            <div className="changelog__inner">
              <div className="changelog__head">
                <h2 className="changelog__title">Shipped in the last 30 days.</h2>
                <span className="changelog__meta">3 commits to production</span>
              </div>
              <div className="changelog__list">
                <article className="crow">
                  <time className="crow__date tnum">2026-06-05</time>
                  <div>
                    <h3 className="crow__title">Phase 1 multi-vertical schema</h3>
                    <p className="crow__desc">CloneLine accession fields, Cultivar parent and trademark refs, Vessel off-type and mother-plant flags. The schema that lets GreenhouseOS plug in without a fork.</p>
                  </div>
                  <span className="crow__tag">Platform</span>
                </article>
                <article className="crow">
                  <time className="crow__date tnum">2026-05-28</time>
                  <div>
                    <h3 className="crow__title">Deliverability stack live</h3>
                    <p className="crow__desc">DMARC, DKIM, and SPF verified on vitroslabs.com.</p>
                  </div>
                  <span className="crow__tag">Infrastructure</span>
                </article>
                <article className="crow">
                  <time className="crow__date tnum">2026-05-15</time>
                  <div>
                    <h3 className="crow__title">Resend outreach pipeline</h3>
                    <p className="crow__desc">High-volume sends moved to outreach.vitroslabs.com so the primary domain&rsquo;s reputation stays clean.</p>
                  </div>
                  <span className="crow__tag">Operations</span>
                </article>
              </div>
            </div>
          </section>

          <section className="final" id="demo">
            <div className="final__inner">
              <h2 className="final__title">Ready to modernize your lab?</h2>
              <p className="final__sub">30-day free trial. No credit card. Upgrade when you&rsquo;re ready.</p>
              <div className="final__cta">
                <Link className="btn btn--primary" href="/signup">Start free &nbsp;→</Link>
                <Link className="btn btn--ghost" href="/demo">Book a demo</Link>
              </div>
              <p className="final__note">Or email york@vitroslabs.com to talk to the founder directly.</p>
            </div>
          </section>

        </main>

        <footer className="foot">
          <div className="foot__top">
            <div>
              <div className="foot__brand">
                <img className="foot__brand-mark" src="/logo.png" alt="VitrOS" />
              </div>
              <div className="foot__tag">The operating system for tissue culture labs and the plant production stages that follow.</div>
            </div>
            <div className="foot__col">
              <h4>Product</h4>
              <ul>
                <li><Link href="/features">Features</Link></li>
                <li><Link href="/pricing">Pricing</Link></li>
                <li><Link href="/demo">Demo</Link></li>
              </ul>
            </div>
            <div className="foot__col">
              <h4>Company</h4>
              <ul>
                <li><Link href="/why-vitros">Why VitrOS</Link></li>
                <li><a href="mailto:support@vitroslabs.com">Contact</a></li>
              </ul>
            </div>
            <div className="foot__col">
              <h4>Resources</h4>
              <ul>
                <li><Link href="/blog">Blog</Link></li>
                <li><Link href="/login">Sign in</Link></li>
                <li><Link href="/signup">Start free</Link></li>
              </ul>
            </div>
            <div className="foot__col">
              <h4>Built for</h4>
              <ul>
                <li>Tissue culture labs</li>
                <li>Plant propagation</li>
                <li>Commercial nurseries</li>
              </ul>
            </div>
          </div>
          <div className="foot__bottom">
            <span><span className="foot__status">All systems operational</span></span>
            <span>&copy; {new Date().getFullYear()} VitrOS Labs &nbsp;&middot;&nbsp; Powered by Caipher &nbsp;&middot;&nbsp; All rights reserved</span>
          </div>
        </footer>

      </div>
    </>
  );
}
