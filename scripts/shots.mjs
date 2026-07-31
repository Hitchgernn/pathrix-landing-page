/** Captures reference screenshots into scripts/shots/ for visual review. */
import { chromium } from "playwright";
import { existsSync, mkdirSync } from "node:fs";

const OUT = new URL("./shots/", import.meta.url);
mkdirSync(OUT, { recursive: true });

const exe = [
  `${process.env.HOME}/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome`,
  `${process.env.HOME}/.cache/ms-playwright/chromium-1208/chrome-linux64/chrome`,
].find(existsSync);

const browser = await chromium.launch({
  executablePath: exe,
  args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
});

const shots = [
  { name: "hero-1440", w: 1440, h: 900, to: "#beranda" },
  { name: "hero-390", w: 390, h: 844, to: "#beranda" },
  { name: "fitur-1440", w: 1440, h: 900, to: "#fitur" },
  { name: "fitur-390", w: 390, h: 844, to: "#fitur" },
  { name: "kontak-320", w: 320, h: 800, to: "#kontak" },
];

for (const s of shots) {
  const page = await browser.newPage({ viewport: { width: s.w, height: s.h } });
  await page.goto("http://localhost:4173", { waitUntil: "networkidle" });
  await page.waitForTimeout(3200);
  await page.evaluate((sel) => {
    document.documentElement.style.scrollBehavior = "auto";
    if (sel !== "#beranda") document.querySelector(sel)?.scrollIntoView({ block: "start" });
  }, s.to);
  await page.waitForTimeout(1600);
  await page.screenshot({ path: new URL(`${s.name}.png`, OUT).pathname });
  console.log("captured", s.name);
  await page.close();
}

await browser.close();
