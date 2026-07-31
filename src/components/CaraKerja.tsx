import styles from "./CaraKerja.module.css";
import { caraKerja } from "../content/site";

/**
 * Three steps in one row with a hairline connector that draws itself on scroll.
 * The connector is hidden below 1040px in CSS — below that the steps no longer
 * share a row and the line would cut across stacked cards. It stays in the DOM
 * so GSAP's target never disappears mid-animation.
 */
export function CaraKerja() {
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

        <div className={styles.steps}>
          <div className={styles.track} aria-hidden="true">
            <div className={styles.draw} data-draw />
          </div>

          <div className={styles.grid}>
            {caraKerja.steps.map((step) => (
              <div key={step.index} className={styles.step} data-reveal>
                <div className={styles.markerRow}>
                  <span className={styles.marker} data-accent={step.accent}>
                    {step.index}
                  </span>
                </div>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepBody}>{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
