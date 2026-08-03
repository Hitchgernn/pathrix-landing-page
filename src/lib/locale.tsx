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
 * Reads the locale the server already committed to, off the document it
 * rendered — never re-detected client-side. Re-detecting here would let the
 * client disagree with the prerendered markup and either mismatch on
 * hydration or flash the wrong language.
 */
export function localeFromDocument(): Locale {
  const lang = document.documentElement.lang;
  if (lang === "en") return "en";
  // Dev server always serves the raw, Indonesian index.html, so there is no
  // real /en/ to hit locally. This override makes English testable at
  // localhost:5174/?lang=en and compiles out of production entirely.
  if (import.meta.env.DEV && new URLSearchParams(location.search).get("lang") === "en") {
    return "en";
  }
  return DEFAULT_LOCALE;
}
