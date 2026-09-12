# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).

## Read AGENTS.md first

**`AGENTS.md` is the authoritative spec for this repo** — stack rationale, every dev/verify command, the diorama's six regression-prone fixes, GSAP rules, responsive breakpoints, image encoding, caching policy, and an explicit "Do not" list. It is long because most of it documents bugs that were already hit and fixed once; re-reading it is cheaper than re-discovering them. What follows here is the condensed version — when in doubt, or before touching `src/hero/`, GSAP, images, or caching, read the relevant section of `AGENTS.md` in full.

The design prototype **`Pathrix.dc.html`** is the visual spec for the Hero, which stays matched to it — do not redesign the Hero or add imagery/icons it doesn't already have. The other six sections (Masalah, CaraKerja, Fitur, Audiens, Kontak, Footer) have since moved on to a bold card-based visual system documented in `DESIGN.md` — a deliberate evolution past the prototype, not a violation of it. No new sections are added either way. All copy is Indonesian, copied verbatim from the prototype; the tagline is the one English string. `Pathrix Hero.dc.html` is a rejected earlier hero direction — reference only, never port from it.

## Commands

```
npm run dev              # dev server (:5174)
npm run build            # tsc --noEmit && vite build && prerender — all three steps required
npm run typecheck
npm run serve             # dist/ on :4174 WITH cache headers + gzip — verify against THIS, not preview
npm run preview           # vite preview on :4173, no cache headers — not representative

npm run verify            # 66 browser checks (needs npm run serve running; the
                          #   connector scrub check is flaky — see AGENTS.md)
npm run verify:pause      # render loop pauses off-screen
npm run verify:weight     # transfer weight + cache reuse
npm run verify:framing    # diorama framing + image content
npm run verify:vehicles   # heading, terrain clearance, traffic gaps (needs npm run dev, NOT dist/)
npm run shots              # reference screenshots into scripts/shots/
npm run images             # scripts/encode-images.sh — rasterize scripts/art/ into public/img/
npm run model              # scripts/encode-model.sh — pack the Tugu glTF into public/hero/
```

Both `verify*` scripts pin a cached Chromium via Playwright; override with `CHROME_PATH` if it mismatches. `verify:vehicles` must run against `npm run dev`, not `dist/`, because it reads `window.__pathrixDebug`, which is only set behind `import.meta.env.DEV`.

There is no unit test runner — verification is done via the Playwright scripts above driving a real browser against a real build.

## Architecture

Vite 5 + React 18 + TypeScript, three.js `0.180.0` (pinned), GSAP 3.12 + ScrollTrigger. No Tailwind/UI kit/CSS framework, no analytics, no cookie banner. Static build, no server runtime.

```
src/main.tsx            hydrates prerendered markup (falls back to client render)
src/entry-server.tsx    build-time SSR render entry (feeds prerender.mjs)
src/App.tsx             page composition + scroll-reveal wiring
src/content/site.ts     locale-independent values (env config, geometry, nav ids)
src/content/{id,en}.ts  page copy per locale (id verbatim from Pathrix.dc.html);
                         see AGENTS.md "Internationalization" before touching i18n
src/components/         one .tsx + one .module.css per page section
src/lib/                scroll plumbing, media queries, GSAP reveal helpers
src/styles/tokens.css   design tokens (colors, fonts, rhythm) — see below
src/hero/               the three.js diorama, ported from uploads/hero-export
scripts/                build (prerender.mjs, serve.mjs, encode-images.sh,
                         encode-model.sh; art/ holds the sources) and
                         Playwright verification suite (verify*.mjs, shots.mjs)
public/img/             encoded placeholder imagery (committed, generated — not real content)
public/hero/            Tugu glTF (CC BY-NC-ND, credited in the footer) +
                         static SVG diorama fallback for no-WebGL
public/_headers          Netlify/Cloudflare cache policy — must mirror vercel.json
uploads/                 PRD + original standalone diorama reference (not built)
```

**Design tokens** (`src/styles/tokens.css`): exactly two page background colors — `--sky-*` (light) and `--ink*` (dark). Do not introduce a third. Two token values (`--on-dark-meta`, `--on-light-meta`) intentionally deviate from the prototype for WCAG AA contrast — do not revert them to match the prototype exactly. `--blue`/`--blue-lift` and `--warm`/`--warm-text`/`--warm-deep` were retinted (2026-09) to the official PATHRIX brand mark's hex values (sampled from the proposal PDF), replacing the earlier prototype-only "instrument-blue"/Tugu-material gold — the Home/diorama scene under `src/hero/` was left untouched and keeps its own colors, so the diorama gold and the page's `--warm` are no longer required to match hex-for-hex.

**The diorama (`src/hero/`)** is a fixed-camera three.js scene (no OrbitControls, no scroll-linked camera) ported as-is from the prototype. It is rotated 120° via a `world` group (`WORLD_SPIN` in `diorama.js`), never via the camera or scene root, because lights are deliberately left un-rotated. All road vehicles share one `ROAD_SPEED` and lane center — no per-vehicle speed/offset, or the tight-radius geometry causes visible overlap. The Tugu is a **loaded glTF**, not procedural: it is CC-BY-NC-ND, so the footer credit is a licence condition, not decoration; its environment map goes on the **metal only** (on the white marble it flattens the shading); and the procedural monument stays in `tugu.js` as the load-failure fallback. Full rationale (render-loop visibility gating, resize-clears-buffer, transparent canvas, vehicle heading via `Matrix4.lookAt` not `Object3D.lookAt`) is in AGENTS.md's "Diorama" section — read it before changing anything under `src/hero/`.

**Prerendering**: SSR uses `renderToStaticMarkup`, so **no two adjacent text nodes in one element** — `{value}{" "}<a>` breaks hydration. `scripts/prerender.mjs` runs after `vite build`, SSR-renders `src/entry-server.tsx`, and substitutes the markup into `<!--app-html-->` in `dist/index.html`; `main.tsx` then hydrates. The SSR build uses `configFile: false` and must not inherit the client build's `manualChunks` (three/gsap are SSR externals). Anything touching `document` at module scope breaks this.

**GSAP**: `gsap.from` only, never `.to` — if GSAP fails to load, the page must already be fully visible, just unanimated. Every call site is a guarded dynamic import.

**Env vars** (`.env.example`): `VITE_MAP_URL`, `VITE_CONTACT_EMAIL`, `VITE_CONTACT_ENDPOINT` — all currently unresolved placeholders (see AGENTS.md "Still unresolved"). Ask before shipping a change that resolves these rather than assuming.

## Commit messages

Format: `<type>: <message>` (e.g. `feat: add locale-aware nav links`, `fix: correct diorama vehicle heading`). Single line only — no body/description paragraph. A `Co-Authored-By:` trailer is fine to include.

## Do not

- Add a hero video, particle field, gradient mesh, blob shape, or animated gradient text.
- Add emoji, badge rows, testimonials, logo clouds, pricing, or FAQ accordions.
- Add invented/fabricated numeric claims. Figures cited from the MAPID competition proposal (with a named source, e.g. "Satu Data Indonesia, 2025") are allowed in small, footnoted form — this was relaxed 2026-09 (see Masalah's stats row) — but nothing uncited or made up.
- Introduce a third page background color.
- Reintroduce `IntersectionObserver` gating on the diorama render loop.
- Rotate the camera or scene root to reframe the diorama — rotate the `world` group.
- Present `public/img/` generated placeholder art as real product screenshots or survey photography.
- Remove the footer Tugu model credit — it is a CC-BY licence condition.
- Set `scene.environment` globally to light the Tugu; it re-shades the whole island and flattens the marble. The env map goes on the model's metal only.
