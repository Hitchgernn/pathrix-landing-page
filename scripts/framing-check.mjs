/**
 * Confirms the rotated diorama is still well framed: the island silhouette must
 * stay horizontally centred and occupy a sensible share of the canvas. If the
 * scene geometry were not authored around the origin, a 120deg turn would swing
 * it off-frame — this catches that.
 *
 * Also samples the Fitur imagery to confirm the files decode to real content
 * rather than a flat block.
 */
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
await page.goto("http://localhost:4173", { waitUntil: "networkidle" });
await page.waitForTimeout(3500);

const framing = await page.evaluate(() => {
  const cv = document.querySelector("#beranda canvas");
  if (!cv) return null;
  const W = 240;
  const H = 240;
  const probe = document.createElement("canvas");
  probe.width = W;
  probe.height = H;
  const g = probe.getContext("2d");
  g.drawImage(cv, 0, 0, W, H);
  const { data } = g.getImageData(0, 0, W, H);

  let minX = W;
  let maxX = -1;
  let minY = H;
  let maxY = -1;
  let opaque = 0;
  let sumX = 0;

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      if (data[(y * W + x) * 4 + 3] > 24) {
        opaque++;
        sumX += x;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  return {
    coverage: +(opaque / (W * H)).toFixed(3),
    centroidX: +(sumX / opaque / W).toFixed(3),
    spanX: +((maxX - minX) / W).toFixed(3),
    spanY: +((maxY - minY) / H).toFixed(3),
    leftEdge: +(minX / W).toFixed(3),
    rightEdge: +(maxX / W).toFixed(3),
  };
});

console.log("island framing:", JSON.stringify(framing));
const centred = Math.abs(framing.centroidX - 0.5) < 0.08;
console.log(
  `  horizontally centred: ${centred ? "PASS" : "FAIL"} (centroid x=${framing.centroidX})`,
);
console.log(
  `  fills the frame:      ${framing.spanX > 0.7 ? "PASS" : "FAIL"} (spanX=${framing.spanX})`,
);
console.log(
  `  sensible coverage:    ${framing.coverage > 0.12 && framing.coverage < 0.75 ? "PASS" : "FAIL"} (${framing.coverage})`,
);

// --- image content check -----------------------------------------------------
await page.evaluate(() => {
  document.documentElement.style.scrollBehavior = "auto";
  document.getElementById("fitur")?.scrollIntoView({ block: "start" });
});
await page.waitForTimeout(2500);

const imgs = await page.evaluate(() =>
  [...document.querySelectorAll("#fitur img")].map((img) => {
    const c = document.createElement("canvas");
    c.width = 40;
    c.height = 40;
    const g = c.getContext("2d");
    g.drawImage(img, 0, 0, 40, 40);
    const { data } = g.getImageData(0, 0, 40, 40);
    // Standard deviation of luminance: a flat placeholder scores near zero.
    const lums = [];
    for (let i = 0; i < data.length; i += 4) {
      lums.push(0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]);
    }
    const mean = lums.reduce((a, b) => a + b, 0) / lums.length;
    const sd = Math.sqrt(lums.reduce((a, b) => a + (b - mean) ** 2, 0) / lums.length);
    return {
      src: (img.currentSrc || img.src).split("/").pop(),
      w: img.naturalWidth,
      h: img.naturalHeight,
      sd: +sd.toFixed(1),
    };
  }),
);

console.log("\nFitur imagery:");
for (const i of imgs) {
  console.log(
    `  ${i.src.padEnd(16)} ${String(i.w).padStart(4)}x${String(i.h).padEnd(4)} detail(sd)=${i.sd} ${i.sd > 12 ? "PASS" : "FAIL (looks flat)"}`,
  );
}

await browser.close();
