/**
 * Measures what the page actually costs a first-time visitor, and confirms a
 * repeat visit is served from cache.
 *
 * Note: `vite preview` does not apply public/_headers or vercel.json — those are
 * host config. This measures transfer weight and browser-level cache reuse; the
 * long-lived immutable headers have to be confirmed on the real host.
 */
import { chromium } from "playwright";
import { existsSync } from "node:fs";

const exe = [
  `${process.env.HOME}/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome`,
  `${process.env.HOME}/.cache/ms-playwright/chromium-1208/chrome-linux64/chrome`,
].find(existsSync);

const BASE = process.env.VERIFY_URL || "http://localhost:4174";

const browser = await chromium.launch({
  executablePath: exe,
  args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
});

// Reuse one context so the HTTP cache persists between the two loads.
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });

async function load(label) {
  const page = await ctx.newPage();
  const seen = [];
  page.on("response", async (r) => {
    const url = r.url();
    if (!url.startsWith("http")) return;
    // Over-the-wire bytes (post-gzip). A cache hit or 304 costs ~nothing.
    let size = 0;
    try {
      const sizes = await r.request().sizes();
      // Cache hits report negative/garbage body sizes, so clamp at 0 — a served
      // -from-cache response costs no bytes, which is exactly what we want to show.
      size = Math.max(0, sizes.responseBodySize || 0);
    } catch {
      /* aborted */
    }
    seen.push({
      url: url.replace(BASE, ""),
      status: r.status(),
      size,
      type: r.request().resourceType(),
    });
  });

  await page.goto(BASE, { waitUntil: "networkidle" });
  // The diorama mounts at requestIdleCallback (2s timeout) and only then fetches
  // the Tugu .glb, so a 3s window closed before the model request finished and
  // the cold total silently omitted it. Wait long enough to actually see it.
  await page.waitForTimeout(7000);
  // Reach the images too.
  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = "auto";
    document.getElementById("fitur")?.scrollIntoView({ block: "start" });
  });
  await page.waitForTimeout(3000);

  const local = seen.filter((s) => s.url.startsWith("/"));
  const byType = {};
  for (const s of local) byType[s.type] = (byType[s.type] || 0) + s.size;
  const total = local.reduce((a, b) => a + b.size, 0);
  const revalidated = local.filter((s) => s.status === 304).length;

  console.log(`\n=== ${label} ===`);
  console.log(
    `requests (same-origin): ${local.length}  |  304 Not Modified: ${revalidated}`,
  );
  for (const [t, b] of Object.entries(byType).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${t.padEnd(10)} ${(b / 1024).toFixed(1)} KB`);
  }
  console.log(`  TOTAL      ${(total / 1024).toFixed(1)} KB`);

  // What arrives before the hero is usable, i.e. excluding the deferred 3D chunk
  // and the below-the-fold imagery.
  // /hero/ joins the exclusions: the Tugu .glb is fetched by the diorama at idle,
  // after the hero wordmark has painted, so it is deferred weight like three.js
  // rather than something the first view waits on.
  const critical = local.filter(
    (s) =>
      !/three-|diorama-/.test(s.url) &&
      !s.url.startsWith("/img/") &&
      !s.url.startsWith("/hero/"),
  );
  console.log(
    `  critical path (no three.js, no imagery): ${(critical.reduce((a, b) => a + b.size, 0) / 1024).toFixed(1)} KB across ${critical.length} requests`,
  );

  await page.close();
  return { total, count: local.length };
}

const first = await load("cold load");
const second = await load("warm load (same context, HTTP cache primed)");

console.log(
  `\nrepeat-visit transfer: ${(second.total / 1024).toFixed(1)} KB vs ${(first.total / 1024).toFixed(1)} KB cold`,
);
console.log(
  second.total < first.total * 0.25
    ? "=> cache is being reused."
    : "=> little or no reuse — check the Cache-Control policy.",
);

await ctx.close();
await browser.close();
