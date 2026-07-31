import styles from "./Hero.module.css";
import { Diorama } from "./Diorama";
import { ctaUrl, heroSubline, tagline } from "../content/site";

/**
 * Centred poster composition: tagline between two hairlines, the giant wordmark,
 * a mono sub-line, then the diorama, then one CTA pinned bottom-centre.
 *
 * Both tagline variants are in the markup and CSS picks one at the 900px
 * breakpoint — so the hero is correct on first paint and without JavaScript.
 */
export function Hero() {
  return (
    <section id="beranda" className={styles.hero} aria-labelledby="hero-wordmark">
      <div className={styles.grain} aria-hidden="true" />

      <div className={styles.poster}>
        <div className={styles.taglineRow} data-hero-reveal>
          <span className={styles.rule} aria-hidden="true" />
          <span className={styles.tagline}>{tagline}</span>
          <span className={styles.rule} aria-hidden="true" />
        </div>
        <p className={styles.taglineBlock} data-hero-reveal>
          {tagline}
        </p>

        <h1 id="hero-wordmark" className={styles.wordmark} data-hero-reveal>
          PATHRIX
        </h1>
        <span className={styles.subline} data-hero-reveal>
          {heroSubline}
        </span>
      </div>

      <div className={styles.stage}>
        <div className={styles.stageInner}>
          <Diorama view="stage" tint="#dfeaf3" />
        </div>
      </div>

      <div className={styles.ctaRow}>
        <a className={styles.cta} href={ctaUrl} data-hero-reveal>
          Jelajahi Peta
          <span className={styles.ctaArrow} aria-hidden="true">
            &#8594;
          </span>
        </a>
      </div>
    </section>
  );
}
