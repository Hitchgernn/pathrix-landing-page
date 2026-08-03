import styles from "./Fitur.module.css";
import { ImageSlot } from "./ImageSlot";
import { ctaUrl, fitur, productShot } from "../content/site";

/** Heading + outline link, the concept visual, the hairline feature grid. */
export function Fitur() {
  return (
    <section id="fitur" className={styles.section} aria-labelledby="fitur-heading">
      <div className={styles.shell}>
        <div className={styles.head}>
          <div className={styles.headingCol}>
            <span className={styles.eyebrow} data-reveal>
              {fitur.eyebrow}
            </span>
            <h2 id="fitur-heading" className={styles.heading} data-reveal>
              {fitur.heading}
            </h2>
          </div>
          <a className={styles.outlineCta} href={ctaUrl} data-reveal>
            {fitur.ctaLabel}
            <span className={styles.arrow} aria-hidden="true">
              &#8594;
            </span>
          </a>
        </div>

        {/*
          The image is generated placeholder art, not a capture of a shipped
          product — the figcaption states that on the page itself.
        */}
        <figure className={styles.shotBlock} data-reveal>
          <div className={styles.shot}>
            <ImageSlot
              src={productShot.src}
              alt={productShot.alt}
              caption={productShot.caption}
              width={productShot.width}
              height={productShot.height}
            />
          </div>
          <figcaption className={styles.shotNote}>{productShot.note}</figcaption>
        </figure>

        <div className={styles.grid}>
          {fitur.items.map((item) => (
            <div key={item.index} className={styles.cell} data-reveal>
              <span className={styles.cellIndex} data-accent={item.accent}>
                {item.index}
              </span>
              <h3 className={styles.cellTitle}>{item.title}</h3>
              <p className={styles.cellBody}>{item.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
