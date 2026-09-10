import * as THREE from "three";
import { createStage } from "./stage.js";
import { createEnvironment, createLights } from "./core/lights.js";
import { createIsland } from "./world/island.js";
import { createProps } from "./world/props.js";
import { createWater } from "./world/water.js";
import { createTracks, sidePlacement } from "./world/rail.js";
import { createTugu } from "./landmarks/tugu.js";
import { createPaths } from "./vehicles/paths.js";
import { RAIL_HEIGHT, ROAD_HEIGHT, PALETTE } from "./config.js";
import { createVehicles } from "./vehicles/index.js";

// Camera framings. The diorama is authored around the origin with the Tugu at
// its centre; these just pick where we stand and how tightly we crop. The
// camera is fixed — no OrbitControls, no scroll-linked movement. Only the
// vehicles and the water move.
const VIEWS = {
  split: { position: [26, 20, 33], target: [0, 3.4, 0], fov: 36 },
  stage: { position: [0.5, 16, 40], target: [0, 4.2, 0], fov: 34 },
  wide: { position: [34, 14, 30], target: [0, 3, 0], fov: 40 },
};

/**
 * Clockwise turn applied to the whole diorama, viewed from above. Applied to a
 * world group rather than the camera so the fixed framing and the lighting stay
 * exactly as authored.
 */
const WORLD_SPIN = THREE.MathUtils.degToRad(120);

/** Cheap probe so we can show a static fallback instead of a blank box. */
export function webglAvailable() {
  if (typeof window === "undefined") return false;
  if (typeof WebGLRenderingContext === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl2") ||
      canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl");
    if (!gl) return false;
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return true;
  } catch {
    return false;
  }
}

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

// Phase timings, enabled with ?dioramaPerf in the URL. Building the scene is the
// single most expensive thing this page does, so it is worth being able to see
// where the time goes without re-instrumenting by hand.
const PERF =
  typeof location !== "undefined" && location.search.includes("dioramaPerf");
const phase = (label, fn) => {
  if (!PERF) return fn();
  const t = performance.now();
  const out = fn();
  console.log(`[diorama] ${label}: ${(performance.now() - t).toFixed(1)}ms`);
  return out;
};

function buildScene(container, viewName, transparent, tint) {
  const view = VIEWS[viewName] ?? VIEWS.split;
  const stage = phase("stage", () =>
    createStage({
      container,
      // `tint` is the page colour behind a transparent canvas: the fog has to
      // fade into it, otherwise distant hexes haze toward the wrong hue.
      view: { ...view, background: tint || PALETTE.sky, transparent },
    }),
  );
  const { scene, camera, renderer } = stage;

  // Lights go on the scene, never on the world group below: rotating them with
  // the terrain would swing the sun around too and change every shaded face.
  phase("lights", () => createLights(scene));

  /*
   * Everything physical lives under one group so the whole diorama can be turned
   * without touching the camera (which is fixed by design) or the lighting.
   * Negative Y is clockwise viewed from above: a +Y rotation carries +Z toward
   * +X, which reads as counter-clockwise on screen.
   */
  const world = new THREE.Group();
  world.name = "world";
  world.rotation.y = -WORLD_SPIN;
  scene.add(world);

  // Expose the applied spin so the verification suite can assert the real value
  // rather than trusting a duplicated constant.
  if (typeof window !== "undefined") {
    window.__pathrixWorldSpinDeg =
      Math.round(-THREE.MathUtils.radToDeg(world.rotation.y) * 100) / 100;
  }

  const paths = createPaths();
  const placements = {
    halte: sidePlacement(paths.road, 0.62, 2.8),
    station: sidePlacement(paths.rail, 0.12, 2.2),
  };

  const island = phase("island", () =>
    createIsland({
      pads: [
        { ...placements.halte, radius: 1.4, height: ROAD_HEIGHT, biome: "asphalt" },
        { ...placements.station, radius: 2.4, height: RAIL_HEIGHT, biome: "gravel" },
      ],
    }),
  );
  world.add(island.group);
  world.add(phase("props", () => createProps(island)));
  world.add(phase("tracks", () => createTracks(paths, placements)));

  // Built once here rather than inside the Tugu so the PMREM pass, which needs
  // the renderer, stays out of the landmark module's hands.
  const envMap = phase("environment", () => createEnvironment(renderer));

  const tugu = phase("tugu", () => createTugu(envMap));
  world.add(tugu.group);

  const vehicles = phase("vehicles", () => createVehicles(paths));
  world.add(vehicles.group);

  const water = phase("water", () => createWater());
  world.add(water.group);

  /*
   * Handle for scripts/vehicle-check.mjs, behind a URL flag *and* a dev-only
   * guard. Pixel diffing can only tell that the vehicles moved, not that they
   * point the right way or stay on their lane — both of which have broken once.
   *
   * `import.meta.env.DEV` is not optional here: exposing the whole `THREE`
   * namespace pins every export and defeats tree-shaking, which took the three.js
   * chunk from 125KB to 182KB gzip. In a production build this branch is `false`
   * and rollup drops it, reference included. Run the check against `npm run dev`.
   */
  if (import.meta.env.DEV && typeof window !== "undefined" && location.search.includes("dioramaDebug")) {
    window.__pathrixDebug = { scene, camera, renderer, world, vehicles, paths, THREE };
  }

  const clock = new THREE.Clock();
  let raf = 0;
  let running = false;

  const draw = () => renderer.render(scene, camera);
  // Fix 2: renderer.setSize() clears the drawing buffer, so the stage redraws
  // after every resize — including resizes that land while the loop is paused.
  stage.setRedraw(draw);

  function frame() {
    if (!running) return;
    const delta = Math.min(clock.getDelta(), 0.1);
    vehicles.update(delta);
    water.update(delta);
    draw();
    raf = requestAnimationFrame(frame);
  }

  /*
   * A plain first render compiles every shader program in one blocking task
   * (~195ms here, and worse on slow hardware) which lands squarely in Total
   * Blocking Time. compileAsync does the same work through
   * KHR_parallel_shader_compile where the driver supports it, so the main thread
   * stays free; it falls back to synchronous compilation otherwise. Either way
   * the caller waits for `ready` before rendering the first frame.
   *
   * The Tugu arrives over the network, so the compile has to wait on it first —
   * compiling ahead of the model would miss its programs entirely and push them
   * into the first frame, which is the cost compileAsync exists to avoid.
   * `tugu.loaded` never rejects; a failed fetch leaves the procedural fallback
   * standing.
   */
  const ready = tugu.loaded
    .then(() =>
      typeof renderer.compileAsync === "function"
        ? renderer
            .compileAsync(scene, camera)
            .then(() => phase("first render (precompiled)", draw))
            .catch(() => phase("first render (compile fallback)", draw))
        : phase("first render (sync compile)", draw),
    )
    .catch(() => phase("first render (model failed)", draw));

  return {
    ready,
    start() {
      if (running) return;
      running = true;
      clock.getDelta();
      // Same reason as above: a paused resize may have blanked the buffer.
      draw();
      raf = requestAnimationFrame(frame);
    },
    stop() {
      running = false;
      cancelAnimationFrame(raf);
    },
    render: draw,
    dispose() {
      running = false;
      cancelAnimationFrame(raf);
      scene.traverse((object) => {
        object.geometry?.dispose();
        const material = object.material;
        if (Array.isArray(material)) material.forEach((m) => m.dispose());
        else material?.dispose();
      });
      // The scene traversal above only reaches geometries and materials; the
      // environment map is held by neither.
      envMap.dispose();
      stage.dispose();
    },
  };
}

/**
 * Mount the diorama into `container` (which must be a positioned element).
 * Returns a handle with `dispose()`, or null when WebGL is unavailable so the
 * caller can render a static fallback instead.
 *
 * Fix 1: visibility is never decided by IntersectionObserver. An IO with an
 * implicit root measures against the top-level viewport, so inside any nested
 * browsing context it reports isIntersecting:false forever and the vehicles
 * freeze. We test getBoundingClientRect() against window.innerHeight/Width
 * instead, and default to running unless the element is provably off-screen.
 */
export function mountDiorama(
  container,
  { view = "split", transparent = true, tint = "#dfeaf3" } = {},
) {
  if (!webglAvailable()) return null;

  let scene;
  try {
    scene = buildScene(container, view, transparent, tint);
  } catch (error) {
    console.warn("[pathrix] diorama unavailable:", error);
    return null;
  }

  const reduced = prefersReducedMotion();

  // Reduced motion: the scene is built and one frame is rendered, but the loop
  // never starts.
  if (reduced) {
    return {
      reducedMotion: true,
      ready: scene.ready,
      dispose() {
        scene.dispose();
      },
    };
  }

  const onScreen = () => {
    if (document.hidden) return false;
    const r = container.getBoundingClientRect();
    // Zero-size means "not laid out yet", not "off-screen" — keep running.
    if (r.width < 2 || r.height < 2) return true;
    const vh = window.innerHeight || document.documentElement.clientHeight || 0;
    const vw = window.innerWidth || document.documentElement.clientWidth || 0;
    const margin = 200;
    return (
      r.bottom > -margin && r.top < vh + margin && r.right > -margin && r.left < vw + margin
    );
  };

  let queued = false;
  const evaluate = () => {
    queued = false;
    onScreen() ? scene.start() : scene.stop();
  };
  // Coalesce scroll/resize bursts into one check per frame.
  const schedule = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(evaluate);
  };

  // Start once the shaders are compiled, so the loop never spins on a frame that
  // is still waiting on compilation.
  scene.ready.then(evaluate);

  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule, { passive: true });
  document.addEventListener("visibilitychange", evaluate);
  // Slow poll catches the cases no event covers: an ancestor scroll container,
  // a CSS transition moving the hero, a programmatic layout shift.
  const poll = window.setInterval(evaluate, 700);

  return {
    reducedMotion: false,
    ready: scene.ready,
    dispose() {
      window.clearInterval(poll);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      document.removeEventListener("visibilitychange", evaluate);
      scene.dispose();
    },
  };
}
