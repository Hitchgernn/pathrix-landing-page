# Prompt for Claude Design

Existing Vite + Three.js scene (a 3D animated island diorama — trains, buses,
water shader). Entry point `src/main.js`, mounts into `#app` (canvas) and
`#labels` (DOM overlay for pick labels), both defined in `index.html`.

Task: build a landing page using this scene as the hero section background.

Requirements:
- Keep `src/main.js`'s `createStage` / `animate` loop intact — don't rewrite
  the Three.js internals, just mount it as a full-bleed canvas behind hero
  content.
- Add headline, subtext, CTA button as an absolutely-positioned overlay on
  top of the canvas (z-index above `#app`, pointer-events none except on
  interactive elements — see existing `.overlay` pattern in `index.html`).
- Scene is orbit-controlled (drag to rotate, scroll to zoom) — either keep
  that interaction in the hero, or disable controls.enabled if hero should
  stay static.
- Below the hero, build out rest of landing page (features, CTA, footer) —
  your call on content/sections.
- `npm install && npm run dev` to preview locally.
