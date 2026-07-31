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
import { readFile, writeFile, rm } from "node:fs/promises";
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

const { render } = await import(resolve(ssrOut, "entry-server.mjs"));
const html = render();

const indexPath = resolve(root, "dist/index.html");
const template = await readFile(indexPath, "utf8");

if (!template.includes("<!--app-html-->")) {
  throw new Error("index.html is missing the <!--app-html--> placeholder");
}

await writeFile(indexPath, template.replace("<!--app-html-->", html), "utf8");
await rm(ssrOut, { recursive: true, force: true });

console.log(`prerendered ${html.length} bytes of markup into dist/index.html`);
