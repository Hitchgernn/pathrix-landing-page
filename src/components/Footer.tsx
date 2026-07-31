import styles from "./Footer.module.css";
import { footer, navLinks } from "../content/site";

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.shell}>
        <div className={styles.brand}>
          <span className={styles.mark}>PATHRIX</span>
          <span className={styles.competition}>{footer.competition}</span>
        </div>
        <nav className={styles.links} aria-label="Navigasi footer">
          {navLinks.map(({ id, label }) => (
            <a key={id} href={`#${id}`} className={styles.link}>
              {label}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  );
}
