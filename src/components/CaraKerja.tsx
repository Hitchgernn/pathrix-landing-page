import styles from "./CaraKerja.module.css";
import { ImageSlot } from "./ImageSlot";
import { caraKerjaShots } from "../content/site";
import { useCopy } from "../lib/locale";

/**
 * Three bold illustrated step cards, one per `Step`, each a curated portrait
 * photo-style render (public/img/carakerja-0{1,2,3}.{webp,jpg}, 700x1043,
 * geometry in content/site.ts's `caraKerjaShots`) over a pill index badge,
 * title, and body.
 *
 * Step 03 (`accent: "warm"`) gets the section's one solid warm-fill card —
 * the same "one warm tile per section" convention as Fitur's bento payoff
 * cell and Audiens' closing group, reused here rather than invented fresh.
 *
 * The illustrations are decorative, not informational: the title and body
 * already state the step in full, and the renders carry baked-in English UI
 * labels ("FASTEST", "AI CORE", etc.) that would be misleading or redundant
 * if echoed as alt text on the Indonesian-first page — so each still gets
 * `alt=""` rather than a hardcoded description that would also surface
 * (wrongly) on the English locale — CaraKerja's own copy is the only thing
 * that translates.
 */
export function CaraKerja() {
  const { caraKerja } = useCopy();
  return (
    <section id="cara-kerja" className={styles.section} aria-labelledby="cara-kerja-heading">
      <div className={styles.shell}>
        <div className={styles.headingCol}>
          <span className={styles.eyebrow} data-reveal>
            {caraKerja.eyebrow}
          </span>
          <h2 id="cara-kerja-heading" className={styles.heading} data-reveal>
            {caraKerja.heading}
          </h2>
        </div>

        <div className={styles.grid}>
          {caraKerja.steps.map((step, i) => {
            const shot = caraKerjaShots[i];
            return (
              <div
                key={step.index}
                className={styles.card}
                data-accent={step.accent}
                data-reveal
              >
                <div className={styles.illustration}>
                  <ImageSlot
                    src={shot.src}
                    alt=""
                    caption={`Langkah ${step.index}`}
                    width={shot.width}
                    height={shot.height}
                  />
                </div>
                <div className={styles.content}>
                  <span className={styles.badge} data-accent={step.accent}>
                    {step.index}
                  </span>
                  <h3 className={styles.title}>{step.title}</h3>
                  <p className={styles.body}>{step.body}</p>
                </div>
              </div>
            );
          })}
        </div>

        <p className={styles.methodNote} data-reveal>
          {caraKerja.methodNote}
        </p>
      </div>
    </section>
  );
}
