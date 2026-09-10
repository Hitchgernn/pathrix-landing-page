# Pathrix landing page — working notes

Production landing page for **Pathrix**, a WebGIS-based AI agent for multimodal
mobility in Yogyakarta, built for the MAPID WebGIS Competition 2026.

The design prototype `Pathrix.dc.html` is **the visual spec**. Match it. Do not
redesign, do not add sections, do not add stock imagery or icon sets that are not
already there. All copy is Indonesian and already written in the prototype — copy
it verbatim. The one English string is the tagline.

## Stack

Vite 5 + React 18 + TypeScript, CSS Modules, three.js `0.180.0` (pinned), GSAP
3.12 + ScrollTrigger. No Tailwind, no UI kit, no CSS framework, no analytics, no
cookie banner. Deploy target is a static build — no server runtime.

```
npm run dev             # dev server
npm run build           # tsc --noEmit && vite build && prerender
npm run preview         # vite preview on :4173 (no cache headers)
npm run serve           # dist/ on :4174 WITH _headers + gzip — use this to verify
npm run typecheck
npm run images          # re-encode placeholder art into public/img
npm run model           # re-pack the Tugu glTF into public/hero/tugu-jogja.glb

npm run verify          # 54 browser checks
npm run verify:pause    # render loop pauses off-screen
npm run verify:weight   # transfer weight + cache reuse
npm run verify:framing  # diorama framing + image content
npm run verify:vehicles # vehicle heading, terrain clearance, traffic gaps (dev server)
npm run shots           # reference screenshots into scripts/shots/
```

`npm run build` runs three steps. The prerender is not optional — see
"Prerendering" below.

Verify against `npm run serve`, not `npm run preview`: only the former applies the
cache policy and gzip, so it is the one that reflects production.

## Layout

```
index.html              shell; contains the <!--app-html--> prerender placeholder,
                        plus <!--lang-detect--> and <!--hreflang-links--> (see i18n)
src/main.tsx            hydrates the prerendered markup (falls back to render)
src/entry-server.tsx    build-time render entry; render(locale) + meta(locale)
src/App.tsx             page composition + reveal wiring; wraps the tree in
                        LocaleProvider
src/content/site.ts     locale-independent values (env config, geometry, nav ids)
src/content/types.ts    the Copy type — the shape both locales must satisfy
src/content/id.ts       Indonesian copy (default locale), verbatim from the PRD
src/content/en.ts       English copy — editorial translation, see i18n below
src/lib/locale.tsx      LocaleContext, useCopy(), useLocale(), localeFromDocument()
src/components/         one .tsx + one .module.css per section; copy comes from
                        useCopy(), never a direct site.ts import
src/lib/                scroll plumbing, media queries, GSAP reveals
src/styles/tokens.css   design tokens (colours, fonts, rhythm)
src/styles/global.css   resets, @font-face, skip link
src/hero/               the three.js diorama (ported, see below)
scripts/verify.mjs      browser verification suite — 66 checks
scripts/vehicle-check.mjs vehicle heading, terrain clearance, traffic gaps
scripts/check-pause.mjs proves the render loop pauses off-screen
scripts/framing-check.mjs diorama framing + image content sanity
scripts/weight-check.mjs  transfer weight and cache reuse
scripts/phase-probe.mjs diorama phase timings
scripts/prerender.mjs   bakes markup into dist/index.html
scripts/serve.mjs       static server that applies public/_headers + gzip
scripts/art/            SOURCES for the placeholder imagery (svg + python)
scripts/encode-images.sh art -> public/img (WebP + JPEG at display sizes)
scripts/art/tugu-jogja/ SOURCE glTF for the monument (CC BY-NC-ND — see below)
scripts/encode-model.sh art -> public/hero/tugu-jogja.glb (meshopt + 512 WebP)
public/img/             encoded placeholder imagery (committed)
public/fonts/           self-hosted Quarkiz (.woff2 subset + .otf/.ttf)
public/hero/            static diorama fallback for no-WebGL
public/_headers         cache policy for Netlify / Cloudflare Pages
vercel.json             the same policy for Vercel
uploads/                PRD + original standalone diorama (reference only)
Pathrix.dc.html         the design spec — read before changing anything visual
Pathrix Hero.dc.html    rejected earlier hero directions; reference only, do not port
```

Deleted during the port and intentionally gone: `support.js` (prototype runtime),
`image-slot.js` (replaced by `src/components/ImageSlot.tsx`), the root `hero/`
folder (now `src/hero/`), and `hero/three.js` + `hero/merge.js` (see below).

## Design tokens

Defined in `src/styles/tokens.css`. Sampled from the 3D scene so the diorama and
the page agree. **Two background colours for the whole page — light blue and ink.
Do not introduce a third.**

`--sky-0 #eff5fa` · `--sky-1 #dfeaf3` · `--sky-2 #c6d9e8` · `--ink #101e2a` ·
`--ink-deep #0c1822` (Fitur only) · `--ink-soft #17293a` · `--blue #1f6592` ·
`--blue-lift #5aa9dd` · `--warm #d9a521` · `--paper #e7f0f7`

The warm accent is yellow and is **three** values, because no single yellow can
read as 11px text on both the dark and the light backgrounds:

- `--warm #d9a521` — background use only (step 03 marker, `::selection`). Pair it
  with `--ink` text: 7.54:1. A light foreground on it fails AA (~2:1), so the two
  places that used to do that now use `--ink`. Same hex as the `GOLD` material in
  `src/hero/landmarks/tugu.js`, deliberately — keep them in sync.
- `--warm-text #f2c94c` — text on the dark backgrounds. 10.66:1 on `--ink`,
  11.32:1 on `--ink-deep`. Also the nav active-section underline.
- `--warm-deep #7c5e13` — text on the light backgrounds. 4.95:1 on `--sky-1`.
  This case was previously undocumented and unhandled: the Kontak error note used
  `--warm` on `--sky-1` at 3.42:1, already below AA before the yellow change.

Two other token values deviate from the prototype, deliberately, for WCAG AA:

- `--on-dark-meta` is `.56` (prototype used `.45`, which measured 3.8–4.05:1 for
  11px type — below the 4.5:1 floor).
- `--on-light-meta` is `.7` (prototype `.5` measured 2.92:1).

Changing these back will fail the accessibility target.

## Typography

- **Quarkiz** — the wordmark `PATHRIX` only (hero h1, nav mark, footer mark).
  Self-hosted, subset to `A-Za-z` (7.1KB woff2, from 28KB).
- **Archivo** (400/500/600/700) — everything else.
- **IBM Plex Mono** (400/500) — eyebrows, labels, step numbers, form labels.

Do not swap Archivo/IBM Plex Mono for Inter, Roboto, or Poppins.

Hero wordmark: `font-size: clamp(52px, 15.6vw, 232px); line-height: .82;
white-space: nowrap`.

## Diorama — six fixes that must not regress

`src/hero/` is the prototype scene ported as-is. The camera is **fixed** (no
OrbitControls, no scroll-linked camera); only the vehicles and water move.
Preserve that. Do not convert the diorama to a video or an image sequence.

### The Tugu model and its licence

The monument is **not** procedural any more. `src/hero/landmarks/tugu.js` loads
`public/hero/tugu-jogja.glb` through `GLTFLoader` + `MeshoptDecoder`; the plinth
steps and the 12 perimeter posts around it are still built from primitives,
because the model has neither and the plaza reads bare without them.

**Licence: CC-BY-NC-ND-4.0.** "Tugu Jogja" by Djonk, from Sketchfab. The full
text ships beside the asset at `public/hero/tugu-jogja.license.txt` and is copied
from `scripts/art/tugu-jogja/license.txt`. Three consequences:

- **BY** — attribution is rendered in the page footer (`footer.modelCredit` in
  both locales). That line is a licence condition, not decoration. Do not remove
  it, and do not let it fall out of `src/content/types.ts`.
- **NC** — no commercial use. This was flagged and accepted as a known risk.
  Re-raise it before the site is used to sell anything.
- **ND** — modified versions may not be distributed. The build re-encodes the
  file (meshopt, 512px WebP) and the loader retints the gold, which is arguably
  a derivative.

If a licence-clean replacement is ever sourced, everything above stays: only the
`.glb` and the credit string change.

The procedural monument **stays in `tugu.js`** as `buildProceduralMonument()`. It
is what stands if the `.glb` fetch or decode fails — a bare plinth is not an
acceptable degraded state. `createTugu()` is still synchronous and still returns
a group the caller can add immediately; the model arrives via the `loaded`
promise, which **never rejects**.

Placement is pinned by one number: the spire top must stay at or below **10.49**,
because `scripts/verify.mjs` asserts the island silhouette never climbs over the
hero wordmark. `MODEL_SCALE` is derived from that ceiling and the 0.78 step top
rather than hard-coded, so re-deriving it after a model swap is one edit.

### Lighting the model — env map on the metal only

`createEnvironment()` in `src/hero/core/lights.js` builds a PMREM-prefiltered
`RoomEnvironment`. It is procedural, so it costs no network request.

It is deliberately **not** assigned to `scene.environment`. Two reasons:

- Globally it would re-shade every `MeshStandardMaterial` in the diorama —
  terrain, vehicles, water — all of which are tuned against the three lights in
  `createLights()`.
- Even scoped to the Tugu, it must go on the **metal only**. The gold is
  `metalness 0.71`, and a metal has no diffuse response, so under the scene
  lights alone it renders near-black — that is the whole reason the map exists.
  The white marble is the opposite case: an env map adds diffuse irradiance on
  top of an already-generous ambient + hemisphere + sun, and the body flattens
  into a featureless white silhouette. Verified by sweeping 0 / 0.3 / 0.6 against
  screenshots — the shading on the shaft is visibly gone by 0.3.

`envMapIntensity` is **0.4** on the metal, 1.8 and 1.2 having gone brighter than
the sunlit terrain around it. The export's gold is `#e8cf01`, an acid lemon that
fights the page accent, so the loader retints it to `GOLD_HEX` — the same
`#d9a521` as `--warm` in tokens.css and the perimeter post caps.

Real-time ray tracing is not available in three.js/WebGL. An env map is the
lever; do not go looking for a path tracer.

Also set on load: `side = FrontSide` (all three glTF materials declare
`doubleSided`, which only doubles shadow-map cost and invites acne on the thin
trim) and `castShadow`/`receiveShadow` on every mesh.

The env map is disposed explicitly in `buildScene`'s `dispose()`. The scene
traversal there reaches geometries and materials only — a standalone texture is
held by neither.

### World rotation

The diorama is turned **120° clockwise** (viewed from above) via `WORLD_SPIN` in
`src/hero/diorama.js`. Two things about how that is done matter:

- It is applied to a `world` group containing the terrain, tracks, Tugu,
  vehicles, and water — **not** to the camera and **not** to the scene root. The
  camera framing is part of the design, and the lights are deliberately left on
  the scene: parenting them to the rotating group would swing the sun and
  re-shade every face.
- Clockwise-from-above is `rotation.y = -angle`. A positive Y rotation carries +Z
  toward +X, which reads counter-clockwise on screen. Verified numerically, not
  by eye — `(0,0,1)` at `y=-90°` lands on `(-1,0,0)`.

`window.__pathrixWorldSpinDeg` reports the applied angle so `verify.mjs` asserts
the real value instead of a duplicated constant. `npm run verify:framing`
confirms the rotated island stays centred (centroid x ≈ 0.49) and still fills the
frame; the scene geometry is authored around the origin, which is why an
arbitrary turn does not need the camera moved to compensate.

1. **Never gate the render loop on `IntersectionObserver`.** An IO with an
   implicit root measures against the *top-level* viewport, so in a nested
   browsing context it reports `isIntersecting:false` forever and the vehicles
   freeze. `mountDiorama` uses `getBoundingClientRect()` vs
   `window.innerHeight/innerWidth` plus `document.hidden`, re-evaluated on
   scroll, resize, `visibilitychange`, and a ~700ms poll. It defaults to
   **running** unless proven off-screen.
2. **`renderer.setSize()` clears the drawing buffer.** `stage.js` exposes
   `setRedraw()` and calls it at the end of every resize; `start()` also draws.
   Without both, a resize while paused leaves a live-but-blank canvas
   (reproduces on tab-switch).
3. **The canvas is transparent, not sky-coloured.** `alpha:true`,
   `setClearAlpha(0)`, no `scene.background` — the page gradient shows through,
   which is what removes the seam. The fog colour must still be the page colour
   behind it, passed in as the `tint` prop (`#dfeaf3`).
4. **Size the diorama from the hero's *remaining* height, never a fixed aspect
   box.** `.stage` is a `flex:1` child with
   `margin-top: calc(var(--wordmark) * -0.36)` — the overlap is derived from the
   wordmark's own clamp, so the "island in front of the letters" proportion holds
   at every viewport. Keep that relationship; do not substitute a hard-coded
   offset.
5. **Watch `clamp()` argument order with negative values.**
   `clamp(-70px, -8vw, -118px)` is malformed (min > max) and silently collapses.
   Most-negative value goes first: `clamp(-118px, -8vw, -70px)`.
6. **Never orient a vehicle with `Object3D.lookAt()`.** It takes a point in
   **world** space, but the curve — like the object's own position — lives in the
   rotated `world` group. Feeding it a curve-space point made it aim from the
   rotated world position at an unrotated target, so every vehicle faced
   somewhere unrelated to its direction of travel: measured up to 127° off, i.e.
   sliding sideways and partly backwards along the road. `followCurve` now builds
   the quaternion with `Matrix4.lookAt`, which yields a rotation in the parent's
   frame — which is what `obj.quaternion` already means. This survived every one
   of the 54 checks because a pixel diff can only see *that* the vehicles moved.
   `npm run verify:vehicles` asserts the heading directly.

Production additions on top of the port:

- `prefers-reduced-motion: reduce` → build the scene, render one frame, never
  start the loop.
- No WebGL, or context creation throws → static SVG fallback at
  `public/hero/diorama-fallback.svg`. Never a blank box.
- `setPixelRatio` capped at 2.
- `renderer.compileAsync()` before the first frame, so shader compilation goes
  through `KHR_parallel_shader_compile` where available instead of blocking. The
  mount itself is deferred to `requestIdleCallback` after `load`, and the canvas
  fades in only once `handle.ready` resolves.

### Traffic — one lane, one speed

**Every road vehicle shares `ROAD_SPEED` (`config.js`) and the lane centre
(`lateral: 0`). Do not give one of them its own speed or offset.**

The asphalt band is 4.0 units wide but only ~2.65 of it is clear of terrain: hex
tiles are classified by their **centre** distance, so a tile centred just outside
the band still reaches ~1 unit into it and stands 0.1–0.6 above the road surface.
Two passing lanes of these vehicles need ~2.60 before any gap at all, which does
not fit — so nothing may overtake. One shared speed freezes the arc gaps, and the
four starting offsets put them roughly a quarter of a lap apart. Measured closest
approach: **3.6 units**. The port had four lanes at four speeds, which put the bus
flank inside the plaza terraces on 99% of frames and the andong's horse in the
grass on 89%.

The **andong's horse rides the curve at its own arc offset** (`HORSE_LEAD`), like
the train's carriages. As a rigid child at `z = +1.95` it followed the carriage's
heading rather than the road, and on a ring this tight it swung 0.6 units outside
the asphalt. The carriage and the horse are siblings under a group that stays at
the origin, so the label anchor has to be the carriage.

Gait rates are expressed as multiples of `speed`, so the becak's pedalling and
the horse's legs stay in step if `ROAD_SPEED` changes.

Known remainder: the gravel band's clear width is ~1.0 units and the locomotive
is 1.4 wide, so the **train's flank brushes tiles standing 0.5 above the railhead
on ~7% of frames.** It cannot be tuned away — the fix would be moving the drawn
track (`RAIL_PATH_RADIUS` feeds both the rails and the train) or capping the
terrain beside it, both of which change the island. `verify:vehicles` bounds it at
0.55 rather than requiring zero.

### three.js wiring

The prototype used `hero/three.js` (a remote URL re-export) and `hero/merge.js`
(a hand-rolled `mergeGeometries`) to avoid an import map. **Both are deleted.**
Every module now imports `three` normally, and `mergeGeometries` comes from
`three/examples/jsm/utils/BufferGeometryUtils.js`. `vite.config.ts` sets
`resolve.dedupe: ["three", ...]`.

Verified: exactly one copy of three.js in the bundle (one `"180"` revision
literal, one `ACESFilmicToneMapping` reference). Re-check after any dependency
change.

## GSAP behaviour

- **`gsap.from` only — never `.to`.** If GSAP fails to load the page must still
  be fully visible, just unanimated. GSAP is a dynamic import and every call site
  is guarded; a blocked chunk logs a warning and nothing else.
- Hero reveals fire on load with a `0.09s` stagger. Everything else uses
  `ScrollTrigger.batch` at `start: "top 88%"` with
  `y:34, opacity:0, duration:.9, ease:"power3.out"`.
- **Connector line:** one-shot `scaleX` from 0, `duration:1.2,
  ease:"power2.inOut"`, `start:"top 74%", once:true`,
  `transform-origin:left`. Safety net: if no ScrollTrigger has advanced after
  ~2.5s, the line is set visible outright rather than shipping a permanently
  collapsed element.
- **Resolve the real scroll container before creating triggers** (`src/lib/scroll.ts`).
  If `document.body` is the scroll box rather than the window,
  `ScrollTrigger.defaults({scroller: document.body})`. Read scroll position as
  `max(window.scrollY, document.scrollingElement.scrollTop, document.body.scrollTop)`.
- No pinning, no horizontal scroll, no scroll-jacking, no smooth-scroll library.

## Responsive rules

The prototype has no media queries by constraint — everything is `clamp()` and
`repeat(auto-fit, minmax(Npx, 1fr))`. Media queries are allowed in production but
**keep the fluid behaviour**: no layout may snap at a breakpoint the prototype
crosses smoothly.

Two real breakpoints:

- **900px** — nav links collapse to a hamburger; the hero tagline switches from a
  single hairline-flanked line to a wrapped block.
- **1040px** — the step connector appears (below it the steps no longer share a
  row).

Both are decided **in CSS, not JS**: each variant is in the markup and CSS picks
one. This is what makes the nav and hero correct on first paint, correct when
prerendered, and correct with JavaScript disabled. Do not move these back to
`useMediaQuery` render branching. The connector stays in the DOM at
`display:none` below 1040px so GSAP's target never disappears mid-tween.

Every `auto-fit` grid uses `minmax(min(Npx, 100%), 1fr)`, not `minmax(Npx, 1fr)`.
A bare floor wider than the viewport overflows the document — the Kontak grid's
320px floor broke the page at 320px wide. The `min()` wrapper caps the floor at
the space actually available. Keep it on any new grid.

`npm run verify` sweeps 14 widths from 320 to 1920 looking for document overflow,
elements past the right edge, and crushed columns. Note that the hero diorama is
*legitimately* wider than the viewport (`168vw`, centred) and is clipped by the
hero's `overflow:hidden`, so the sweep ignores anything inside a clipping
ancestor — bounds alone would report a false positive there.

Section anchors use `scroll-margin-top: clamp(100px, 10vw, 124px)`, which must
stay greater than the real nav height. Recompute if the nav changes.

Verify at 390, 768, 924, 1280, 1440, and 1920 wide, and at 540px tall.

## Prerendering

React CSR ships an empty `<div id="root">`, which fails the "readable with
JavaScript disabled" requirement outright. `scripts/prerender.mjs` runs after
`vite build`, builds one SSR bundle, then loops over both locales — calling
`render(locale)` and `meta(locale)` from that bundle — to produce
`dist/index.html` (id) and `dist/en/index.html` (en). `main.tsx` then hydrates
whichever one was served.

Three things to know if you touch this:

- The SSR pass sets `configFile: false`. It must not inherit the client build's
  `manualChunks` — in an SSR build `three`/`gsap` are externals and rollup
  refuses to chunk externals.
- Anything that touches `document` at module scope or during first render breaks
  the prerender. `Diorama.tsx`'s WebGL probe returns `true` when `document` is
  undefined so the prerendered markup matches what a capable browser hydrates.
- Every per-locale substitution (`<html lang>`, `<title>`, the four meta tags,
  the two placeholder comments) goes through `mustReplace()`, which throws if
  its pattern doesn't match. A stale pattern fails the build loudly instead of
  silently shipping the wrong locale's `<title>`.

**No two adjacent text nodes in one element.** `renderToStaticMarkup` emits no
`<!-- -->` separators, so `{value}{" "}<a>…</a>` renders as a single merged text
node on the server and hydration fails the whole root over to client rendering
(React #418/#425). Anything `document`-touching at module scope breaks this too.
Put inter-node spacing in CSS.

## Internationalization

Two locales: `id` (default, `/`) and `en` (`/en/`), both fully prerendered —
each is readable with JavaScript disabled, in its own language, at its own URL.

- **Content.** `src/content/types.ts` defines `Copy`; `id.ts` and `en.ts` each
  implement it in full. `caraKerja.steps` is a 3-tuple, `fitur.items` a
  6-tuple, `navLabels` a `Record<SectionId, string>` — a locale with the wrong
  number of cards or nav entries fails `tsc`, not review. Components never
  import copy from `site.ts` directly; they call `useCopy()`
  (`src/lib/locale.tsx`), which reads `LocaleContext` set by `App`.
- **`andong` and `becak` keep their Indonesian names in English**, glossed once
  on first use (`masalah.paraTwo.emphasis` in `en.ts`) then bare after. They are
  the product's differentiator, not vocabulary to flatten — do not translate
  them to "horse cart" / "pedicab".
- **Detection.** A synchronous script injected at the `<!--lang-detect-->`
  placeholder runs before paint: a `localStorage["pathrix.lang"]` override
  always wins; otherwise it scans `navigator.languages` for `id`/`en`,
  defaulting to `id`. It uses `location.replace` (never a redirect status, so
  Back leaves the site rather than bouncing between locales) and a
  `sessionStorage` guard against a same-tab loop. **Not IP/region** — a foreign
  tourist standing in Yogyakarta has an Indonesian IP and wants English; region
  is not language.
- **Manual override.** The footer `ID / EN` switcher (`Footer.tsx`) is real
  `<a href="/">` / `<a href="/en/">` — works with JS disabled, crawlable — and
  writes `localStorage["pathrix.lang"]` on click so the choice survives future
  visits.
- **Dev server.** `npm run dev` always serves the raw, Indonesian `index.html`
  (no `/en/` route in dev). Test English locally at
  `localhost:5174/?lang=en` — `localeFromDocument()` has a
  `import.meta.env.DEV`-gated override for this that compiles out of
  production.
- **Hosting.** `/en/` needs the same `max-age=0, must-revalidate` cache rule as
  `/` in both `vercel.json` and `public/_headers` — a cached `/en/index.html`
  pins clients to deleted chunk hashes exactly like a cached `/` would.
  `scripts/serve.mjs` 301s bare `/en` to `/en/` (otherwise it falls into the SPA
  fallback and silently serves the Indonesian page).

## Images

The five Fitur images are **generated placeholders, not real content.** Sources
live in `scripts/art/`: `webgis.svg` (a UI mockup of the product screen) and
`fields.py` (four procedurally rendered 4:5 survey scenes — trotoar, halte,
penyeberangan, stasiun). `npm run images` rasterises and encodes them into
`public/img/`.

Replacing them with real assets needs no code change: drop the files in
`public/img/` under the same base names, or point `src` in `src/content/site.ts`
somewhere else. `src: null` still falls back to the flat `--ink-soft` block with
the caption — **no gradient shimmer, no skeleton animation.**

The placeholder art deliberately carries **no statistics or invented numbers**;
the mockup's TOD panel uses unlabelled qualitative bars for that reason.

### Encoding

`scripts/encode-images.sh` emits **WebP + JPEG only, sized to display width**
(1600px for the 16:9 shot, 640px for the 4:5 photos — the grid never renders them
wider than ~290px, so 640 covers 2x). Total for all five: ~67KB over the wire.

**AVIF is intentionally not produced.** The ImageMagick build here has no AVIF
delegate and silently writes a PNG with an `.avif` extension. Because browsers
pick a `<source>` by declared MIME type, shipping that means the browser
downloads a 450KB file, fails to decode it, and *then* falls back — paying twice.
The first pass at this did exactly that. If a real encoder (`avifenc`, libavif,
sharp) is installed later, emit AVIF in the script **and** add the `<source>` back
to `ImageSlot.tsx` together — never one without the other.

## Caching and payload

The build is static, so caching is host config plus fingerprinting rather than
anything in the app. Policy lives in **two places that must stay in sync**:
`public/_headers` (Netlify, Cloudflare Pages) and `vercel.json` (Vercel).

| Path | Policy | Why |
| --- | --- | --- |
| `/` and `/index.html` | `max-age=0, must-revalidate` | A cached shell pins clients to deleted chunk hashes |
| `/assets/*` | `max-age=31536000, immutable` | Vite content-hashes these; the name changes when the bytes do |
| `/img/*`, `/fonts/*`, `/hero/*` | `max-age=604800, stale-while-revalidate` | Not hashed, so a long TTL rather than immutable |

No service worker. Nothing here needs offline support, and a SW would add a
cache-invalidation failure mode for no benefit.

`npm run serve` applies the `_headers` rules and gzips text so the policy is
verifiable locally; `vite preview` does neither, which makes it useless for this.

`.glb` is in that server's compressible set — see the rejected-approaches list
below for why that is not optional. **Whether the real host compresses
`model/gltf-binary` has not been verified**; if it does not, the Tugu costs
153KB rather than 93KB. Check it on the host before trusting the cold-weight
figure.

Measured over the wire, gzipped: **310KB cold**, of which the critical path
(excluding the deferred three.js chunk and below-the-fold imagery) is **112KB
across 6 requests**. A repeat visit transfers essentially nothing.

Payload notes: three.js is 125KB gzip and dominates, which is why it is a separate
lazy chunk mounted at idle rather than part of the entry. The imagery is ~67KB for
all five files. Fonts are 7KB (Quarkiz subset) plus the Google-hosted Archivo and
IBM Plex Mono, which are loaded non-blocking via `rel=preload` + `onload`.

## Verification

```
npm run build
npm run serve &                # :4174, with cache headers + gzip
npm run verify                 # 54 checks, exits non-zero on failure
npm run verify:pause           # counts WebGL draw calls in/out of view
npm run verify:framing         # rotation framing + image content
npm run verify:weight          # transfer size + cache reuse

npm run dev &                  # :5174 — verify:vehicles needs this one, not dist/
npm run verify:vehicles        # heading, terrain clearance, traffic gaps
```

`verify:vehicles` reads the live scene through `window.__pathrixDebug`, which
`diorama.js` only sets behind `?dioramaDebug` **and** `import.meta.env.DEV`. The
dev guard is load-bearing: exposing the `THREE` namespace pins every export and
defeats tree-shaking, which took the three.js chunk from 125KB to 182KB gzip. So
run this one against `npm run dev`; the scene geometry is identical either way.

`verify.mjs` covers: console errors, GSAP warnings, diorama renders, vehicles
moving (but *not* whether they move in the right direction — that is
`verify:vehicles`), still moving after a tab-switch, canvas not blank after a tab-switch,
wordmark legibility and island coverage at six viewports, a 14-width responsive
sweep, squat-window layout, nav inversion, active link, anchor clearance,
connector draw and absence, image loading (WebP wins, no broken files, layout
reserved, alt text present), the 120° rotation, GSAP-blocked, JS-disabled, and
reduced motion.

Both scripts point at a cached Chromium explicitly (the installed Playwright
version does not match the cached browser build). Override with `CHROME_PATH`.

Two notes on writing checks here, learned the hard way:

- Island coverage must be measured from **opaque canvas pixels**, not element
  bounds. The canvas box overlaps the wordmark by design because it is
  transparent; measuring bounds reports a false ~50% coverage.
- `html` has `scroll-behavior: smooth`, so any test that scrolls and then asserts
  must set `scrollBehavior = "auto"` first or it races the animation.

### Current measured state

**65–66 of 66 verification checks pass**, the variance being one flaky check —
see below. Loop confirmed running in view (~850–1275 draw calls/s), **0 draw
calls off-screen**, and resuming on return.

`connector drawn on scroll` is **flaky, and was already flaky before the Tugu
model landed** — three runs against a build of the previous commit gave scaleX
0.00, 0.25 and 1.00 at an identical scroll position. It scrolls `#cara-kerja`
to centre, waits 2s and asserts the scrubbed connector is >0.9 drawn, which
races ScrollTrigger's scrub interpolation and its cached start/end. Treat a lone
failure here as noise; treat any *other* failure as real. Fixing it properly
means waiting on the tween rather than on a timeout.

Transfer weight, re-measured after the Tugu model landed: **371KB gzipped cold /
72KB critical path** across 13 requests; repeat visits transfer nothing. The
model is 153KB raw and **93KB over the wire**, and it is not on the critical
path — the diorama fetches it at idle, after the hero wordmark has painted.
The three.js chunk went 125KB → 152KB gzip, which is GLTFLoader, MeshoptDecoder
and RoomEnvironment; it is lazy, so that is deferred weight too.

(The earlier "310KB / 112KB" figures here were measured with a shorter
observation window and a critical-path filter that has since changed. Compare
against 371/72, not against them.)

Lighthouse desktop: **accessibility 100, best-practices 100, SEO 100**.
Performance is **83–92 across identical runs** — it touches the ≥90 target but
does not hold it, so treat it as unmet. LCP 0.4–0.7s and CLS 0.003 are
comfortable; the entire spread is Total Blocking Time (220–370ms), dominated by
WebGL shader compilation under the headless software rasteriser (SwiftShader),
measured at ~195ms for a synchronous first render via `scripts/phase-probe.mjs`.
Adding the five images did not move these numbers.

This is very likely a headless-software-GL artifact rather than a real user-facing
cost, but **that has not been proven** — an attempt to compare against native GL
on this machine fell back to SwiftShader too. Before claiming the target is met,
re-run Lighthouse on a machine with real GPU acceleration. If TBT is still high
there, the scene build is genuinely too heavy for the main thread and the fix is
a smaller first-frame scene, not more scheduling tricks.

Rejected approaches, do not retry:

- **Splitting scene assembly across frames** so each render compiles fewer
  shaders. It made things *worse* (individual 850–970ms tasks, ~4.5s total)
  because SwiftShader recompiles pipeline state per added group. `compileAsync` is
  the correct lever.
- **Emitting AVIF with the available ImageMagick.** It has no AVIF delegate and
  writes mislabelled PNGs, which costs a wasted download per image. See "Images".
- **Leaving `.glb` out of `scripts/serve.mjs`'s `COMPRESSIBLE` set** on the
  theory that a meshopt-compressed model is already compressed. It is not:
  meshopt byte-filters its buffers *so that* a general-purpose compressor still
  works on them. Serving the Tugu uncompressed cost 153KB instead of 93KB.
- **A `{" "}` separator between a text node and an element in JSX.**
  `entry-server.tsx` renders with `renderToStaticMarkup`, which emits no
  `<!-- -->` markers, so two adjacent text nodes hydrate as one and the whole
  root falls back to client rendering (React #418/#425). The footer credit hit
  this. Put the gap in CSS. See "Prerendering".

## Still unresolved — surface these, don't invent them

- `halo@pathrix.id` is a placeholder. **Ask before shipping it.** Override with
  `VITE_CONTACT_EMAIL`.
- The "Jelajahi Peta" CTA points at `#fitur`. It needs the real WebGIS URL.
  Override with `VITE_MAP_URL`.
- The contact form has no backend. With `VITE_CONTACT_ENDPOINT` set it POSTs JSON
  and reports real success or failure; without it, it composes a `mailto:`. It
  **never fakes a success state** — do not "simplify" this into an inline
  confirmation.
- Team names are deliberately absent.
- No statistics, metrics, or invented numbers anywhere. This was an explicit
  product decision.
- No domain is configured, so `hreflang` alternates between `/` and `/en/` are
  root-relative, which search engines may not credit. Override with
  `VITE_SITE_URL` (no trailing slash) once one is assigned.

## Do not

- Do not add a hero video, particle field, gradient mesh, blob shape, or animated
  gradient text.
- Do not add emoji, badge rows, testimonial blocks, logo clouds, pricing, or FAQ
  accordions.
- Do not add statistics or numeric claims.
- Do not introduce a third page background colour.
- Do not reintroduce `IntersectionObserver` gating on the render loop.
- Do not rotate the camera or the scene root to reframe the diorama; rotate the
  `world` group so the lights stay put.
- Do not present the generated `public/img/` art as real product screenshots or
  real survey photography.
