import { resolveScroller } from "./scroll";

/**
 * Scroll reveals.
 *
 * Everything here is `gsap.from` — never `.to`. The page ships fully visible in
 * its final state; GSAP only animates *into* it. If GSAP fails to load, is
 * blocked by an extension, or throws, the design is still complete and fully
 * readable — just unanimated. That is why GSAP is imported dynamically and every
 * call site is guarded: a missing animation library must never be fatal.
 */

const REVEAL = { y: 34, opacity: 0, duration: 0.9, ease: "power3.out" } as const;

export type RevealHandle = { destroy: () => void };

export async function initReveals(root: HTMLElement): Promise<RevealHandle> {
  const timeouts: number[] = [];
  let cleanup: () => void = () => {};

  try {
    const [{ gsap }, { ScrollTrigger }] = await Promise.all([
      import("gsap"),
      import("gsap/ScrollTrigger"),
    ]);

    gsap.registerPlugin(ScrollTrigger);

    // Resolve the real scroll container before creating any trigger. If the body
    // is the scroll box rather than the window, triggers measured against the
    // window never fire.
    const scroller = resolveScroller();
    if (scroller) ScrollTrigger.defaults({ scroller });

    // Hero fires on load, not on scroll — it is already in view.
    const hero = root.querySelectorAll("[data-hero-reveal]");
    if (hero.length) {
      gsap.from(hero, {
        y: 30,
        opacity: 0,
        duration: 1.05,
        ease: "power3.out",
        stagger: 0.09,
        delay: 0.15,
      });
    }

    const targets = root.querySelectorAll("[data-reveal]");
    if (targets.length) {
      ScrollTrigger.batch(targets, {
        start: "top 88%",
        onEnter: (batch) => gsap.from(batch, { ...REVEAL, stagger: 0.09 }),
      });
    }

    // Fonts and images landing late change element positions.
    const refresh = () => ScrollTrigger.refresh();
    timeouts.push(window.setTimeout(refresh, 300));
    document.fonts?.ready.then(refresh).catch(() => {});

    cleanup = () => {
      try {
        ScrollTrigger.getAll().forEach((t) => t.kill());
      } catch {
        /* already gone */
      }
    };
  } catch (error) {
    // Blocked, offline, or otherwise unavailable. The page is already in its
    // final visible state, so there is nothing to repair.
    console.warn("[pathrix] reveal animations unavailable:", error);
  }

  return {
    destroy() {
      timeouts.forEach((t) => window.clearTimeout(t));
      cleanup();
    },
  };
}
