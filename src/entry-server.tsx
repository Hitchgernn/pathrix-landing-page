import { renderToStaticMarkup } from "react-dom/server";
import App from "./App";
import { id } from "./content/id";
import { en } from "./content/en";
import type { Copy, Locale } from "./content/types";

const COPY: Record<Locale, Copy> = { id, en };

/**
 * Build-time prerender. The page must be fully readable with JavaScript
 * disabled, so the markup is baked into index.html rather than being assembled
 * in the browser. Hydration then attaches the behaviour (nav inversion, menu,
 * form, diorama) on top of markup that is already complete.
 *
 * Called once per locale by scripts/prerender.mjs.
 */
export function render(locale: Locale): string {
  return renderToStaticMarkup(<App locale={locale} />);
}

/**
 * scripts/prerender.mjs runs as plain Node and cannot import .ts content
 * modules directly — it reaches the per-locale <title>/<meta> strings through
 * this SSR-bundled export instead, the same esbuild transform that compiles
 * App.
 */
export function meta(locale: Locale): Copy["meta"] {
  return COPY[locale].meta;
}
