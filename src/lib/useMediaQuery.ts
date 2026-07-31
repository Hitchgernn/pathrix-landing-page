import { useEffect, useState } from "react";

/**
 * Matches a media query. Initial value is read synchronously so the first paint
 * is already correct — the nav must not flash the wrong variant.
 */
export function useMediaQuery(query: string): boolean {
  const read = () =>
    typeof window !== "undefined" && typeof window.matchMedia === "function"
      ? window.matchMedia(query).matches
      : false;

  const [matches, setMatches] = useState(read);

  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;
    const list = window.matchMedia(query);
    const onChange = () => setMatches(list.matches);
    onChange();
    list.addEventListener("change", onChange);
    return () => list.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}

/** Breakpoint 1: nav collapses, hero tagline wraps. */
export const WIDE_NAV_QUERY = "(min-width: 900px)";
/** Breakpoint 2: the three steps share a row, so the connector can be drawn. */
export const STEP_ROW_QUERY = "(min-width: 1040px)";

export function usePrefersReducedMotion(): boolean {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}
