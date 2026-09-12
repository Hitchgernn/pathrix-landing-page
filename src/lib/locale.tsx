import { createContext, useContext, type ReactNode } from "react";
import { id } from "../content/id";
import { en } from "../content/en";
import { DEFAULT_LOCALE, type Copy, type Locale } from "../content/types";

const COPY: Record<Locale, Copy> = { id, en };

const LocaleContext = createContext<Locale>(DEFAULT_LOCALE);

export function LocaleProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: ReactNode;
}) {
  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>;
}

export function useLocale(): Locale {
  return useContext(LocaleContext);
}

export function useCopy(): Copy {
  return COPY[useContext(LocaleContext)];
}

/**
 * Writes the override before the navigation completes, so a manual choice
 * always beats the automatic browser-language detection on the next visit —
 * see the detection script the prerender injects into <head>. Shared by every
 * language switch on the page (Nav, Footer) so they all agree on the key.
 */
export function rememberLocale(locale: Locale): void {
  try {
    localStorage.setItem("pathrix.lang", locale);
  } catch {
    /* storage unavailable (private browsing, quota) — navigation still works */
  }
}

/**
 * Reads the locale the server already committed to, off the document it
 * rendered — never re-detected client-side. Re-detecting here would let the
 * client disagree with the prerendered markup and either mismatch on
 * hydration or flash the wrong language.
 */
export function localeFromDocument(): Locale {
  const lang = document.documentElement.lang;
  if (lang === "id") return "id";
  // Dev server always serves the raw, English index.html regardless of path —
  // there is no real prerendered /id/ to hit locally, so the ID/EN nav links
  // would otherwise change the URL without changing anything on screen. Two
  // dev-only ways around that, both compiled out of production: an explicit
  // ?lang=id query param, or just navigating to /id/ (what clicking "ID"
  // actually does), which this checks directly since the raw HTML's <html
  // lang> can't reflect it the way a real prerendered page would.
  if (import.meta.env.DEV) {
    if (new URLSearchParams(location.search).get("lang") === "id") return "id";
    if (location.pathname === "/id" || location.pathname.startsWith("/id/")) return "id";
  }
  return DEFAULT_LOCALE;
}
