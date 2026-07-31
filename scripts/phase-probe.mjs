/** Prints the diorama phase timings and any long tasks recorded on load. */
import { chromium } from "playwright";
import { existsSync } from "node:fs";

const exe = [
  `${process.env.HOME}/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome`,
  `${process.env.HOME}/.cache/ms-playwright/chromium-1208/chrome-linux64/chrome`,
].find(existsSync);

const browser = await chromium.launch({
  executablePath: exe,
  args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

await page.addInitScript(() => {
  window.__long = [];
  new PerformanceObserver((l) => {
    for (const e of l.getEntries()) window.__long.push(Math.round(e.duration));
  }).observe({ entryTypes: ["longtask"] });
});

page.on("console", (m) => {
  if (m.text().includes("[diorama]")) console.log(m.text());
});

await page.goto("http://localhost:4173/?dioramaPerf=1", { waitUntil: "networkidle" });
await page.waitForTimeout(6000);

const out = await page.evaluate(() => ({
  long: window.__long,
  sum: window.__long.reduce((a, b) => a + b, 0),
}));
console.log("\nlong tasks:", out.long.join(", "));
console.log("sum:", out.sum, "ms");

await browser.close();
