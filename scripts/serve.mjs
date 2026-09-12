/**
 * Static server for dist/ that applies the cache policy from public/_headers and
 * gzips text responses — i.e. behaves like the real host rather than like
 * `vite preview`.
 *
 * Exists so the caching and payload claims are actually verifiable locally
 * instead of being unverified host config.
 *
 *   node scripts/serve.mjs [port]
 */
import { createServer } from "node:http";
import { createReadStream, existsSync, readFileSync, statSync } from "node:fs";
import { extname, join, resolve } from "node:path";
import { gzipSync } from "node:zlib";
import { createHash } from "node:crypto";

const ROOT = resolve(import.meta.dirname, "../dist");
const PORT = Number(process.argv[2] || 4174);

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".glb": "model/gltf-binary",
  ".woff2": "font/woff2",
  ".otf": "font/otf",
  ".ttf": "font/ttf",
  ".json": "application/json; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
};

// .glb is in here on purpose. meshopt's encoding is byte-filtered specifically so
// that a general-purpose compressor can still work on it — gzip takes the Tugu
// model from 153KB to 94KB. Do not assume "already compressed" and drop it.
const COMPRESSIBLE = new Set([".html", ".js", ".css", ".svg", ".json", ".txt", ".glb"]);

/** Minimal _headers parser: "/path/glob" followed by indented "Key: value" lines. */
function parseHeaders(file) {
  if (!existsSync(file)) return [];
  const rules = [];
  let current = null;
  for (const raw of readFileSync(file, "utf8").split("\n")) {
    if (!raw.trim() || raw.trim().startsWith("#")) continue;
    if (!/^\s/.test(raw)) {
      current = { pattern: raw.trim(), headers: {} };
      rules.push(current);
    } else if (current) {
      const i = raw.indexOf(":");
      if (i > 0) current.headers[raw.slice(0, i).trim()] = raw.slice(i + 1).trim();
    }
  }
  return rules;
}

const RULES = parseHeaders(join(ROOT, "_headers"));

function headersFor(urlPath) {
  const out = {};
  for (const rule of RULES) {
    const p = rule.pattern;
    const match =
      p === urlPath ||
      (p.endsWith("/*") && urlPath.startsWith(p.slice(0, -1))) ||
      (p === "/*" ) ||
      (p === "/" && urlPath === "/index.html");
    if (match) Object.assign(out, rule.headers);
  }
  return out;
}

createServer((req, res) => {
  let urlPath = decodeURIComponent(new URL(req.url, "http://x").pathname);

  // Bare "/id" is a directory on disk, so without this it would fall through
  // to the SPA-fallback branch below and silently serve the English page.
  if (urlPath === "/id") {
    res.writeHead(301, { Location: "/id/" });
    res.end();
    return;
  }

  if (urlPath.endsWith("/")) urlPath += "index.html";

  let file = join(ROOT, urlPath);
  if (!existsSync(file) || statSync(file).isDirectory()) {
    // Single page app: unknown paths fall back to the prerendered shell.
    file = join(ROOT, "index.html");
    urlPath = "/index.html";
  }

  const ext = extname(file);
  const body = readFileSync(file);
  const etag = `"${createHash("sha1").update(body).digest("hex").slice(0, 20)}"`;

  const headers = {
    "Content-Type": TYPES[ext] || "application/octet-stream",
    ETag: etag,
    ...headersFor(urlPath),
  };
  if (!headers["Cache-Control"]) headers["Cache-Control"] = "public, max-age=0, must-revalidate";

  // Conditional request: this is what makes a repeat visit cheap.
  if (req.headers["if-none-match"] === etag) {
    res.writeHead(304, headers);
    res.end();
    return;
  }

  let payload = body;
  if (COMPRESSIBLE.has(ext) && /\bgzip\b/.test(req.headers["accept-encoding"] || "")) {
    payload = gzipSync(body, { level: 9 });
    headers["Content-Encoding"] = "gzip";
    headers.Vary = "Accept-Encoding";
  }
  headers["Content-Length"] = payload.length;

  res.writeHead(200, headers);
  res.end(req.method === "HEAD" ? undefined : payload);
}).listen(PORT, () => {
  console.log(`serving dist/ on http://localhost:${PORT} (with _headers + gzip)`);
  if (!RULES.length) console.warn("warning: no _headers rules found in dist/");
});
