import { ArrowRight, Leaf } from "@phosphor-icons/react";
import styles from "./Fitur.module.css";
import { ImageSlot } from "./ImageSlot";
import { ctaUrl, fiturShots } from "../content/site";
import { useCopy } from "../lib/locale";

/**
 * Image-forward bento grid: all 6 cells now share one visual grammar — a
 * curated illustration (`fiturShots`, same low-poly style as the Hero
 * diorama) filling the top of the card behind a small floating index badge,
 * title + body in the padded content area below. Cells 1 and 6 ("flagship"
 * and "payoff") keep the two-column `.cellWide` span (gated behind the
 * `@media (min-width: 620px)` fix already proven safe at 390px) and get a
 * wider 16:9 image crop to match their footprint; cells 2-5 use a 4:3 crop,
 * the same ratio CaraKerja's step photos already use successfully against
 * the same ~0.671 source aspect ratio.
 *
 * The illustrations are decorative relative to the adjacent copy — every
 * title+body already states the feature in full, and these are stylized
 * scenario renders, not literal UI captures — so each gets `alt=""`, the same
 * call CaraKerja made for its own photos from this pipeline. Cell 6 keeps its
 * solid warm fill and the `--eco` icon chip flagging the carbon claim.
 */
export function Fitur() {
  const { fitur } = useCopy();

  return (
    <section id="fitur" className={styles.section} aria-labelledby="fitur-heading">
      <div className={styles.shell}>
        <div className={styles.head}>
          <span className={styles.eyebrow} data-reveal>
            {fitur.eyebrow}
          </span>
          <h2 id="fitur-heading" className={styles.heading} data-reveal>
            {fitur.heading}
          </h2>
        </div>

        <div className={styles.grid}>
          {fitur.items.map((item, i) => {
            const shot = fiturShots[i];
            const isWide = i === 0 || i === 5;
            const isWarm = item.accent === "warm";

            return (
              <div
                key={item.index}
                className={isWide ? `${styles.cell} ${styles.cellWide}` : styles.cell}
                data-accent={item.accent}
                data-reveal
              >
                <div className={styles.media}>
                  <span className={styles.indexBadge}>{item.index}</span>
                  <ImageSlot
                    src={shot.src}
                    alt=""
                    caption={item.title}
                    width={shot.width}
                    height={shot.height}
                  />
                </div>
                <div className={styles.content}>
                  <h3 className={styles.cellTitle}>{item.title}</h3>
                  <p className={styles.cellBody}>{item.body}</p>
                  {isWarm && (
                    <span className={styles.ecoChip} aria-hidden="true">
                      <Leaf weight="bold" className={styles.ecoIcon} />
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className={styles.ctaRow}>
          <a className={styles.outlineCta} href={ctaUrl} data-reveal>
            {fitur.ctaLabel}
            <ArrowRight weight="bold" className={styles.arrow} aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}
