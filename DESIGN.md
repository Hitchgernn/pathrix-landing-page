---
name: Pathrix
description: AI Agent for Multimodal Mobility Navigation in Yogyakarta
colors:
  instrument-blue: "#1f6592"
  instrument-blue-lift: "#5aa9dd"
  tugu-gold: "#d9a521"
  tugu-gold-lit: "#f2c94c"
  tugu-gold-deep: "#7c5e13"
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
  panel: "clamp(10px, 1.4vw, 20px)"
  focus-ring: "4px"
spacing:
  gutter: "clamp(20px, 4.4vw, 64px)"
  section-y: "clamp(80px, 10vw, 150px)"
  shell-max: "1180px"
components:
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

**Creative North Star: "The Field Instrument"**

Pathrix reads like a precision survey instrument, not a consumer app shell. There are no bordered cards, no drop-shadow soup, no rounded-rectangle-plus-icon component kit — instead, hairline dividers separate content the way tick marks separate a scale, mono-font index numbers (`01`, `02`, `03`) label sections the way a ledger labels entries, and every surface sits flat until one specific control earns the right to lift. The page's own duality — a pale sky above, deep ink below, with the 3D Tugu diorama as the seam between them — reinforces the instrument-reading-a-place framing: this is a tool for surveying Yogyakarta's transit network, and it looks like one.

Color discipline follows the same logic: one warm accent (`tugu-gold`, matched hex-for-hex to the 3D Tugu monument's material in `src/hero/landmarks/tugu.js`) appears at most once per section, used like a compass needle or a single flagged reading on an otherwise instrument-grey panel — never as a decorative wash. Confirmed anti-reference: generic SaaS/dashboard visual language (bordered card grids, ambient shadow elevation, blue-gradient hero treatments) is deliberately rejected in favor of the hairline-and-mono-label vocabulary below.

**Key Characteristics:**
- Exactly two page background colors — pale sky and deep ink — never a third.
- Flat by default; hairline borders/dividers do the separating work shadows would do elsewhere.
- One warm accent (`tugu-gold`) per section, at most.
- Mono-font, uppercase, letter-spaced labels for every piece of metadata (eyebrows, index numbers, captions, form field labels) — the display face is reserved solely for the wordmark, body copy never goes mono.
- Fluid `clamp()` sizing throughout; no fixed-breakpoint type jumps.

## Colors

Two neutral registers (pale sky / deep ink) carry the page; one blue does all interactive and link work; one gold accent is spent deliberately, at most once per section.

### Primary
- **Instrument Blue** (`#1f6592`): links, primary CTA fills on light sections, form focus borders, submit buttons. The page's one interactive color.
- **Instrument Blue, Lift** (`#5aa9dd`): eyebrow labels and index numbers on dark sections, focus-visible outline ring, lift-accent index markers, hover state for the inverted nav CTA. A lighter step of Primary, not a separate hue — used wherever Primary would be too heavy against ink.

### Secondary
- **Tugu Gold** (`#d9a521`): background-only accent — the warm index marker, the connector line's terminal stop in Cara Kerja. Deliberately the same hex as the 3D Tugu monument's gold material; the diorama and the page accent are meant to match, and must stay in sync if either changes.
- **Tugu Gold, Lit** (`#f2c94c`): text use on dark backgrounds only (10.66:1 on ink, 11.32:1 on ink-deep) — the active nav-link underline, the CTA arrow's hover color.
- **Tugu Gold, Deep** (`#7c5e13`): text use on light backgrounds only (4.95:1 on sky) — the Kontak form's error note. Never interchange the three; each exists because a single yellow cannot pass AA as both foreground-on-light and foreground-on-dark.

### Neutral
- **Sky, Pale / Sky / Sky, Deep** (`#eff5fa` / `#dfeaf3` / `#c6d9e8`): the light background family — the hero's radial gradient runs pale-to-deep from top, `sky` is the flat page background for light sections (Kontak).
- **Ink / Ink, Deep / Ink, Soft** (`#101e2a` / `#0c1822` / `#17293a`): the dark background family — `ink-deep` is one step darker for Fitur, `ink` is the base for Masalah/Kontak-adjacent/Footer, `ink-soft` is the wordmark/body-text color on light sections and the placeholder image backing.
- **Paper** (`#e7f0f7`): the base text-on-dark and skip-link foreground color; every `on-dark-*` token is a `rgba()` step of this same value at different opacities, never a separate hex.

### Named Rules
**The One Warm Rule.** The gold accent appears at most once per section — one marker, one underline, one arrow-hover. Its rarity is what makes it read as a flagged value rather than decoration.

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

Two hard breakpoints, both content-driven rather than device-driven: **900px** (nav collapses from inline links to a hamburger; the hero tagline switches from a single hairlined row to a wrapped block — both variants ship in the markup so first paint is correct without JS) and **1040px** (Cara Kerja's hairline connector line between step markers only renders once all three steps share one row). Everything else — type scale, spacing, the hero diorama's overlap with the wordmark — is fluid `clamp()`, not a breakpoint jump.

## Elevation & Depth

Flat by default. Every panel, cell, and container is a solid fill separated by 1px hairlines (`--on-dark-line`, `rgba(23,41,58,.14–.25)`) — there is no ambient card-shadow vocabulary anywhere in the system. The one confirmed exception is the hero's primary CTA (`Jelajahi Peta`), which carries a single soft shadow because it is the page's one primary action, floating over the diorama rather than sitting on a section's flat background.

### Shadow Vocabulary
- **Primary-action lift** (`box-shadow: 0 14px 34px -12px rgba(23, 41, 58, 0.7)`): the hero CTA only. Not a general elevation step — a future primary button elsewhere in the system does not inherit this by default; it must earn the same "floating over imagery" justification.

### Named Rules
**The Flat-Unless-Floating Rule.** Shadows are absent everywhere. A component may claim one only when it visually floats over the diorama or an image, not merely because it wants visual weight — hairline separation is the default answer to "how do I set this apart."

## Shapes

Pill radius (`999px`) is the system's one interactive-control shape: every button, the burger toggle, the skip link, and the circular index markers (38px) use it, no exceptions. Non-interactive containers (image slots, the field-photo grid, the Kontak form panel) use a softer, still-fluid radius (`clamp(10–20px)`), scaling with the container so nothing looks clipped at small sizes. Corners elsewhere are square. Borders, where present, are always 1px and low-opacity (`rgba` at .14–.28), never a solid saturated stroke.

## Components

Restrained and instrumented: every control reads as a measuring-device element, not a consumer-app affordance — pill buttons, hairline-bordered fields with mono uppercase labels, nothing decorative for its own sake.

### Buttons
- **Shape:** pill (999px radius), no exceptions.
- **Primary:** `instrument-blue` background, `#f0f6fb` text, height 44–58px depending on context (nav 44px, hero 58px, form submit 56px). Hover swaps the fill to `ink-soft`.
- **Outline (Fitur's "Buka peta"):** transparent fill, 1px `rgba(paper, .28)` border, `paper` text. Hover fills solid `paper` with `ink` text — a full invert, not a tint.
- **Nav CTA, inverted state:** once the nav has scrolled past ~72% of the first viewport, the primary button swaps to `paper` background / `ink` text, hovering to `blue-lift`.

### Index Markers (signature component)
Circular 38px badges carrying the mono step/index number (`01`–`06`). Two variants only: **lift** (`blue-lift` background, `ink` text — the default, used for every index but one per section) and **warm** (`tugu-gold` background, `ink` text — spent exactly once per section, on whichever item is the section's payoff). This is the clearest expression of the One Warm Rule in the component layer.

### Cards / Containers — "Hairline Grid," not cards
There is no bordered-card component. Feature and step grids are a single `1px` gap of `on-dark-line` between cells, with each cell painting the section's background color back over the gap — the separation reads as a hairline, not a boxed card. Internal padding is fluid (`clamp(26–40px)`). The concept-visual frame (`.shot`) is the one place a visible 1px border (`rgba(paper, .16)`) plus soft radius appears, functioning as a frame rather than a card edge — and it carries a mono figcaption naming itself as a concept, because the product it depicts does not exist yet.

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
- **Do** keep exactly two page background colors — sky and ink — everywhere.
- **Do** use pill radius (999px) for every interactive control; reserve softer clamp() radii for image/panel containers only.
- **Do** spend the warm accent (`tugu-gold`) at most once per section.
- **Do** keep IBM Plex Mono for metadata only — labels, index numbers, captions — never body copy or headlines.
- **Do** wrap every responsive grid's minmax floor in `min(Xpx, 100%)` to prevent narrow-viewport overflow.
- **Do** use `gsap.from` only, never `.to` — the page must already be fully visible, just unanimated, if GSAP fails to load.

### Don't:
- **Don't** introduce a third background color.
- **Don't** add bordered-card components, ambient drop shadows, or other generic SaaS/dashboard visual language — hairline dividers do that job in this system.
- **Don't** add a shadow to any component other than the hero primary CTA without the same "floating over imagery" justification.
- **Don't** revert the AA-adjusted opacity tokens (`--on-dark-meta`, `--on-light-meta`, `--warm-deep`) to the original design-prototype values — they were deliberately raised to clear WCAG AA.
- **Don't** add a hero video, particle field, gradient mesh, blob shape, animated gradient text, emoji, badge rows, testimonials, logo clouds, pricing, FAQ accordions, or invented numeric/statistical claims.
