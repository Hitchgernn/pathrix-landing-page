import { useEffect, useRef, useState } from "react";
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
  const burgerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  /**
   * Dismissing the menu returns focus to the burger, but *following a link*
   * should leave focus at the destination instead of yanking it back to the top
   * of the page.
   */
  const followedLink = useRef(false);

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

  /**
   * Modal behaviour for the full-screen menu: lock the page behind it, move
   * focus in, keep Tab inside it, and hand focus back on dismiss. `aria-modal`
   * is a promise to assistive tech that the rest of the page is inert — without
   * the trap that promise is false, and a keyboard user tabs into a nav bar
   * they cannot see.
   */
  useEffect(() => {
    if (!menuOpen) return;

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusables = () =>
      Array.from(
        menuRef.current?.querySelectorAll<HTMLElement>("a[href], button") ?? [],
      );

    focusables()[0]?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        return;
      }
      if (e.key !== "Tab") return;

      const items = focusables();
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      const outside = !menuRef.current?.contains(document.activeElement);

      if (e.shiftKey && (outside || document.activeElement === first)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (outside || document.activeElement === last)) {
        e.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
      // On unmount React has already nulled the ref, so this cannot steal focus
      // from whatever replaced the nav.
      if (!followedLink.current) burgerRef.current?.focus();
      followedLink.current = false;
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
            ref={burgerRef}
            type="button"
            className={styles.burger}
            aria-label={menuOpen ? "Tutup menu" : "Buka menu"}
            aria-expanded={menuOpen}
            aria-controls="nav-menu"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span />
            <span />
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div
          ref={menuRef}
          id="nav-menu"
          className={styles.menu}
          role="dialog"
          aria-modal="true"
          aria-label="Menu navigasi"
          onClick={() => setMenuOpen(false)}
        >
          {navLinks.map(({ id, label }) => (
            <a
              key={id}
              href={`#${id}`}
              className={styles.menuLink}
              onClick={() => {
                followedLink.current = true;
              }}
            >
              {label}
            </a>
          ))}
          {/* A real button, not a styled span: the close affordance has to be
              reachable by keyboard and announced as an action. */}
          <button type="button" className={styles.menuClose} onClick={() => setMenuOpen(false)}>
            Tutup &times;
          </button>
        </div>
      )}
    </>
  );
}
