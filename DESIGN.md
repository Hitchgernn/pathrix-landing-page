---
name: Pathrix
description: AI Agent for Multimodal Mobility Navigation in Yogyakarta
colors:
  instrument-blue: "#0a65b8"
  instrument-blue-lift: "#6ca3d4"
  tugu-gold: "#fac13c"
  tugu-gold-lit: "#ffd166"
  tugu-gold-deep: "#775403"
  eco: "#3fa35c"
  eco-text: "#7bd99a"
  eco-deep: "#1f6b3d"
  sky-pale: "#eff5fa"
  sky: "#dfeaf3"
  sky-deep: "#c6d9e8"
  ink: "#101e2a"
  ink-deep: "#0c1822"
  ink-soft: "#17293a"
  paper: "#e7f0f7"
typography:
  display:
    fontFamily: "Quarkiz, Archivo, sans-serif"
    fontSize: "clamp(52px, 15.6vw, 232px)"
    fontWeight: 400
    lineHeight: 0.82
    letterSpacing: "0.005em"
  headline:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "clamp(30px, 4.4vw, 58px)"
    fontWeight: 600
    lineHeight: 1.07
    letterSpacing: "-0.035em"
  title:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "clamp(19px, 2.1vw, 26px)"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "clamp(15px, 1.5vw, 19px)"
    fontWeight: 400
    lineHeight: 1.62
  label:
    fontFamily: "IBM Plex Mono, ui-monospace, monospace"
    fontSize: "11px"
    fontWeight: 500
    lineHeight: 1.6
    letterSpacing: "0.2em"
rounded:
  control: "999px"
  panel: "clamp(12px, 1.5vw, 20px)"
  card: "clamp(20px, 2.2vw, 28px)"
  focus-ring: "4px"
spacing:
  gutter: "clamp(20px, 4.4vw, 64px)"
  section-y: "clamp(80px, 10vw, 150px)"
  shell-max: "1180px"
shadows:
  card: "0 24px 48px -24px rgba(16, 30, 42, 0.28)"
  card-sm: "0 12px 28px -14px rgba(16, 30, 42, 0.24)"
components:
  card:
    backgroundColor: "{colors.sky-pale}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    shadow: "{shadows.card}"
  card-payoff:
    backgroundColor: "{colors.tugu-gold}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    shadow: "{shadows.card}"
  button-primary:
    backgroundColor: "{colors.instrument-blue}"
    textColor: "#f0f6fb"
    rounded: "{rounded.control}"
    padding: "0 clamp(26px, 3vw, 36px)"
  button-primary-hover:
    backgroundColor: "{colors.ink-soft}"
    textColor: "#f0f6fb"
    rounded: "{rounded.control}"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.paper}"
    rounded: "{rounded.control}"
    padding: "0 28px"
  button-outline-hover:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
  index-marker-lift:
    backgroundColor: "{colors.instrument-blue-lift}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    size: "38px"
  index-marker-warm:
    backgroundColor: "{colors.tugu-gold}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    size: "38px"
---

# Design System: Pathrix

## Overview

**Creative North Star: "The Field Instrument"** (Hero) **+ the Bold Card System (2026-09)** (everything else)

The system now has two registers, deliberately, not by drift:

- **The Hero** is still, and only, "The Field Instrument": Pathrix's fixed-camera 3D diorama reads like a precision survey instrument, matched to the original design prototype (`Pathrix.dc.html`) exactly. No bordered cards, no drop-shadow, no icon kit — hairline logic, mono-font labels, flat surfaces. This part of the system is out of scope for the redesign below and keeps every rule this document already gave it.
- **The other six sections** — Masalah, CaraKerja, Fitur, Audiens, Kontak, Footer — have since moved on to a bolder, illustrated, shadowed-card visual language (see "Bold Card System" below). This is a deliberate evolution past the prototype, reviewed and adopted on 2026-09, not a lapse from the original discipline: the flat/hairline rules below described the *whole* page as of the prototype; they now describe the Hero only.

The page's own duality — a pale sky above, deep ink below, with the 3D Tugu diorama as the seam between them — still frames the Hero as an instrument reading a place. The body sections instead read as **light cards floating on the same ink background** — the Bold Card System reuses `--sky-0` (already a token, previously unused as a section background) as a foreground *card surface*, so "exactly two page background colors" stays literally true even though the page now looks materially bolder below the fold.

Color discipline still follows one logic across both registers: one warm accent (`tugu-gold`) appears at most once per section, used like a compass needle or a single flagged reading — never a decorative wash — whether it lands on a flat Hero surface or a shadowed card. The Bold Card System adds one narrowly-scoped second accent, `eco` (green), reserved for carbon-savings claims only — see Colors below.

**Key Characteristics:**
- Exactly two page background colors — pale sky and deep ink — never a third. Cards are a foreground surface built from the existing pale-sky token, not a new background.
- The Hero stays flat by default; hairline borders/dividers do its separating work. The six body sections now use shadowed, rounded cards as their default separating device instead of hairlines.
- One warm accent (`tugu-gold`) per section, at most, in either register. The body sections may additionally use one narrowly-scoped `eco` accent alongside it, on carbon-savings claims only.
- Mono-font, uppercase, letter-spaced labels for every piece of metadata (eyebrows, index numbers, captions, form field labels) — the display face is reserved solely for the wordmark, body copy never goes mono. Unchanged by the redesign.
- Fluid `clamp()` sizing throughout; no fixed-breakpoint type jumps. Unchanged by the redesign.
- Across the six body sections, the grid's last item consistently gets a bolder, warm-accented "payoff" treatment — see "Last Item Gets the Payoff" below. This convention is what ties the six sections together as one system.

## Colors

Two neutral registers (pale sky / deep ink) carry the page; one blue does all interactive and link work; one gold accent is spent deliberately, at most once per section. The Bold Card System (2026-09) adds one narrowly-scoped second accent, `eco`, reserved for carbon-savings claims in the six body sections — see "Eco" below.

### Primary
- **Instrument Blue** (`#0a65b8`): links, primary CTA fills on light sections, form focus borders, submit buttons. The page's one interactive color. Sampled (2026-09) from the official PATHRIX brand mark's icon blue, replacing an earlier invented instrument-blue — see "Brand alignment" below.
- **Instrument Blue, Lift** (`#6ca3d4`): eyebrow labels and index numbers on dark sections, focus-visible outline ring, lift-accent index markers, hover state for the inverted nav CTA. A lighter tint of Primary, not a separate hue — used wherever Primary would be too heavy against ink.

### Secondary
- **Tugu Gold** (`#fac13c`): background-only accent — the warm index marker, and (2026-09) the fill of each section's one payoff card. Sampled (2026-09) from the brand mark's gold, same source as Instrument Blue above.
- **Tugu Gold, Lit** (`#ffd166`): text use on dark backgrounds only (11.73:1 on ink, 12.45:1 on ink-deep, 10.29:1 on ink-soft) — the active nav-link underline, the CTA arrow's hover color.
- **Tugu Gold, Deep** (`#775403`): text use on light backgrounds only (5.63:1 on sky-1) — the Kontak form's error note. Never interchange the three; each exists because a single yellow cannot pass AA as both foreground-on-light and foreground-on-dark.

### Eco (2026-09)
A second accent, added for the Bold Card System, scoped narrowly to one job: marking a claim as a *carbon-savings* claim, wherever the copy already makes one (Fitur, CaraKerja, Audiens, Kontak already carry this language). It never stands in for `tugu-gold`, never becomes a section background, and is not spent per the One Warm Rule's budget — the two accents do different jobs (gold flags "this is the section's one flagship item," eco flags "this specific claim is about carbon") and can legitimately coexist on the same card.
- **Eco** (`#3fa35c`): background-only accent — the eco-chip fill on a card (e.g. the small chip on Fitur's payoff cell, alongside its `tugu-gold` fill).
- **Eco, Text** (`#7bd99a`): text use on dark backgrounds only.
- **Eco, Deep** (`#1f6b3d`): text use on light backgrounds only — e.g. Kontak's "sent" success note, which moved here from `--blue` (2026-09) to read as a genuine success state rather than a generic info one.
Same three-value methodology as Tugu Gold: verify each of these against every background it actually sits on (`--sky-1`, `--ink`/`--ink-deep`/`--ink-soft`, and `--warm`'s gold fill for the eco-chip-on-payoff-card case) before shipping — do not assume a green that passes on ink also passes on gold.

### Brand alignment (2026-09)
Instrument Blue and Tugu Gold were retinted from the earlier prototype-only values (`#1f6592` / `#d9a521`, the latter matched hex-for-hex to the 3D Tugu monument's material) to the official PATHRIX brand mark's own hex values, sampled directly from the mark as printed in the MAPID competition proposal. The Home hero and its `src/hero/` diorama were **not** touched — they keep their original palette — so the diorama's gold and the page's Tugu Gold are visually close but no longer required to match hex-for-hex. Every AA contrast ratio documented above was re-verified against the same backgrounds after the retint; none regressed.

### Neutral
- **Sky, Pale / Sky / Sky, Deep** (`#eff5fa` / `#dfeaf3` / `#c6d9e8`): the light background family — the hero's radial gradient runs pale-to-deep from top, `sky` is the flat page background for light sections (Kontak).
- **Ink / Ink, Deep / Ink, Soft** (`#101e2a` / `#0c1822` / `#17293a`): the dark background family — `ink-deep` is one step darker for Fitur, `ink` is the base for Masalah/Kontak-adjacent/Footer, `ink-soft` is the wordmark/body-text color on light sections and the placeholder image backing.
- **Paper** (`#e7f0f7`): the base text-on-dark and skip-link foreground color; every `on-dark-*` token is a `rgba()` step of this same value at different opacities, never a separate hex.

### Named Rules
**The One Warm Rule.** The gold accent appears at most once per section — one marker, one underline, one arrow-hover, or (2026-09) one solid-fill payoff card — never two. Its rarity is what makes it read as a flagged value rather than decoration.

**The Payoff Tile pattern (2026-09), now "Last Item Gets the Payoff."** The section's one warm-accented item gets a real solid-fill treatment, not just a colored marker — and in the Bold Card System it is specifically the *last* item in the section's grid, made explicit as the convention tying the six body sections together: CaraKerja's step 03 card gets a solid `tugu-gold` fill, Fitur's item 06 (the Sustainability Tracker cell) gets a solid `tugu-gold` fill plus one small `eco`-accent chip on its carbon-savings claim, Audiens' group 5 (UMKM & Pariwisata) becomes a full-width `tugu-gold` closing banner cell. Masalah previews the same visual language one step earlier — its two stat cards are the first place in the page a flat panel becomes an elevated `--card-surface` card — without a single one of the two claiming the warm fill, since with only two items there is no clear "last of several" to single out. This is still the One Warm Rule — exactly one warm-filled card per section, at most — just spent as a bigger, bolder block instead of a small marker. Text inside a warm-filled card uses `ink`/`rgba(ink, .72–.78)`, not the light `on-dark-*` tokens (see each component's CSS comment for the exact alpha and its measured contrast ratio).

**The Brand Gradient Motif (2026-09).** `--gradient-accent` (`blue-lift` → `warm`) is the system's one recurring decorative line: the seam at the top of Masalah and the top of the Footer, the top edge of Fitur's concept-shot frame, the Kontak form's top cap (using the light-section `blue`/`warm` pair instead, since `blue-lift` is tuned for dark backgrounds), and the active nav-link underline. It is a bar/border only, never text — it carries no contrast requirement of its own. Don't invent a second gradient; reuse this one. (CaraKerja's self-drawing connector line, formerly also part of this motif, was removed along with the hairline step layout it belonged to — see "Card System" below.)

**The Two-Background Rule.** The entire page uses exactly two background registers, sky and ink. A third background color is a system violation, not a stylistic choice — confirmed non-negotiable in the project's own instructions.

**The Opacity-Not-New-Color Rule.** Every text-on-dark and text-on-light step (`on-dark-head/body/body-soft/body-quiet/meta`, `on-light-body/meta/label`) is an alpha step of `paper` or `ink-soft`, never a new hex. Three of these steps (`on-dark-meta` at .56, `on-light-meta` at .7, `warm-deep`) were deliberately raised above the original design-prototype values to clear WCAG AA — do not "simplify" them back down to match the prototype exactly.

## Typography

**Display Font:** Quarkiz (self-hosted, subset to A–Z/a–z only), falling back to Archivo
**Body Font:** Archivo, with system-ui fallback
**Label/Mono Font:** IBM Plex Mono, with ui-monospace fallback

**Character:** A confident geometric grotesque (Archivo) carries every reading task — headlines, body, buttons — while a custom display face appears exactly once, at cinematic scale, for the word PATHRIX itself. The monospace face is the instrument voice: every label, index number, eyebrow, and caption in the system is IBM Plex Mono, uppercase, letter-spaced — it never carries a sentence, only metadata.

### Hierarchy
- **Display** (400, `clamp(52px, 15.6vw, 232px)`, line-height 0.82): the PATHRIX wordmark only. Never reused for section headings.
- **Headline** (600, `clamp(30px, 4.4vw, 54–58px)`, line-height ~1.07, letter-spacing -0.035em): every section's `<h2>` — Masalah, Cara Kerja, Fitur, Kontak.
- **Title** (600, `clamp(19px–20px, 2.1vw, 26px)`, letter-spacing -0.02em): step titles and feature-cell titles within a section grid.
- **Body** (400, `clamp(15px, 1.5vw, 19px)`, line-height 1.6–1.62): paragraph copy; opacity-stepped color rather than size carries emphasis. Kontak's pitch copy caps at 44ch.
- **Label** (500, 11px, letter-spacing 0.2–0.26em, uppercase, mono): eyebrows, field labels, captions, the hero tagline, the footer competition line. The system's most-used non-body role.

### Named Rules
**The Mono-Is-Metadata Rule.** IBM Plex Mono is reserved for labels, indices, and captions — the instant a mono string would run longer than a tag or a short line, it belongs in Archivo instead.

## Layout

A single centered container (`--shell: 1180px`) holds every section; horizontal breathing room comes from one fluid gutter token (`clamp(20px, 4.4vw, 64px)`) shared by the nav, hero, and every section shell — never a per-component margin. Vertical rhythm between sections is also fluid: `clamp(80–88px, 9–12vw, 130–180px)` top/bottom padding, heavier at the top of ink sections that follow the hero.

Grids (Fitur's feature grid, Cara Kerja's step grid, Kontak's two-column pitch/form split, the field-photo grid) all use the same defensive pattern: `grid-template-columns: repeat(auto-fit, minmax(min(Xpx, 100%), 1fr))`. The `min(Xpx, 100%)` wrapper is load-bearing — a bare `minmax(320px, 1fr)` overflows once the floor plus the page gutter exceeds a narrow viewport, so every responsive grid in the system must wrap its minmax floor this way.

One hard breakpoint, content-driven rather than device-driven: **900px** (nav collapses from inline links to a hamburger; the hero tagline switches from a single hairlined row to a wrapped block — both variants ship in the markup so first paint is correct without JS). Everything else — type scale, spacing, the hero diorama's overlap with the wordmark, and every body-section card grid's column count — is fluid `clamp()`/`auto-fit`, not a breakpoint jump. (CaraKerja used to gain a second breakpoint, 1040px, at which a hairline connector line appeared between step markers; that connector and the layout it depended on are gone — see "Card System" below — so 1040px is no longer a breakpoint anywhere in the system.)

## Elevation & Depth

Two registers, matching the Hero/body-section split introduced above:

- **The Hero stays flat by default.** Every panel, cell, and container in it is a solid fill separated by 1px hairlines (`--on-dark-line`, `rgba(23,41,58,.14–.25)`) — there is no ambient card-shadow vocabulary there. One exception carries a shadow: the hero's primary CTA (`Jelajahi Peta`), floating over the diorama.
- **The six body sections (2026-09) are shadowed cards by default.** Masalah, CaraKerja, Fitur, Audiens, Kontak, and Footer now build their panels, grid cells, and step/feature cards from `--card-surface` + `--shadow-card`/`--shadow-card-sm` — see "Card System" below. The Kontak form panel was this system's original seed (it carried a shadow before the rest of the page did); it is no longer an exception, just the first instance of the now-general body-section pattern.

### Shadow Vocabulary
- **Primary-action lift** (`box-shadow: 0 14px 34px -12px rgba(23, 41, 58, 0.7)`): the hero CTA. Hero-only; not part of the card system below.
- **`--shadow-card`** (`box-shadow: 0 24px 48px -24px rgba(16, 30, 42, 0.28)`): the standard card shadow across all six body sections — promoted from what was previously the Kontak form's one-off value. Used on CaraKerja's step cards, Fitur's bento cells, Audiens' group cards, and Kontak's form panel.
- **`--shadow-card-sm`** (`box-shadow: 0 12px 28px -14px rgba(16, 30, 42, 0.24)`): a lighter variant for smaller cells — Masalah's stat cards.
- Still not a general elevation *scale* — there is no "sm/md/lg" ladder beyond these two card values, and the Hero's CTA shadow is not reused elsewhere. A new body-section component reaches for `--shadow-card`/`--shadow-card-sm`; a new Hero component does not reach for either.

### Named Rules
**The Flat-Unless-Floating Rule (Hero-only, 2026-09).** Within the Hero, shadows are absent everywhere except the primary CTA. A Hero component may claim one only when it visually floats over the diorama, not merely because it wants visual weight.

**The Cards-Are-the-Default Rule (2026-09, body sections).** Outside the Hero, a shadowed `--card-surface` panel is now the *default* way to separate content, not an exception that must earn its floating justification — this reverses the old Flat-Unless-Floating rule for these six sections specifically. Hairlines are no longer the primary separating device there; a bare hairline grid would be a regression to the pre-2026-09 system, not a valid alternative.

## Shapes

Pill radius (`999px`) is the system's one interactive-control shape: every button, the burger toggle, the skip link, and the circular index markers (38px) use it, no exceptions. Non-interactive containers use one of two fluid radii, by size: `--radius-panel` (`clamp(12px, 1.5vw, 20px)`, formerly `clamp(10–20px)` — the image slot, the field-photo grid, the Kontak form panel) for smaller panels, and (2026-09) `--radius-card` (`clamp(20px, 2.2vw, 28px)`, larger) for the Bold Card System's bigger bento/step cards in Masalah, CaraKerja, Fitur, Audiens, and Footer. Both scale with the container so nothing looks clipped at small sizes. Corners elsewhere are square. Borders, where present, are always 1px and low-opacity (`rgba` at .14–.28), never a solid saturated stroke — this still holds for the Hero; the body-section cards below separate with shadow instead of a border.

## Components

Two vocabularies now, by register. The Hero stays restrained and instrumented: every control there reads as a measuring-device element, not a consumer-app affordance — pill buttons, hairline-bordered fields with mono uppercase labels, nothing decorative for its own sake. The six body sections (2026-09) instead use the bolder, shadowed, illustrated Card System described below — still built from the same color/type tokens, but the "flat until it earns a shadow" restraint no longer applies to them.

### Buttons
- **Shape:** pill (999px radius), no exceptions.
- **Primary:** `instrument-blue` background, `#f0f6fb` text, height 44–58px depending on context (nav 44px, hero 58px, form submit 56px). Hover swaps the fill to `ink-soft`.
- **Outline (Fitur's "Buka peta"):** transparent fill, 1px `rgba(paper, .28)` border, `paper` text. Hover fills solid `paper` with `ink` text — a full invert, not a tint.
- **Nav CTA, inverted state:** once the nav has scrolled past ~72% of the first viewport, the primary button swaps to `paper` background / `ink` text, hovering to `blue-lift`.

### Index Markers (signature component, CaraKerja only as of 2026-09)
Circular 38px badges carrying the mono step/index number (`01`–`03`). Two variants only: **lift** (`blue-lift` background, `ink` text — the default) and **warm** (`tugu-gold` background, `ink` text — spent exactly once per section, on whichever item is the section's payoff). This is the clearest expression of the One Warm Rule in the component layer. As of the Bold Card System, this component's remit narrowed to CaraKerja's step cards (each card carries its `step.index` as a pill badge); Fitur and Audiens moved their per-item marker to the Icon Badge below instead, since those sections' items aren't an ordinal sequence in the same way steps are. Where a numbered badge is still used, it keeps the lift/warm two-variant rule.

### Icon Badges (2026-09, Card System)
Circular icon-in-circle badges using one `@phosphor-icons/react` glyph per item, replacing the plain dot/marker these cells used before — Masalah (one small glyph above each stat card's value), Fitur (item 02's icon-in-circle card; items 03–05 similarly), and Audiens (the icon badge on each of its four standard cards in the 2×2 grid). Icon choice is derived from the item's index/content, not stored as new copy data. Same lift/warm two-variant rule as Index Markers: a payoff card's badge (Fitur's item 06, Audiens' group 5) may earn the warm fill; every other badge uses the lift tint.

### Eyebrow / Section Tag (2026-09)
Every section eyebrow (`Masalah`, `CaraKerja`, `Fitur`, `Audiens`, `Kontak`) is now a pill chip — `height: 26px`, `border-radius: 999px`, a `.1–.14` alpha tint of the section's own accent (`blue-lift` on dark sections, `blue` on Kontak's light section) — rather than bare mono text. Still mono/uppercase/letter-spaced underneath; only the container changed. Keep every new section's eyebrow on this pattern rather than reverting to plain text.

### Card System (2026-09) — supersedes "Hairline Grid, not cards"
Before 2026-09, this system had no bordered-card component: feature and step grids were a single `1px` gap of `on-dark-line` between flat cells. That description now applies to the Hero only (which has no grids and is unaffected). The six body sections build every panel and grid cell from a real card:

- **Surface:** `--card-surface` (`var(--sky-0)` — a reuse of the existing light-background token as a *foreground* surface, not a new page background; the Two-Background Rule still holds literally).
- **Radius:** `--radius-card` (`clamp(20px, 2.2vw, 28px)`) for step/bento cards, `--radius-panel` (`clamp(12px, 1.5vw, 20px)`) for smaller panels — see Shapes above.
- **Shadow:** `--shadow-card` for standard cards, `--shadow-card-sm` for smaller cells (Masalah's stat cards) — see Elevation & Depth above.
- **Text on the card:** light-surface tokens (`--on-light-body`/`--on-light-meta`/`--on-light-label`) already existed for Kontak's form and are reused here rather than inventing new ones, since the card surface is the same `--sky-0` register.
- **Internal padding** stays fluid (`clamp(26–40px)`), unchanged from the old hairline-cell pattern.

Per-section shapes on this same system:
- **Masalah:** two elevated stat cards (`--shadow-card-sm`), each with one small Icon Badge glyph above its value — the system's first, smallest instance of the card language (see "Last Item Gets the Payoff" in Colors).
- **CaraKerja:** three bold illustrated cards (`--shadow-card`, `--radius-card`), each with a hand-authored SVG illustration panel, an Index Marker pill for `step.index`, and title/body — no connector line between them (removed; see Layout).
- **Fitur:** an asymmetric bento grid within the unchanged 6-item contract — item 01 spans two tracks with the existing product screenshot in a browser-chrome frame; items 02–05 are standard icon-badge cards; item 06 is the full payoff card.
- **Audiens:** a 2+2+1 bento — four standard icon-badge cards, then group 5 as a full-width payoff banner.
- **Kontak:** structurally unchanged; its form panel was this system's original seed and now simply uses the shared `--shadow-card`/`--radius-panel` tokens instead of its own one-off values.
- **Footer:** a 3-column grid (brand block, nav links, team/stack), collapsing via `auto-fit`/`minmax(min(Npx,100%),1fr)` below 900px, consistent with the rest of the page's defensive grid pattern — not itself a card, but built on the same foundation tokens.

**Bento spans.** A grid's one payoff card claims `grid-column: span 2` (Fitur) or a full-width row (Audiens) on the section's `auto-fit` grid — it degrades safely on narrow viewports because a 1-column grid simply caps the span at 1, no media query needed.

The concept-visual frame (`.shot`) and its 1px `rgba(paper, .16)` border, plus its mono figcaption naming itself as a concept, are unaffected by this change — Fitur's item 01 still frames the placeholder screenshot this way (now inside a browser-chrome frame on top of that).

### Inputs / Fields
- **Style:** 1px `rgba(ink, .2)` border, 10px radius, `#fbfdfe` background, mono uppercase label positioned above the field (never inline/floating).
- **Focus:** border color shifts to `instrument-blue`; no glow, no ring beyond the global focus-visible outline.
- **Disabled (submit button):** 0.7 opacity, default cursor — no separate disabled palette.

### Navigation
Fixed and full-width, with three grounds driven by `[data-ground]`: **transparent** at rest, a **sky bar** (`rgba(223,234,243,.94)` + 10px blur) while the light hero passes behind it, and a **translucent ink bar** (`rgba(16,30,42,.9)` + 10px blur) once past ~72% of the first viewport. Every state ships in the markup so the bar is correct on first paint and without JavaScript. Links are uppercase sans (12px, 600 weight, 0.16em tracking) at `rgba(23,41,58,.70)`, with a 1px `tugu-gold-lit` underline marking the active section. Below 900px, links collapse into a 44px pill burger opening a full-screen ink menu with display-scale link type; that menu is a real focus-trapping dialog.

**The Bar Owns Its Ground Rule.** The nav is transparent only when nothing is behind it. The giant wordmark slides under the bar about 85px into the scroll, and no single link colour survives both the pale sky and that solid ink — 55%-ink links over the ink wordmark composite to exactly the wordmark's own colour, 1:1, invisible. So the bar takes a backdrop matched to the register behind it rather than trying to recolour its links. That backdrop arrives in 0.16s, not the 0.45s the ink inversion uses: it is a legibility guarantee, and a flick crosses those 85px in far less than 0.45s.

### Image Slot (signature component)
The placeholder pattern for imagery that doesn't exist yet: a flat `ink-soft` block centered on the mono caption text, deliberately with **no shimmer, no skeleton animation** — a static placeholder states its own absence rather than performing a loading state that never resolves, because these assets are not "loading," they're not built yet.

## Do's and Don'ts

### Do:
- **Do** keep exactly two page background colors — sky and ink — everywhere, in both registers. Cards reuse `--sky-0` as a foreground surface; that is not a third background.
- **Do** use pill radius (999px) for every interactive control; reserve `--radius-panel`/`--radius-card` clamp() radii for panel/card containers.
- **Do** spend the warm accent (`tugu-gold`) at most once per section, in either register; the body sections may additionally spend one narrowly-scoped `eco` accent on a carbon-savings claim, never as a section-level substitute for `tugu-gold`.
- **Do** keep IBM Plex Mono for metadata only — labels, index numbers, captions — never body copy or headlines.
- **Do** wrap every responsive grid's minmax floor in `min(Xpx, 100%)` to prevent narrow-viewport overflow.
- **Do** use `gsap.from` only, never `.to` — the page must already be fully visible, just unanimated, if GSAP fails to load.
- **Do** (2026-09, body sections) build panels and grid cells from the shared Card System (`--card-surface`, `--radius-panel`/`--radius-card`, `--shadow-card`/`--shadow-card-sm`) rather than a one-off shadow or radius value.
- **Do** keep the Hero matched to `Pathrix.dc.html` and flat/hairline per its own rules above — the Card System below does not apply there.

### Don't:
- **Don't** introduce a third background color.
- **Don't** add a bordered-card component or shadow to the **Hero** without the same "floating" justification as the hero CTA — the Hero's flat/hairline rules are unchanged. (This ban no longer applies to Masalah, CaraKerja, Fitur, Audiens, Kontak, or Footer, which are now built from shadowed cards by design — see "Card System.")
- **Don't** revert the AA-adjusted opacity tokens (`--on-dark-meta`, `--on-light-meta`, `--warm-deep`) to the original design-prototype values — they were deliberately raised to clear WCAG AA.
- **Don't** add a hero video, particle field, gradient mesh, blob shape, animated gradient text, emoji, badge rows, testimonials, logo clouds, pricing, or FAQ accordions. Unaffected by the Card System.
- **Don't** add invented or fabricated numbers. A figure cited from the MAPID proposal with a named source (Masalah's stats row is the precedent) is fine; a made-up one is not. Fitur's new field labels (2026-09) are static UI strings, not numeric claims, and don't change this rule.
- **Don't** use `eco` as a section background, as a substitute for `tugu-gold`'s "one flagship item" role, or anywhere but a carbon-savings claim.
- **Don't** reintroduce CaraKerja's connector line or a 1040px breakpoint — that mechanic was removed along with the hairline step layout it belonged to.
