import styles from "./Penutup.module.css";
import { penutupShot } from "../content/site";
import { useCopy } from "../lib/locale";

/**
 * Closing capstone section between Kontak and Footer: full-bleed photo
 * (`penutupShot`), a scrim strong enough to guarantee body-text contrast at
 * any crop, and one CTA back to #kontak.
 *
 * Built as plain markup rather than reusing `ImageSlot` — this is the one
 * place the image needs a custom `object-position` (biased toward the photo's
 * upper sky, where the source art keeps clear of the road/vehicles) instead
 * of ImageSlot's fixed center-crop, and there is no placeholder-art fallback
 * path to share since `penutupShot` always resolves.
 */
export function Penutup() {
  const { penutup } = useCopy();

  return (
    <section id="penutup" className={styles.section} aria-labelledby="penutup-heading">
      <div className={styles.media} aria-hidden="true">
        <picture className={styles.picture}>
          <source srcSet={`${penutupShot.src}.webp`} type="image/webp" />
          <img
            className={styles.image}
            src={`${penutupShot.src}.jpg`}
            alt=""
            width={penutupShot.width}
            height={penutupShot.height}
            loading="lazy"
            decoding="async"
            fetchPriority="low"
          />
        </picture>
      </div>
      <div className={styles.scrim} aria-hidden="true" />

      <div className={styles.shell}>
        <div className={styles.content}>
          <span className={styles.eyebrow} data-reveal>
            {penutup.eyebrow}
          </span>
          <h2 id="penutup-heading" className={styles.heading} data-reveal>
            {penutup.heading}
          </h2>
          <p className={styles.body} data-reveal>
            {penutup.body}
          </p>
          <a className={styles.cta} href="#kontak" data-reveal>
            {penutup.ctaLabel}
            <span className={styles.ctaArrow} aria-hidden="true">
              &#8594;
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
