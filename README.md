# Pathrix — landing page

Production landing page for **Pathrix**, a WebGIS-based AI agent for multimodal
mobility in Yogyakarta, built for the **MAPID WebGIS Competition 2026 — Mass
Transportation Edition**.

One scrolling page in Indonesian, with an English translation at `/en/`. The
hero is a real-time three.js diorama of the Tugu Pal Putih roundabout: a fixed
camera, a hex-tiled island, and traffic (TransJogja, KRL, taxi, becak, andong)
circling on shared lanes.

Static build. No server runtime, no analytics, no cookie banner.

> **`AGENTS.md` is the authoritative spec.** It documents every command, the
> diorama's regression-prone fixes, the GSAP rules, the caching policy, and an
> explicit "Do not" list — most of it written after a bug was hit once already.
> This README is the front door; read `AGENTS.md` before changing anything under
> `src/hero/`, GSAP, images, or caching.

## Quick start

```bash
npm install
npm run dev          # http://localhost:5174
```

To check anything that involves the real build — cache headers, transfer weight,
prerendered markup — use `npm run serve`, not `npm run preview`:

```bash
npm run build        # tsc --noEmit && vite build && prerender (all three required)
npm run serve        # dist/ on :4174 with _headers applied and gzip
```

Copy `.env.example` to `.env.local` if you need to override the placeholders.
All four values are unresolved by design — see "Still unresolved" in `AGENTS.md`
and **ask before resolving one**.

## Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server on `:5174` |
| `npm run build` | Typecheck, build, then prerender both locales |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run serve` | `dist/` on `:4174` **with** cache headers and gzip |
| `npm run preview` | `vite preview` on `:4173` — no cache headers, not representative |
| `npm run verify` | 66 browser checks (needs `npm run serve`) |
| `npm run verify:pause` | Render loop pauses off-screen |
| `npm run verify:weight` | Transfer weight and cache reuse |
| `npm run verify:framing` | Diorama framing and image content |
| `npm run verify:vehicles` | Vehicle heading, terrain clearance, traffic gaps |
| `npm run shots` | Reference screenshots into `scripts/shots/` |
| `npm run images` | Re-encode placeholder art into `public/img/` |
| `npm run model` | Re-pack the Tugu glTF into `public/hero/` |

## Verification

There is no unit test runner. Verification is Playwright driving a real browser
against a real build.

`verify:vehicles` must run against `npm run dev`, not `dist/` — it reads
`window.__pathrixDebug`, which only exists behind `import.meta.env.DEV`. The
`verify*` scripts pin a cached Chromium; override with `CHROME_PATH` if it
mismatches.

Current state: **65–66 of 66 checks pass.** The variance is one flaky check,
`connector drawn on scroll`, which races a GSAP scrub and was already flaky
before the current work. Treat a lone failure there as noise and any other
failure as real.

Measured cold transfer is **371KB gzipped**, of which **72KB** is the critical
path. Repeat visits transfer essentially nothing. three.js and the Tugu model
are both deferred — the hero wordmark paints first.

## Layout

```
src/main.tsx            hydrates the prerendered markup
src/entry-server.tsx    build-time SSR entry (feeds scripts/prerender.mjs)
src/App.tsx             page composition + scroll-reveal wiring
src/content/            site.ts (locale-independent) + id.ts / en.ts (copy)
src/components/         one .tsx + one .module.css per section
src/lib/                scroll plumbing, media queries, GSAP reveal helpers
src/styles/tokens.css   design tokens
src/hero/               the three.js diorama
scripts/                build + Playwright verification; art/ holds asset sources
public/img/             encoded placeholder imagery (generated, committed)
public/hero/            Tugu glTF + static SVG fallback for no-WebGL
public/_headers         Netlify/Cloudflare cache policy — must mirror vercel.json
```

`public/img/` is **generated placeholder art, not real content** — do not
present it as product screenshots or survey photography.

## Deploying

Static output in `dist/`. Cache policy lives in two files that must stay in
sync: `public/_headers` (Netlify, Cloudflare Pages) and `vercel.json` (Vercel).
Fingerprinted `/assets/` is immutable; the HTML shells at `/` and `/en/` must
never be cached, or clients pin to deleted chunk hashes.

One thing to check on the real host: whether it compresses `model/gltf-binary`.
`npm run serve` does, taking the Tugu from 153KB to 93KB. **This has not been
verified on the production host** — if it does not compress, the model costs
153KB instead.

## Third-party assets and licences

### Tugu Jogja 3D model — CC BY-NC-ND 4.0

The monument in the hero diorama is **not** original work. It is:

> "Tugu Jogja" (https://sketchfab.com/3d-models/tugu-jogja-c3ab136a6fb643c09c1a4fc30402dafd)
> by **Djonk** (https://sketchfab.com/Djonk), licensed under
> **CC-BY-NC-ND-4.0** (http://creativecommons.org/licenses/by-nc-nd/4.0/).

The full licence text ships with the asset at
`public/hero/tugu-jogja.license.txt`, and the source export is kept in
`scripts/art/tugu-jogja/`.

What each clause means here:

- **BY — attribution.** Satisfied by the credit line in the page footer, in both
  locales (`footer.modelCredit` in `src/content/id.ts` and `en.ts`). **That line
  is a licence condition, not decoration. Do not remove it.**
- **NC — non-commercial.** This licence does not permit commercial use. A
  product landing page is a borderline-to-commercial context, and this was
  flagged and knowingly accepted as a risk. **Re-raise it before the site is
  used to sell anything**, and source a licence-clean replacement if so.
- **ND — no derivatives distributed.** The build re-encodes the file (meshopt
  geometry, 512px WebP texture) and the loader retints its gold to match the
  page accent. That is arguably a derivative work.

If a licence-clean model is sourced later, only the `.glb` and the credit string
need to change — `src/hero/landmarks/tugu.js` derives its scale from a height
ceiling rather than hard-coding one.

### Quarkiz typeface — Personal Use Only

The `PATHRIX` wordmark is set in **Quarkiz**, self-hosted from `public/fonts/`
as a subset woff2. Its licence (`uploads/quarkiz-font/Befonts-License.txt`) says:

```
License: Personal Use Only
Link: https://befonts.com/quarkiz-font.html
```

**This is unresolved and is a larger exposure than the model licence above.**
Serving the font from a public site is redistribution, and a competition entry
for a product is not obviously personal use. Two ways out: buy a commercial
licence from the foundry, or replace the wordmark face. Decide before a public
deploy.

### Other typefaces

**Archivo** and **IBM Plex Mono** carry the body and mono text and are loaded
from Google Fonts. Both are SIL Open Font License 1.1 — no issue.

### Everything else

The imagery in `public/img/` is generated from sources in `scripts/art/`
(`webgis.svg`, `fields.py`) and is original to this repo.

## Project licence

None granted. `package.json` is `private: true`; this repository is a
competition submission, not a distributable package. The third-party terms above
apply independently of that and are not overridden by it.
