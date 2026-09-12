import styles from "./Footer.module.css";
import { navLinks, contactEmail } from "../content/site";
import { useCopy, useLocale, rememberLocale } from "../lib/locale";

/**
 * Massive typography & clean links: the giant "MAPS THAT THINK!" wordmark
 * spans the shell, then one quiet links row (nav + language switch), then
 * credits and the mailto CTA. `team`/`techStack` (site.ts) are deliberately
 * not shown here anymore — replaced by `footer.creditName`/`university`.
 */
export function Footer() {
  const { footer, navLabels, ui } = useCopy();
  const locale = useLocale();
  return (
    <footer className={styles.footer}>
      <div className={styles.shell}>
        <h2 className={styles.giant} data-reveal>
          {footer.giantText}
        </h2>

        <div className={styles.linksRow} data-reveal>
          <nav className={styles.links} aria-label={ui.footerNavAriaLabel}>
            {navLinks.map(({ id }) => (
              <a key={id} href={`#${id}`} className={styles.link}>
                {navLabels[id]}
              </a>
            ))}
          </nav>
          <span className={styles.langGroup} aria-label={ui.langSwitchAriaLabel}>
            <a
              href="/id/"
              className={styles.langLink}
              data-active={locale === "id"}
              onClick={() => rememberLocale("id")}
            >
              ID
            </a>
            <a
              href="/"
              className={styles.langLink}
              data-active={locale === "en"}
              onClick={() => rememberLocale("en")}
            >
              EN
            </a>
          </span>
        </div>

        <div className={styles.bottom} data-reveal>
          <p className={styles.credit}>
            {footer.creditLabel} | {footer.university}
          </p>
          <a className={styles.cta} href={`mailto:${contactEmail}`}>
            {footer.ctaLabel}: {contactEmail}
          </a>
        </div>

        {/* Attribution is a licence condition on the diorama's Tugu model,
            not decoration — see AGENTS.md. Do not remove it. */}
        <p className={styles.modelCredit}>
          {/* No {" "} separator: entry-server.tsx renders with
              renderToStaticMarkup, which emits no <!-- --> markers, so two
              adjacent text nodes cannot hydrate. The gap is CSS. */}
          {footer.modelCredit}
          <a
            className={styles.modelCreditLink}
            href="https://sketchfab.com/Djonk"
            rel="noopener noreferrer nofollow"
            target="_blank"
          >
            sketchfab.com/Djonk
          </a>
        </p>
      </div>
    </footer>
  );
}
