/**
 * Bakes the app's markup into dist/index.html after the client build.
 *
 * Reason: the page has to be fully readable with JavaScript disabled. A plain
 * Vite + React build ships an empty <div id="root">, which fails that outright.
 * Prerendering keeps the stack static (no server runtime) while making the HTML
 * self-sufficient — JS then hydrates it into the interactive version.
 */
import { build } from "vite";
import react from "@vitejs/plugin-react";
import { readFile, writeFile, rm, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const ssrOut = resolve(root, ".ssr-tmp");

// Build the server entry into a temporary SSR bundle.
await build({
  root,
  logLevel: "warn",
  plugins: [react()],
  resolve: { dedupe: ["three", "react", "react-dom"] },
  // Don't inherit the client build's manualChunks: in an SSR build three/gsap
  // are externals, and rollup refuses to chunk externals.
  configFile: false,
  build: {
    ssr: resolve(root, "src/entry-server.tsx"),
    outDir: ssrOut,
    emptyOutDir: true,
    target: "node18",
    rollupOptions: { output: { format: "esm", entryFileNames: "entry-server.mjs" } },
  },
});

const { render, meta } = await import(resolve(ssrOut, "entry-server.mjs"));

const templatePath = resolve(root, "dist/index.html");
const template = await readFile(templatePath, "utf8");

/**
 * Absolute origin for hreflang alternates — search engines don't credit
 * relative ones. Unset until a domain is assigned; see AGENTS.md's "Still
 * unresolved" list. Emits root-relative hrefs instead of inventing a value.
 */
const SITE_URL = (process.env.VITE_SITE_URL || "").replace(/\/$/, "");
if (!SITE_URL) {
  console.warn(
    "prerender: VITE_SITE_URL is unset — hreflang alternates will be root-relative, which search engines may not credit. See AGENTS.md.",
  );
}
const abs = (path) => (SITE_URL ? `${SITE_URL}${path}` : path);

const LOCALES = [
  { locale: "en", path: "/", outPath: "dist/index.html" },
  { locale: "id", path: "/id/", outPath: "dist/id/index.html" },
];

/** Replaces exactly once; throws instead of silently no-op'ing a stale pattern. */
function mustReplace(html, pattern, replacement, label) {
  if (!pattern.test(html)) throw new Error(`prerender: pattern for "${label}" not found`);
  return html.replace(pattern, replacement);
}

for (const { locale, path, outPath } of LOCALES) {
  const copyMeta = meta(locale);
  const appHtml = render(locale);

  const hreflang = [
    { hreflang: "en", href: abs("/") },
    { hreflang: "id", href: abs("/id/") },
    { hreflang: "x-default", href: abs("/") },
  ]
    .map((l) => `    <link rel="alternate" hreflang="${l.hreflang}" href="${l.href}" />`)
    .join("\n");

  let html = template;
  html = mustReplace(html, /<!--app-html-->/, appHtml, "app-html");
  html = mustReplace(html, /<html lang="[^"]*">/, `<html lang="${locale}">`, "html lang");
  html = mustReplace(html, /<title>[^<]*<\/title>/, `<title>${copyMeta.title}</title>`, "title");
  html = mustReplace(
    html,
    /<meta\s+name="description"\s+content="[^"]*"\s*\/>/,
    `<meta name="description" content="${copyMeta.description}" />`,
    "meta description",
  );
  html = mustReplace(
    html,
    /<meta property="og:title" content="[^"]*" \/>/,
    `<meta property="og:title" content="${copyMeta.ogTitle}" />`,
    "og:title",
  );
  html = mustReplace(
    html,
    /<meta\s+property="og:description"\s+content="[^"]*"\s*\/>/,
    `<meta property="og:description" content="${copyMeta.ogDescription}" />`,
    "og:description",
  );
  html = mustReplace(html, /<!--hreflang-links-->/, hreflang, "hreflang-links");
  html = mustReplace(html, /<!--lang-detect-->/, buildDetectScript(), "lang-detect");

  const outFile = resolve(root, outPath);
  await mkdir(dirname(outFile), { recursive: true });
  await writeFile(outFile, html, "utf8");
  console.log(`prerendered ${appHtml.length} bytes of markup into ${outPath} (${path})`);
}

await rm(ssrOut, { recursive: true, force: true });

/**
 * Runs before first paint, so it has to be synchronous and inline. A stored
 * override always wins over detection; `location.replace` (never a 3xx) so
 * Back leaves the site instead of bouncing between locales, and a
 * sessionStorage guard stops a same-tab redirect loop if detection and the
 * served page ever disagree twice in a row.
 */
function buildDetectScript() {
  return `<script>(function(){
  try {
    var STORE = "pathrix.lang";
    var GUARD = "pathrix.lang.redirected";
    var here = location.pathname.indexOf("/id/") === 0 ? "id" : "en";
    var stored = localStorage.getItem(STORE);
    var target = stored === "en" || stored === "id" ? stored : null;
    if (!target) {
      var langs = navigator.languages || [navigator.language || "en"];
      target = "en";
      for (var i = 0; i < langs.length; i++) {
        var primary = String(langs[i]).slice(0, 2).toLowerCase();
        if (primary === "en") { target = "en"; break; }
        if (primary === "id") { target = "id"; break; }
      }
    }
    if (target !== here && !sessionStorage.getItem(GUARD)) {
      sessionStorage.setItem(GUARD, "1");
      location.replace(target === "id" ? "/id/" : "/");
    }
  } catch (e) { /* storage unavailable — stay on the served locale */ }
})();</script>`;
}
