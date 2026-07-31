/**
 * Confirms the render loop actually pauses when the hero leaves the viewport,
 * and resumes when it comes back. Counts real WebGL draw calls by wrapping
 * drawElements/drawArrays on the context prototype before the scene is built.
 */
import { chromium } from "playwright";
import { existsSync } from "node:fs";

const BASE = process.env.VERIFY_URL || "http://localhost:4173";
const executablePath = [
  `${process.env.HOME}/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome`,
  `${process.env.HOME}/.cache/ms-playwright/chromium-1208/chrome-linux64/chrome`,
].find((p) => existsSync(p));

const browser = await chromium.launch({
  executablePath,
  args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

await page.addInitScript(() => {
  window.__draws = 0;
  for (const proto of [
    window.WebGL2RenderingContext?.prototype,
    window.WebGLRenderingContext?.prototype,
  ]) {
    if (!proto) continue;
    for (const fn of ["drawElements", "drawArrays"]) {
      const original = proto[fn];
      if (!original) continue;
      proto[fn] = function (...args) {
        window.__draws++;
        return original.apply(this, args);
      };
    }
  }
});

await page.goto(BASE, { waitUntil: "networkidle" });
await page.waitForTimeout(2500);

const sample = async (label, ms = 1000) => {
  const before = await page.evaluate(() => window.__draws);
  await page.waitForTimeout(ms);
  const after = await page.evaluate(() => window.__draws);
  const delta = after - before;
  console.log(`${label}: ${delta} draw calls over ${ms}ms`);
  return delta;
};

await page.evaluate(() => (document.documentElement.style.scrollBehavior = "auto"));

const atTop = await sample("hero in view");

await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
await page.waitForTimeout(1600);
const scrolledAway = await sample("hero scrolled off-screen");

await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(1200);
const backAtTop = await sample("scrolled back to hero");

console.log("\nRESULT");
console.log(`  running in view:      ${atTop > 20 ? "PASS" : "FAIL"} (${atTop})`);
console.log(`  paused off-screen:    ${scrolledAway === 0 ? "PASS" : "FAIL"} (${scrolledAway})`);
console.log(`  resumed on return:    ${backAtTop > 20 ? "PASS" : "FAIL"} (${backAtTop})`);

await browser.close();
process.exit(atTop > 20 && scrolledAway === 0 && backAtTop > 20 ? 0 : 1);
