import { useEffect, useState } from "react";
import styles from "./Nav.module.css";
import { PathrixMark } from "./PathrixMark";
import { ctaUrl, navLinks, type SectionId } from "../content/site";
import { currentScrollY, viewportHeight } from "../lib/scroll";

/**
 * Fixed nav. Transparent over the hero, inverted to ink once scrolled past ~72%
 * of the first viewport. Below 900px the links collapse into a hamburger.
 *
 * Which variant shows is decided by CSS, not JS: the markup carries both, so the
 * bar is correct on first paint, correct when prerendered, and correct with
 * JavaScript disabled. JS only drives the inversion, the active link, and the
 * menu — all enhancements.
 */
export function Nav() {
  const [past, setPast] = useState(false);
  const [active, setActive] = useState<SectionId | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setPast(currentScrollY() > viewportHeight() * 0.72);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  // Close the menu if the viewport grows past the breakpoint.
  useEffect(() => {
    const list = window.matchMedia("(min-width: 900px)");
    const onChange = () => {
      if (list.matches) setMenuOpen(false);
    };
    list.addEventListener("change", onChange);
    return () => list.removeEventListener("change", onChange);
  }, []);

  // Active-section tracking. The band is the middle of the viewport, so the
  // indicator changes when a section actually occupies the reader's attention.
  useEffect(() => {
    const sections = navLinks
      .map(({ id }) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (!sections.length) return;

    const spy = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id as SectionId);
        }
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    sections.forEach((el) => spy.observe(el));
    return () => spy.disconnect();
  }, []);

  // Lock scrolling behind the full-screen menu.
  useEffect(() => {
    if (!menuOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  return (
    <>
      <nav className={styles.nav} data-past={past} aria-label="Navigasi utama">
        <a href="#beranda" className={styles.mark} aria-label="Pathrix, ke beranda">
          <PathrixMark className={styles.markLogo} />
        </a>

        <div className={styles.links}>
          {navLinks.map(({ id, label }) => (
            <a
              key={id}
              href={`#${id}`}
              className={styles.link}
              data-active={active === id}
              aria-current={active === id ? "true" : undefined}
            >
              {label}
            </a>
          ))}
        </div>

        <div className={styles.actions}>
          <a href={ctaUrl} className={styles.cta}>
            Jelajahi Peta
            <span className={styles.arrow} aria-hidden="true">
              &#8594;
            </span>
          </a>
          <button
            type="button"
            className={styles.burger}
            aria-label="Buka menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span />
            <span />
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div
          className={styles.menu}
          role="dialog"
          aria-modal="true"
          aria-label="Menu navigasi"
          onClick={() => setMenuOpen(false)}
        >
          {navLinks.map(({ id, label }) => (
            <a key={id} href={`#${id}`} className={styles.menuLink}>
              {label}
            </a>
          ))}
          <span className={styles.menuClose}>Tutup &times;</span>
        </div>
      )}
    </>
  );
}
