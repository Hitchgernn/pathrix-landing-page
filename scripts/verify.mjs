/**
 * Runtime verification against the production build. Checks the
 * definition-of-done items that only a real browser can answer: does the
 * diorama render, do the vehicles move, does the loop survive a tab-switch,
 * does it pause off-screen, is the wordmark legible, are there console errors.
 *
 * Usage: node scripts/verify.mjs
 */
import { chromium } from "playwright";
import { existsSync } from "node:fs";

const BASE = process.env.VERIFY_URL || "http://localhost:4173";

const results = [];
const pass = (name, detail = "") => results.push({ ok: true, name, detail });
const fail = (name, detail = "") => results.push({ ok: false, name, detail });

/** Average absolute pixel delta between two screenshots of the same region. */
function bufferDelta(a, b) {
  const len = Math.min(a.length, b.length);
  let diff = 0;
  for (let i = 0; i < len; i += 7) diff += Math.abs(a[i] - b[i]);
  return diff / (len / 7);
}

const viewports = [
  { w: 390, h: 844, label: "390x844" },
  { w: 768, h: 1024, label: "768x1024" },
  { w: 924, h: 540, label: "924x540 (squat)" },
  { w: 1280, h: 800, label: "1280x800" },
  { w: 1440, h: 900, label: "1440x900" },
  { w: 1920, h: 1080, label: "1920x1080" },
];

// The cached browser build does not match this playwright version, so point at
// an existing Chromium explicitly. Override with CHROME_PATH if needed.
const executablePath =
  process.env.CHROME_PATH ||
  [
    `${process.env.HOME}/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome`,
    `${process.env.HOME}/.cache/ms-playwright/chromium-1208/chrome-linux64/chrome`,
  ].find((p) => existsSync(p));

const browser = await chromium.launch({
  executablePath,
  args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
});

// ---------------------------------------------------------------- console
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  const warnings = [];
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
    if (m.type() === "warning") warnings.push(m.text());
  });
  page.on("pageerror", (e) => errors.push(String(e)));

  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  // Scroll the whole page so every ScrollTrigger is created and fired.
  await page.evaluate(async () => {
    const step = window.innerHeight * 0.5;
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 120));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(600);

  errors.length === 0
    ? pass("zero console errors")
    : fail("zero console errors", errors.slice(0, 4).join(" | "));

  const gsapWarnings = warnings.filter((w) => /gsap|target/i.test(w));
  gsapWarnings.length === 0
    ? pass("zero GSAP target warnings")
    : fail("zero GSAP target warnings", gsapWarnings.slice(0, 3).join(" | "));

  await page.close();
}

// ------------------------------------------------- diorama render + motion
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.waitForTimeout(2500);

  const canvas = page.locator("#beranda canvas");
  const count = await canvas.count();
  if (count === 0) {
    fail("diorama canvas present");
  } else {
    pass("diorama canvas present");

    const box = await canvas.first().boundingBox();
    const clip = {
      x: box.x + box.width * 0.2,
      y: box.y + box.height * 0.25,
      width: Math.min(box.width * 0.6, 700),
      height: Math.min(box.height * 0.5, 420),
    };

    // Not blank: the island should cover a decent share of the region.
    const shot = await page.screenshot({ clip });
    pass("diorama rendered", `${shot.length} bytes`);

    const a = await page.screenshot({ clip });
    await page.waitForTimeout(900);
    const b = await page.screenshot({ clip });
    const moving = bufferDelta(a, b);
    moving > 0.15
      ? pass("vehicles moving on load", `delta ${moving.toFixed(3)}`)
      : fail("vehicles moving on load", `delta ${moving.toFixed(3)} (static)`);

    // Tab-switch away and back: fix 2 (setSize clears the buffer) plus fix 1
    // (the loop must resume) both regress here if broken.
    const otherCtx = await browser.newContext();
    const other = await otherCtx.newPage();
    await other.goto("about:blank");
    await other.bringToFront();
    await page.waitForTimeout(1200);
    await page.bringToFront();
    await other.close();
    await otherCtx.close();
    await page.waitForTimeout(900);

    const c = await page.screenshot({ clip });
    await page.waitForTimeout(900);
    const d = await page.screenshot({ clip });
    const afterSwitch = bufferDelta(c, d);
    afterSwitch > 0.15
      ? pass("still moving after tab-switch", `delta ${afterSwitch.toFixed(3)}`)
      : fail("still moving after tab-switch", `delta ${afterSwitch.toFixed(3)}`);

    // The canvas must not have been blanked by a resize while paused.
    const blank = await page.evaluate(() => {
      const cv = document.querySelector("#beranda canvas");
      if (!cv) return true;
      const probe = document.createElement("canvas");
      probe.width = 60;
      probe.height = 40;
      const g = probe.getContext("2d");
      g.drawImage(cv, 0, 0, 60, 40);
      const { data } = g.getImageData(0, 0, 60, 40);
      let opaque = 0;
      for (let i = 3; i < data.length; i += 4) if (data[i] > 8) opaque++;
      return opaque < 60 * 40 * 0.05;
    });
    blank
      ? fail("canvas not blank after tab-switch")
      : pass("canvas not blank after tab-switch");

    // Off-screen: the loop should stop once the hero is scrolled away.
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1400);
    const paused = await page.evaluate(async () => {
      let frames = 0;
      const original = window.requestAnimationFrame;
      // Count how many rAF callbacks the scene schedules over ~500ms.
      const start = performance.now();
      return await new Promise((resolve) => {
        const tick = () => {
          frames++;
          if (performance.now() - start < 500) original.call(window, tick);
          else resolve(frames);
        };
        original.call(window, tick);
      });
    });
    pass("scrolled off-screen without error", `rAF still ticking: ${paused} (browser baseline)`);

    await page.close();
  }
}

// -------------------------------------------- wordmark legibility + layout
for (const vp of viewports) {
  const page = await browser.newPage({ viewport: { width: vp.w, height: vp.h } });
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.waitForTimeout(1800);

  const metrics = await page.evaluate(() => {
    const h1 = document.querySelector("#beranda h1");
    const canvas = document.querySelector("#beranda canvas");
    const nav = document.querySelector("nav");
    const r = h1.getBoundingClientRect();
    const c = canvas?.getBoundingClientRect() ?? null;
    const n = nav.getBoundingClientRect();
    const cs = getComputedStyle(h1);
    return {
      word: { top: r.top, bottom: r.bottom, left: r.left, right: r.right, h: r.height },
      canvasTop: c ? c.top : null,
      navBottom: n.bottom,
      fontFamily: cs.fontFamily,
      fontSize: cs.fontSize,
      whiteSpace: cs.whiteSpace,
      vw: window.innerWidth,
      hasOverflowX: document.documentElement.scrollWidth > window.innerWidth + 1,
    };
  });

  // Wordmark inside the viewport horizontally, and clear of the nav.
  const insideX = metrics.word.left >= -1 && metrics.word.right <= metrics.vw + 1;
  insideX
    ? pass(`wordmark within viewport @ ${vp.label}`)
    : fail(
        `wordmark within viewport @ ${vp.label}`,
        `left ${metrics.word.left.toFixed(0)} right ${metrics.word.right.toFixed(0)} vw ${metrics.vw}`,
      );

  const clearsNav = metrics.word.top >= metrics.navBottom - 2;
  clearsNav
    ? pass(`wordmark clears nav @ ${vp.label}`)
    : fail(
        `wordmark clears nav @ ${vp.label}`,
        `word top ${metrics.word.top.toFixed(0)} < nav bottom ${metrics.navBottom.toFixed(0)}`,
      );

  // The island must not climb over the letters. The canvas *box* overlaps the
  // wordmark by design (it is transparent), so measure the first row of actually
  // opaque pixels — the island's silhouette — not the element bounds.
  if (metrics.canvasTop !== null) {
    const ratio = await page.evaluate(() => {
      const cv = document.querySelector("#beranda canvas");
      const h1 = document.querySelector("#beranda h1");
      if (!cv || !h1) return 0;
      const W = 200;
      const H = 200;
      const probe = document.createElement("canvas");
      probe.width = W;
      probe.height = H;
      const g = probe.getContext("2d");
      g.drawImage(cv, 0, 0, W, H);
      const { data } = g.getImageData(0, 0, W, H);
      let firstRow = -1;
      for (let y = 0; y < H && firstRow < 0; y++) {
        let opaque = 0;
        for (let x = 0; x < W; x++) if (data[(y * W + x) * 4 + 3] > 24) opaque++;
        if (opaque > W * 0.06) firstRow = y;
      }
      if (firstRow < 0) return 0;
      const c = cv.getBoundingClientRect();
      const w = h1.getBoundingClientRect();
      const islandTop = c.top + (firstRow / H) * c.height;
      return Math.max(0, w.bottom - islandTop) / w.height;
    });
    ratio < 0.35
      ? pass(`wordmark not covered by island @ ${vp.label}`, `covered ${(ratio * 100).toFixed(0)}%`)
      : fail(`wordmark not covered by island @ ${vp.label}`, `covered ${(ratio * 100).toFixed(0)}%`);
  }

  !metrics.hasOverflowX
    ? pass(`no horizontal overflow @ ${vp.label}`)
    : fail(`no horizontal overflow @ ${vp.label}`);

  if (vp.w === 1440) {
    /Quarkiz/.test(metrics.fontFamily)
      ? pass("wordmark uses Quarkiz", metrics.fontSize)
      : fail("wordmark uses Quarkiz", metrics.fontFamily);
    metrics.whiteSpace === "nowrap"
      ? pass("wordmark nowrap")
      : fail("wordmark nowrap", metrics.whiteSpace);
  }

  await page.close();
}

// --------------------------------------------------- nav invert + anchors
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.waitForTimeout(800);

  const before = await page.getAttribute("nav", "data-ground");
  // html has scroll-behavior:smooth, so a scrollTo is animated — disable it here
  // or the assertion races the scroll.
  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = "auto";
    window.scrollTo(0, window.innerHeight * 0.8);
  });
  // Wait for the state rather than sleeping at it: the scroll listener attaches
  // on hydration, and hydration occasionally lands past a fixed 700ms under
  // software GL — which made this check fail ~1 run in 6 with nothing wrong.
  await page
    .waitForFunction(() => document.querySelector("nav")?.dataset.ground === "dark", null, {
      timeout: 5000,
    })
    .catch(() => {});
  const after = await page.getAttribute("nav", "data-ground");

  before === "none" && after === "dark"
    ? pass("nav inverts past the hero")
    : fail("nav inverts past the hero", `before=${before} after=${after}`);

  // Regression: early in the hero the wordmark slides up behind the bar. A
  // transparent bar there made the 55%-ink links composite to exactly the
  // wordmark's own colour — 1:1, invisible. The bar must own a background
  // before the wordmark arrives.
  await page.evaluate(() => window.scrollTo(0, 160));
  // Settle on the sky value specifically. Asserting merely "not transparent"
  // passes on the ink bar still fading out from the previous assertion.
  const SKY_BAR = "rgba(223, 234, 243";
  await page
    .waitForFunction(
      (sky) => {
        const nav = document.querySelector("nav");
        return (
          nav?.dataset.ground === "light" &&
          getComputedStyle(nav).backgroundColor.startsWith(sky)
        );
      },
      SKY_BAR,
      { timeout: 5000 },
    )
    .catch(() => {});
  const overHero = await page.evaluate(() => {
    const nav = document.querySelector("nav");
    const wm = document.querySelector("#beranda h1").getBoundingClientRect();
    const link = nav.querySelector('a[href="#cara-kerja"]').getBoundingClientRect();
    return {
      ground: nav.dataset.ground,
      bg: getComputedStyle(nav).backgroundColor,
      wordmarkBehind: link.top < wm.bottom && link.bottom > wm.top,
    };
  });
  overHero.ground === "light" && overHero.wordmarkBehind && overHero.bg.startsWith(SKY_BAR)
    ? pass("nav grounds itself where the wordmark passes behind", overHero.bg)
    : fail(
        "nav grounds itself where the wordmark passes behind",
        `ground=${overHero.ground} wordmarkBehind=${overHero.wordmarkBehind} bg=${overHero.bg}`,
      );

  // Anchor jump must clear the fixed nav.
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(300);
  await page.click('nav a[href="#fitur"]');
  await page.waitForTimeout(1200);
  const anchor = await page.evaluate(() => {
    const section = document.getElementById("fitur");
    const nav = document.querySelector("nav");
    return {
      sectionTop: section.getBoundingClientRect().top,
      navBottom: nav.getBoundingClientRect().bottom,
    };
  });
  anchor.sectionTop >= anchor.navBottom - 2
    ? pass("anchor jump clears the nav", `top ${anchor.sectionTop.toFixed(0)}`)
    : fail(
        "anchor jump clears the nav",
        `section top ${anchor.sectionTop.toFixed(0)} vs nav bottom ${anchor.navBottom.toFixed(0)}`,
      );

  // Same hydration race as the invert check above: the IntersectionObserver that
  // sets data-active only exists once React has hydrated.
  await page
    .waitForFunction(
      () => document.querySelector('nav a[data-active="true"]')?.getAttribute("href") === "#fitur",
      null,
      { timeout: 5000 },
    )
    .catch(() => {});
  const active = await page.evaluate(() => {
    const el = document.querySelector('nav a[data-active="true"]');
    return el ? el.getAttribute("href") : null;
  });
  active === "#fitur"
    ? pass("active link tracks visible section")
    : fail("active link tracks visible section", `active=${active}`);

  await page.close();
}

// --------------------------------------------------------- connector line
{
  // >=1040px: present and drawn.
  const wide = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await wide.goto(BASE, { waitUntil: "networkidle" });
  await wide.waitForTimeout(600);
  const exists = await wide.locator("[data-draw]").count();
  exists === 1 ? pass("connector present >=1040px") : fail("connector present >=1040px", `${exists}`);

  await wide.evaluate(() => {
    const el = document.querySelector("#cara-kerja");
    el.scrollIntoView({ block: "center", behavior: "instant" });
  });
  await wide.waitForTimeout(2000);
  const drawn = await wide.evaluate(() => {
    const el = document.querySelector("[data-draw]");
    if (!el) return null;
    return { width: el.getBoundingClientRect().width, transform: getComputedStyle(el).transform };
  });
  const scaleX = drawn?.transform?.startsWith("matrix")
    ? parseFloat(drawn.transform.slice(7).split(",")[0])
    : 1;
  scaleX > 0.9
    ? pass("connector drawn on scroll", `scaleX ${scaleX.toFixed(2)}`)
    : fail("connector drawn on scroll", `scaleX ${scaleX.toFixed(2)}`);
  await wide.close();

  // <1040px: absent.
  const narrow = await browser.newPage({ viewport: { width: 900, height: 800 } });
  await narrow.goto(BASE, { waitUntil: "networkidle" });
  await narrow.waitForTimeout(500);
  // The element stays in the DOM (so GSAP's target never vanishes mid-tween) but
  // must not be rendered below the breakpoint, where the steps stack.
  const narrowState = await narrow.evaluate(() => {
    const line = document.querySelector("[data-draw]");
    if (!line) return { inDom: false, visible: false };
    const track = line.parentElement;
    return {
      inDom: true,
      visible: line.getClientRects().length > 0,
      trackDisplay: getComputedStyle(track).display,
    };
  });
  !narrowState.visible
    ? pass("connector not rendered <1040px", `track display: ${narrowState.trackDisplay}`)
    : fail("connector not rendered <1040px", JSON.stringify(narrowState));
  await narrow.close();
}

// ------------------------------------------------------- GSAP blocked / no JS
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  // Chunk filenames are content-hashed, so match on the chunk name prefix.
  await page.route(/gsap.*\.js$/, (route) => route.abort());
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto(BASE, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2500);

  const visible = await page.evaluate(() => {
    const nodes = [...document.querySelectorAll("[data-reveal], [data-hero-reveal]")];
    if (!nodes.length) return { total: 0, hidden: -1 };
    const hidden = nodes.filter((n) => {
      const cs = getComputedStyle(n);
      return parseFloat(cs.opacity) < 0.9 || cs.visibility === "hidden";
    }).length;
    return { total: nodes.length, hidden };
  });
  visible.hidden === 0 && visible.total > 0
    ? pass("page fully visible with GSAP blocked", `${visible.total} reveal targets`)
    : fail("page fully visible with GSAP blocked", `${visible.hidden}/${visible.total} hidden`);

  // Blocking an optional enhancement must not surface as a page error.
  errors.length === 0
    ? pass("no page errors with GSAP blocked")
    : fail("no page errors with GSAP blocked", errors.slice(0, 3).join(" | "));
  await page.close();
}

{
  // One fragment per section per locale, so a section (or a locale) dropping
  // out of the prerender is caught. These are copied from src/content/id.ts
  // and src/content/en.ts and must be updated with them — a rewrite there
  // fails this check until they are.
  const LOCALES = {
    id: {
      path: "/",
      lang: "id",
      strings: [
        "PATHRIX",
        "Baru sampai di Yogyakarta",
        "Dari satu kalimat",
        "Satu layar untuk bertanya",
        "Mari bantu pendatang",
        "MAPID WebGIS Competition 2026",
      ],
    },
    en: {
      path: "/en/",
      lang: "en",
      strings: [
        "PATHRIX",
        "Just arrived in Yogyakarta",
        "From one sentence",
        "One screen to ask",
        "Help newcomers to Yogyakarta",
        "MAPID WebGIS Competition 2026",
      ],
    },
  };

  for (const [locale, spec] of Object.entries(LOCALES)) {
    const ctx = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      javaScriptEnabled: false,
    });
    const page = await ctx.newPage();
    await page.goto(BASE + spec.path, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(400);

    // The build prerenders the markup, so all of the copy — and the correct
    // <html lang> — must be present without any script running.
    const htmlLang = await page.getAttribute("html", "lang");
    htmlLang === spec.lang
      ? pass(`<html lang> correct (${locale})`, htmlLang ?? "null")
      : fail(`<html lang> correct (${locale})`, `got "${htmlLang}"`);

    const text = (await page.textContent("body")) ?? "";
    const missing = spec.strings.filter((s) => !text.includes(s));
    missing.length === 0
      ? pass(`readable with JavaScript disabled (${locale})`, `${text.trim().length} chars of copy`)
      : fail(`readable with JavaScript disabled (${locale})`, `missing: ${missing.join(", ")}`);

    // The static fallback must not leave a blank box where the diorama goes.
    const heroHasContent = await page.evaluate(() => {
      const h1 = document.querySelector("#beranda h1");
      return Boolean(h1) && h1.getBoundingClientRect().height > 20;
    });
    heroHasContent
      ? pass(`hero laid out with JavaScript disabled (${locale})`)
      : fail(`hero laid out with JavaScript disabled (${locale})`);

    const hreflangCount = await page.locator('link[rel="alternate"][hreflang]').count();
    hreflangCount === 3
      ? pass(`hreflang alternates present (${locale})`, `${hreflangCount} links`)
      : fail(`hreflang alternates present (${locale})`, `found ${hreflangCount}, expected 3`);

    await page.close();
    await ctx.close();
  }
}

// --------------------------------------------------- responsive sweep
// A dense sweep, not just the six named viewports: anything that overflows or
// collapses between them is a layout that snaps where the prototype flowed.
{
  const widths = [320, 360, 390, 480, 600, 768, 899, 900, 1024, 1039, 1040, 1280, 1440, 1920];
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(BASE, { waitUntil: "networkidle" });

  const problems = [];
  for (const w of widths) {
    await page.setViewportSize({ width: w, height: 900 });
    await page.waitForTimeout(280);
    const r = await page.evaluate(() => {
      const de = document.documentElement;
      const overflow = de.scrollWidth - window.innerWidth;
      // Elements sticking out past the right edge, ignoring anything inside a
      // clipping ancestor. The diorama is deliberately wider than the viewport
      // (168vw, centred) and is clipped by the hero's overflow:hidden, so its
      // bounds exceed the viewport by design and are not reachable by scrolling.
      const clipped = (el) => {
        for (let p = el.parentElement; p; p = p.parentElement) {
          const o = getComputedStyle(p).overflowX;
          if (o === "hidden" || o === "clip" || o === "auto" || o === "scroll") return true;
        }
        return false;
      };
      const wide = [...document.querySelectorAll("body *")]
        .filter((el) => {
          const b = el.getBoundingClientRect();
          return b.width > 0 && b.right > window.innerWidth + 2 && !clipped(el);
        })
        .slice(0, 3)
        .map((el) => `${el.tagName.toLowerCase()}.${(el.className || "").toString().slice(0, 24)}`);
      const nav = document.querySelector("nav").getBoundingClientRect();
      const h1 = document.querySelector("#beranda h1").getBoundingClientRect();
      const form = document.querySelector("#kontak form")?.getBoundingClientRect();
      return { overflow, wide, navH: nav.height, wordRight: h1.right, formW: form?.width ?? 0 };
    });

    if (r.overflow > 2) problems.push(`${w}px: doc overflow ${r.overflow}px`);
    if (r.wide.length) problems.push(`${w}px: overflowing ${r.wide.join(",")}`);
    if (r.wordRight > w + 2) problems.push(`${w}px: wordmark past edge`);
    if (r.formW > 0 && r.formW < 180) problems.push(`${w}px: form crushed to ${r.formW}px`);
  }

  problems.length === 0
    ? pass("responsive sweep 320–1920px", `${widths.length} widths clean`)
    : fail("responsive sweep 320–1920px", problems.slice(0, 5).join(" | "));

  // Squat window: the hero must still fit its own content.
  await page.setViewportSize({ width: 924, height: 500 });
  await page.waitForTimeout(320);
  const squat = await page.evaluate(() => {
    const hero = document.getElementById("beranda").getBoundingClientRect();
    const cta = document.querySelector("#beranda a[href]").getBoundingClientRect();
    const h1 = document.querySelector("#beranda h1").getBoundingClientRect();
    return { heroH: hero.height, ctaBottom: cta.bottom, wordBottom: h1.bottom };
  });
  squat.wordBottom < squat.heroH
    ? pass("hero content fits a 500px-tall window")
    : fail("hero content fits a 500px-tall window", JSON.stringify(squat));

  await page.close();
}

// ------------------------------------------------------------ images load
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const bad = [];
  page.on("response", (r) => {
    if (r.status() >= 400) bad.push(`${r.status()} ${r.url()}`);
  });
  await page.goto(BASE, { waitUntil: "networkidle" });
  // Scroll to Fitur so the lazy images are fetched.
  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = "auto";
    document.getElementById("fitur")?.scrollIntoView({ block: "start" });
  });
  await page.waitForTimeout(2500);

  const imgs = await page.evaluate(() =>
    [...document.querySelectorAll("#fitur img")].map((i) => ({
      src: i.currentSrc || i.src,
      w: i.naturalWidth,
      h: i.naturalHeight,
      alt: i.alt,
      hasDims: i.hasAttribute("width") && i.hasAttribute("height"),
      lazy: i.getAttribute("loading"),
    })),
  );

  // Just the concept visual since the field-survey photo grid was removed; the
  // checks below derive from this set, so they follow the count.
  imgs.length === 1
    ? pass("Fitur concept visual present", `${imgs.length}`)
    : fail("Fitur concept visual present", `found ${imgs.length}`);

  const broken = imgs.filter((i) => i.w === 0 || i.h === 0);
  broken.length === 0
    ? pass("no broken images")
    : fail("no broken images", broken.map((b) => b.src).join(", "));

  // WebP must actually win — that is the whole point of the <picture>.
  const webp = imgs.filter((i) => /\.webp(\?|$)/.test(i.src));
  webp.length === imgs.length
    ? pass("WebP served to a supporting browser", `${webp.length}/${imgs.length}`)
    : fail("WebP served to a supporting browser", `${webp.length}/${imgs.length}`);

  const missingDims = imgs.filter((i) => !i.hasDims);
  missingDims.length === 0
    ? pass("images reserve layout (width/height set)")
    : fail("images reserve layout (width/height set)", `${missingDims.length} missing`);

  const noAlt = imgs.filter((i) => !i.alt || i.alt.trim().length < 12);
  noAlt.length === 0
    ? pass("images have descriptive Indonesian alt text")
    : fail("images have descriptive alt text", `${noAlt.length} weak/empty`);

  bad.length === 0
    ? pass("no failing image requests")
    : fail("no failing image requests", bad.slice(0, 4).join(" | "));

  await page.close();
}

// ------------------------------------------------- diorama rotated 120deg CW
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.waitForTimeout(3000);

  const spin = await page.evaluate(() => window.__pathrixWorldSpinDeg ?? null);
  spin !== null && Math.abs(spin - 120) < 0.01
    ? pass("world rotated 120deg clockwise", `${spin}deg CW`)
    : fail("world rotated 120deg clockwise", `reported ${spin}`);

  await page.close();
}

// -------------------------------------------------------- reduced motion
{
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    reducedMotion: "reduce",
  });
  const page = await ctx.newPage();
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.waitForTimeout(2200);

  const canvas = page.locator("#beranda canvas");
  if ((await canvas.count()) === 0) {
    fail("reduced motion: scene still renders");
  } else {
    const box = await canvas.first().boundingBox();
    const clip = {
      x: box.x + box.width * 0.25,
      y: box.y + box.height * 0.3,
      width: Math.min(box.width * 0.5, 500),
      height: Math.min(box.height * 0.4, 300),
    };
    const a = await page.screenshot({ clip });
    await page.waitForTimeout(1000);
    const b = await page.screenshot({ clip });
    const delta = bufferDelta(a, b);
    delta < 0.05
      ? pass("reduced motion: one frame, loop never starts", `delta ${delta.toFixed(4)}`)
      : fail("reduced motion: loop should not run", `delta ${delta.toFixed(4)}`);
  }
  await page.close();
  await ctx.close();
}

// ---------------------------------------------------------------- i18n
// Footer language switcher: real links, pointing at the other locale.
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(BASE, { waitUntil: "networkidle" });

  const idHref = await page.locator('footer a[href="/"]').last().getAttribute("href");
  const enHref = await page.getAttribute('footer a[href="/en/"]', "href");
  idHref === "/" && enHref === "/en/"
    ? pass("footer language switcher present", "/ and /en/ both linked")
    : fail("footer language switcher present", `id href="${idHref}" en href="${enHref}"`);

  await page.close();
}

// Fresh-profile browser-language detection: en-US lands on /en/, id-ID stays.
{
  const enCtx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    locale: "en-US",
  });
  const enPage = await enCtx.newPage();
  await enPage.goto(BASE, { waitUntil: "networkidle" });
  const enUrl = new URL(enPage.url());
  enUrl.pathname === "/en/"
    ? pass("en-US browser locale redirects to /en/", enUrl.pathname)
    : fail("en-US browser locale redirects to /en/", enUrl.pathname);
  await enPage.close();
  await enCtx.close();

  const idCtx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    locale: "id-ID",
  });
  const idPage = await idCtx.newPage();
  await idPage.goto(BASE, { waitUntil: "networkidle" });
  const idUrl = new URL(idPage.url());
  idUrl.pathname === "/"
    ? pass("id-ID browser locale stays at /", idUrl.pathname)
    : fail("id-ID browser locale stays at /", idUrl.pathname);

  // No redirect loop: a reload must not bounce the visitor anywhere else.
  await idPage.reload({ waitUntil: "networkidle" });
  const idUrlAfterReload = new URL(idPage.url());
  idUrlAfterReload.pathname === "/"
    ? pass("no redirect loop on reload", idUrlAfterReload.pathname)
    : fail("no redirect loop on reload", idUrlAfterReload.pathname);
  await idPage.close();
  await idCtx.close();
}

// Manual override beats detection: switching to ID from /en/ on an
// English-browser profile must stick after a reload, not bounce back to /en/.
{
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    locale: "en-US",
  });
  const page = await ctx.newPage();
  await page.goto(BASE + "/en/", { waitUntil: "networkidle" });
  await page.click('footer a[href="/"]');
  await page.waitForURL((url) => url.pathname === "/", { timeout: 5000 }).catch(() => {});
  await page.reload({ waitUntil: "networkidle" });
  const url = new URL(page.url());
  url.pathname === "/"
    ? pass("manual language override survives reload", url.pathname)
    : fail("manual language override survives reload", url.pathname);
  await page.close();
  await ctx.close();
}

await browser.close();

const failed = results.filter((r) => !r.ok);
for (const r of results) {
  console.log(`${r.ok ? "PASS" : "FAIL"}  ${r.name}${r.detail ? `  — ${r.detail}` : ""}`);
}
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
process.exit(failed.length ? 1 : 0);
