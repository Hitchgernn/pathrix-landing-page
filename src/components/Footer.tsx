import styles from "./Footer.module.css";
import { navLinks } from "../content/site";
import { useCopy, useLocale } from "../lib/locale";

/**
 * Writes the override before the navigation completes, so a manual choice
 * always beats the automatic browser-language detection on the next visit —
 * see the detection script the prerender injects into <head>.
 */
function rememberLocale(locale: "id" | "en") {
  try {
    localStorage.setItem("pathrix.lang", locale);
  } catch {
    /* storage unavailable (private browsing, quota) — navigation still works */
  }
}

export function Footer() {
  const { footer, navLabels, ui } = useCopy();
  const locale = useLocale();
  return (
    <footer className={styles.footer}>
      <div className={styles.shell}>
        <div className={styles.brand}>
          <span className={styles.mark}>PATHRIX</span>
          <span className={styles.competition}>{footer.competition}</span>
          {/* Attribution is a licence condition on the diorama's Tugu model,
              not decoration — see AGENTS.md. Do not remove it. */}
          <span className={styles.credit}>
            {/* No {" "} separator: entry-server.tsx renders with
                renderToStaticMarkup, which emits no <!-- --> markers, so two
                adjacent text nodes cannot hydrate. The gap is CSS. */}
            {footer.modelCredit}
            <a
              className={styles.creditLink}
              href="https://sketchfab.com/Djonk"
              rel="noopener noreferrer nofollow"
              target="_blank"
            >
              sketchfab.com/Djonk
            </a>
          </span>
        </div>
        <nav className={styles.links} aria-label={ui.footerNavAriaLabel}>
          {navLinks.map(({ id }) => (
            <a key={id} href={`#${id}`} className={styles.link}>
              {navLabels[id]}
            </a>
          ))}
          <span className={styles.langGroup} aria-label={ui.langSwitchAriaLabel}>
            <a
              href="/"
              className={styles.langLink}
              data-active={locale === "id"}
              onClick={() => rememberLocale("id")}
            >
              ID
            </a>
            <a
              href="/en/"
              className={styles.langLink}
              data-active={locale === "en"}
              onClick={() => rememberLocale("en")}
            >
              EN
            </a>
          </span>
        </nav>
      </div>
    </footer>
  );
}
