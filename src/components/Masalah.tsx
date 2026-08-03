import styles from "./Masalah.module.css";
import { useCopy } from "../lib/locale";

/** Ink section, two columns: heading left, two paragraphs right. No anchor. */
export function Masalah() {
  const { masalah } = useCopy();
  return (
    <section className={styles.section} aria-labelledby="masalah-heading">
      <div className={styles.seam} aria-hidden="true" />
      <div className={styles.shell}>
        <div className={styles.headingCol}>
          <span className={styles.eyebrow} data-reveal>
            {masalah.eyebrow}
          </span>
          <h2 id="masalah-heading" className={styles.heading} data-reveal>
            {masalah.heading}
          </h2>
        </div>
        <div className={styles.bodyCol}>
          <p className={styles.body} data-reveal>
            {masalah.paraOne}
          </p>
          <p className={styles.body} data-reveal>
            {masalah.paraTwo.before}
            <em className={styles.emphasis}>{masalah.paraTwo.emphasis}</em>
            {masalah.paraTwo.after}
          </p>
        </div>
      </div>
    </section>
  );
}
