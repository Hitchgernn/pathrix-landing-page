/**
 * Scroll plumbing shared by the nav and the GSAP setup.
 *
 * Some embedding contexts make `document.body` the scrolling box rather than
 * the window. Reading only `window.scrollY` there returns 0 forever, so the nav
 * never inverts and ScrollTrigger measures against the wrong element.
 */

/** Scroll offset that works whichever element is actually the scroll box. */
export function currentScrollY(): number {
  return Math.max(
    window.scrollY || 0,
    document.scrollingElement?.scrollTop ?? 0,
    document.body?.scrollTop ?? 0,
  );
}

/**
 * Returns `document.body` when the body is the real scroll container,
 * otherwise null (meaning: use the default window scroller).
 */
export function resolveScroller(): HTMLElement | null {
  const doc = document.documentElement;
  const body = document.body;
  if (!body) return null;

  const docScrolls = doc.scrollHeight > doc.clientHeight + 1;
  const bodyScrolls = body.scrollHeight > body.clientHeight + 1;

  if (!docScrolls && bodyScrolls) return body;

  // An explicit overflow on body also makes it the scroll box.
  const overflowY = getComputedStyle(body).overflowY;
  if (!docScrolls && (overflowY === "auto" || overflowY === "scroll")) return body;

  return null;
}

/** Viewport height that tolerates a zero-height documentElement. */
export function viewportHeight(): number {
  return window.innerHeight || document.documentElement.clientHeight || 0;
}
