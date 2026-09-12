import styles from "./Audiens.module.css";
import { ImageSlot } from "./ImageSlot";
import { audiensShots } from "../content/site";
import { useCopy } from "../lib/locale";

/**
 * Ink section, no anchor: heading, then a 2+2+1 bento — the first four
 * groups as standard image-forward cards, the UMKM & Pariwisata payoff group
 * as a full-width closing banner.
 *
 * Every group now carries its own curated illustration (`audiensShots`, same
 * low-poly style as the Hero diorama and Fitur's grid) in place of the
 * earlier icon-in-circle badges. The four standard cards share one identical
 * treatment: the shared 3:2 source runs near-uncropped across the top of the
 * card (see .media), title + body padded below. The banner gets its own
 * treatment instead of a forced copy of that stack: a full-width closer and a
 * ~400px card are different shapes, so the image instead runs alongside the
 * warm fill as a left/right split at desktop width (see .banner), stacking
 * image-over-text on narrow viewports — keeping the banner the section's
 * boldest, most distinct cell rather than a fifth lookalike card.
 *
 * The illustrations are decorative relative to the adjacent copy — every
 * label+body already states the persona and the scenario in full (e.g. the
 * Wisatawan body already names the andong/becak stop the image depicts), and
 * these are stylized scenario renders, not literal photography — so each
 * gets `alt=""`, the same call Fitur and CaraKerja made for photos from this
 * same pipeline.
 */
export function Audiens() {
  const { audiens } = useCopy();
  return (
    <section className={styles.section} aria-labelledby="audiens-heading">
      <div className={styles.shell}>
        <div className={styles.headingCol}>
          <span className={styles.eyebrow} data-reveal>
            {audiens.eyebrow}
          </span>
          <h2 id="audiens-heading" className={styles.heading} data-reveal>
            {audiens.heading}
          </h2>
        </div>

        <div className={styles.grid}>
          {audiens.groups.map((group, i) => {
            const shot = audiensShots[i];

            if (group.accent === "warm") {
              return (
                <div key={group.label} className={styles.banner} data-reveal>
                  <div className={styles.bannerMedia}>
                    <ImageSlot
                      src={shot.src}
                      alt=""
                      caption={group.label}
                      width={shot.width}
                      height={shot.height}
                    />
                  </div>
                  <div className={styles.bannerText}>
                    <h3 className={styles.bannerTitle}>{group.label}</h3>
                    <p className={styles.bannerBody}>{group.body}</p>
                  </div>
                </div>
              );
            }

            return (
              <div key={group.label} className={styles.cell} data-reveal>
                <div className={styles.media}>
                  <ImageSlot
                    src={shot.src}
                    alt=""
                    caption={group.label}
                    width={shot.width}
                    height={shot.height}
                  />
                </div>
                <div className={styles.content}>
                  <h3 className={styles.cellTitle}>{group.label}</h3>
                  <p className={styles.cellBody}>{group.body}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
