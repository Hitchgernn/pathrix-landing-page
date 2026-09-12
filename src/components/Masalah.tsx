import { Airplane, Users } from "@phosphor-icons/react";
import styles from "./Masalah.module.css";
import { useCopy } from "../lib/locale";

/** One icon per stat, by index: 0 = population/migration influx, 1 = tourist arrivals. */
const STAT_ICONS = [Users, Airplane];

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
          <blockquote className={styles.quote} data-reveal>
            {masalah.paraTwo.before}
            <em className={styles.emphasis}>{masalah.paraTwo.emphasis}</em>
            {masalah.paraTwo.after}
          </blockquote>
          <dl className={styles.stats} data-reveal>
            {masalah.stats.map((stat, i) => {
              const StatIcon = STAT_ICONS[i];
              return (
                <div key={stat.label} className={styles.stat}>
                  <StatIcon className={styles.statIcon} weight="bold" aria-hidden="true" />
                  <dt className={styles.statValue}>{stat.value}</dt>
                  <dd className={styles.statLabel}>
                    {stat.label}
                    <span className={styles.statSource}>{stat.source}</span>
                  </dd>
                </div>
              );
            })}
          </dl>
        </div>
      </div>
    </section>
  );
}
