import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, ScanBarcode } from "lucide-react";
import { Button } from "@/components/ui/button";
import styles from "./connected-culture-hero.module.css";

export function ConnectedCultureHero() {
  return (
    <section id="physical-record" aria-labelledby="culture-hero-title" className={styles.hero}>
      <div className={styles.introduction}>
        <div>
          <p className={styles.eyebrow}><span aria-hidden="true" /> Plant tissue culture software</p>
          <h1 id="culture-hero-title" className={styles.headline}>Every culture.{" "}<br /><span>Connected.</span></h1>
        </div>
        <div className={styles.summary}>
          <p>Scan a vessel. Review its history. Make the next move. VitrOS keeps your tissue culture records, lineage and micropropagation work connected.</p>
          <div className={styles.actions}>
            <Button asChild size="lg"><Link href="/signup">Start free <ArrowRight aria-hidden="true" className="size-4" /></Link></Button>
            <Button asChild variant="outline" size="lg"><Link href="/demo">Explore the demo</Link></Button>
          </div>
          <p className={styles.trial}>30-day free trial · No credit card to create your workspace</p>
        </div>
      </div>

      <div className={styles.connection}>
        <figure className={styles.vessel}>
          <figcaption className={styles.vesselHeading}>
            <span className={styles.number}>01</span>
            <span>The culture in your hand</span>
            <ScanBarcode aria-hidden="true" className="size-4" />
          </figcaption>
          <div className={styles.vesselPhoto}>
            <Image
              src="/images/homepage/labeled-culture-vessel-ai.png"
              alt="AI photo illustration of a Monstera deliciosa culture vessel labeled TC-2026-0042, matching the record and lineage beside it"
              fill
              priority
              sizes="(max-width: 767px) calc(100vw - 32px), (max-width: 1199px) 38vw, 438px"
              className={styles.vesselImage}
            />
          </div>
          <p className={styles.photoCaption}><span>TC-2026-0042</span><span>AI photo illustration</span></p>
        </figure>

        <div className={styles.records}>
          <a href="/images/product/vessel-record.png" target="_blank" rel="noopener noreferrer" className={styles.screenLink} aria-label="Inspect the full VitrOS vessel record screenshot for TC-2026-0042">
            <figure>
              <figcaption className={styles.screenHeading}>
                <span className={styles.number}>02</span>
                <span>Its record, ready to work<span className={styles.recordIdentity}>TC-2026-0042</span></span>
                <ArrowUpRight aria-hidden="true" className="size-4" />
              </figcaption>
              <div className={styles.recordViewport}>
                <Image src="/images/product/vessel-record.png" alt="Actual VitrOS record for TC-2026-0042 showing Monstera deliciosa, multiplication stage and available actions; demonstration data" width={2880} height={2160} sizes="(max-width: 767px) 140vw, (max-width: 1199px) 86vw, 980px" className={styles.recordImage} />
              </div>
            </figure>
          </a>
          <a href="/images/product/culture-lineage.png" target="_blank" rel="noopener noreferrer" className={styles.screenLink} aria-label="Inspect the full VitrOS lineage screenshot for TC-2026-0042">
            <figure>
              <figcaption className={styles.lineageHeading}>
                <span className={styles.number}>03</span>
                <span>Every generation, connected</span>
                <ArrowUpRight aria-hidden="true" className="size-4" />
              </figcaption>
              <div className={styles.lineageViewport}>
                <Image src="/images/product/culture-lineage.png" alt="Actual VitrOS lineage connecting parent TC-2026-0014 to selected vessel TC-2026-0042; demonstration data" width={2880} height={2160} sizes="(max-width: 767px) 230vw, (max-width: 1199px) 140vw, 1600px" className={styles.lineageImage} />
              </div>
            </figure>
          </a>
          <p className={styles.screenCaption}>Actual VitrOS screens · Demonstration data · Select a screen to inspect</p>
        </div>
      </div>
    </section>
  );
}
