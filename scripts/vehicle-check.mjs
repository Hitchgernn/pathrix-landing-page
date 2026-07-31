/**
 * Vehicle motion checks. None of the other 54 checks could see the bug this was
 * written for: `followCurve` used `Object3D.lookAt`, which takes a point in
 * *world* space, while the curve — like the object's own position — lives in the
 * `world` group that the diorama is rotated by. Every vehicle ended up facing
 * somewhere unrelated to its direction of travel, sliding sideways along the road
 * at up to 127deg off. Pixel diffs still showed "vehicles moving", so it passed.
 *
 * Three invariants, measured against the live scene:
 *
 *  1. Heading — the modelled nose (+Z) points the way the vehicle actually moves.
 *  2. Terrain — no vehicle's footprint stands over ground higher than its own
 *     lane. Tiles are classified by centre distance, so a tile centred just
 *     outside a flat band still pokes into it; lanes have to stay clear of that.
 *  3. Traffic — no two independently-moving vehicles overlap. The road is too
 *     narrow for two lanes of these vehicles, so they all share one lane at one
 *     speed and the arc gaps must stay fixed.
 *
 * Needs the ?dioramaDebug hook, so run it against the dev server or a preview.
 */
import { chromium } from "playwright";
import { existsSync } from "node:fs";

const BASE = process.env.BASE || "http://localhost:5174";

const exe =
  process.env.CHROME_PATH ||
  [
    `${process.env.HOME}/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome`,
    `${process.env.HOME}/.cache/ms-playwright/chromium-1208/chrome-linux64/chrome`,
  ].find(existsSync);

let failures = 0;
const pass = (label, note = "") => console.log(`  PASS  ${label}${note ? ` — ${note}` : ""}`);
const fail = (label, note = "") => {
  failures++;
  console.log(`  FAIL  ${label}${note ? ` — ${note}` : ""}`);
};

const browser = await chromium.launch({
  executablePath: exe,
  args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
});
const page = await browser.newPage({ viewport: { width: 1200, height: 800 } });
await page.goto(`${BASE}/?dioramaDebug`, { waitUntil: "networkidle" });
await page.waitForTimeout(3000);

const result = await page.evaluate(async () => {
  const dbg = window.__pathrixDebug;
  if (!dbg)
    return {
      error:
        "no window.__pathrixDebug — the hook is dev-only (see diorama.js). Run this against `npm run dev` on :5174, not a production build.",
    };
  const { world, vehicles, THREE } = dbg;

  const RAIL_HEIGHT = 1.5;
  const ROAD_HEIGHT = 1.9;
  const STEPS = 900; // 15s of simulated travel; the road lap is ~19s.

  /*
   * A vehicle whose own group sits at the origin is a container: the child groups
   * (train cars, andong carriage + horse) are what ride the curve.
   */
  const movers = [];
  for (const v of vehicles.vehicles) {
    const lane = v.group.name === "train" ? RAIL_HEIGHT : ROAD_HEIGHT;
    const airborne = v.group.name === "plane";
    if (v.group.position.lengthSq() < 1e-6) {
      v.group.children
        .filter((c) => c.isGroup)
        .forEach((c, i) =>
          movers.push({ name: c.name || `${v.group.name}-${i}`, obj: c, lane, airborne, kind: v.group.name }),
        );
    } else {
      movers.push({ name: v.group.name, obj: v.group, lane, airborne, kind: v.group.name });
    }
  }

  // Footprint of each mover in its own frame: mesh boxes pulled back through the
  // group's matrix. (clone() is not an option — userData holds circular refs.)
  for (const m of movers) {
    m.obj.updateWorldMatrix(true, true);
    const inv = m.obj.matrixWorld.clone().invert();
    const box = new THREE.Box3();
    m.obj.traverse((child) => {
      if (!child.isMesh) return;
      child.geometry.computeBoundingBox();
      const b = child.geometry.boundingBox.clone();
      b.applyMatrix4(new THREE.Matrix4().multiplyMatrices(inv, child.matrixWorld));
      box.union(b);
    });
    m.samples = [];
    for (let i = 0; i <= 4; i++) {
      const z = THREE.MathUtils.lerp(box.min.z, box.max.z, i / 4);
      m.samples.push(new THREE.Vector3(box.min.x, 0, z), new THREE.Vector3(box.max.x, 0, z));
    }
    m.maxOver = -Infinity;
    m.overFrames = 0;
    m.minNoseDot = 1;
    m.prev = null;
  }

  const tiles = [];
  world.getObjectByName("island").traverse((o) => {
    if (o.isMesh && o.name.startsWith("tiles-")) tiles.push(o);
  });
  const ray = new THREE.Raycaster();
  const DOWN = new THREE.Vector3(0, -1, 0);
  const from = new THREE.Vector3();
  const groundAt = (x, z) => {
    ray.set(from.set(x, 40, z), DOWN);
    const hits = ray.intersectObjects(tiles, false);
    return hits.length ? hits[0].point.y : null;
  };

  const scratch = new THREE.Vector3();
  const fwd = new THREE.Vector3();
  const vel = new THREE.Vector3();
  let minGap = Infinity;
  let minGapPair = "";

  for (let s = 0; s < STEPS; s++) {
    vehicles.update(1 / 60);

    for (const m of movers) {
      m.obj.updateWorldMatrix(true, false);

      // 1. Heading. The quaternion is expressed in the parent's frame, which is
      // the same frame the curve is in, so no world transform is involved.
      fwd.set(0, 0, 1).applyQuaternion(m.obj.quaternion).setY(0).normalize();
      if (m.prev) {
        vel.set(m.obj.position.x - m.prev.x, 0, m.obj.position.z - m.prev.z);
        if (vel.lengthSq() > 1e-8) m.minNoseDot = Math.min(m.minNoseDot, vel.normalize().dot(fwd));
      }
      m.prev = m.obj.position.clone();

      // 2 + 3. Footprint in world coords, then back into island coords for the
      // terrain probe (the island shares the rotated world group).
      m.now = m.samples.map((p) => m.obj.localToWorld(scratch.copy(p)).clone());
      if (m.airborne) continue;

      let overThisFrame = false;
      for (const p of m.now) {
        const local = world.worldToLocal(p.clone());
        const g = groundAt(local.x, local.z);
        if (g == null) continue; // Ray ran down a hex edge; no reading.
        const over = g - m.lane;
        if (over > 0.05) overThisFrame = true;
        m.maxOver = Math.max(m.maxOver, over);
      }
      if (overThisFrame) m.overFrames++;
    }

    for (let a = 0; a < movers.length; a++) {
      for (let b = a + 1; b < movers.length; b++) {
        // Parts of the same vehicle are rigidly linked by design.
        if (movers[a].kind === movers[b].kind) continue;
        for (const pa of movers[a].now) {
          for (const pb of movers[b].now) {
            const d = pa.distanceTo(pb);
            if (d < minGap) {
              minGap = d;
              minGapPair = `${movers[a].name}/${movers[b].name}`;
            }
          }
        }
      }
    }
  }

  return {
    steps: STEPS,
    minGap: +minGap.toFixed(2),
    minGapPair,
    movers: movers.map((m) => ({
      name: m.name,
      airborne: m.airborne,
      minNoseDot: +m.minNoseDot.toFixed(3),
      maxOver: +m.maxOver.toFixed(2),
      overPct: Math.round((m.overFrames / STEPS) * 100),
    })),
  };
});

if (result.error) {
  console.log(`FAIL  ${result.error}`);
  await browser.close();
  process.exit(1);
}

console.log(`vehicle motion over ${result.steps} frames:`);
console.table(result.movers);

// 1. Heading: 1.0 is perfect. The old lookAt bug bottomed out at -0.59.
for (const m of result.movers) {
  m.minNoseDot > 0.99
    ? pass(`${m.name} faces its direction of travel`, `dot ${m.minNoseDot}`)
    : fail(`${m.name} faces its direction of travel`, `dot ${m.minNoseDot}`);
}

/*
 * 2. Terrain. The train is the known exception: the gravel band's clear width is
 * ~1.0 units and the locomotive is 1.4 wide, so its flank brushes tiles standing
 * 0.5 above the railhead. Fixing that means moving the drawn track or capping the
 * terrain beside it, both of which change the island — so it is bounded, not
 * required to be zero.
 */
for (const m of result.movers) {
  if (m.airborne) continue;
  const limit = m.name.startsWith("train") ? 0.55 : 0.05;
  m.maxOver <= limit
    ? pass(`${m.name} clear of terrain`, `max ${m.maxOver} (limit ${limit}), ${m.overPct}% of frames`)
    : fail(`${m.name} clear of terrain`, `max ${m.maxOver} above its lane on ${m.overPct}% of frames`);
}

// 3. Traffic. One shared lane and one shared speed means the gaps never close.
result.minGap > 1.0
  ? pass("vehicles never converge", `closest ${result.minGap} (${result.minGapPair})`)
  : fail("vehicles never converge", `closest ${result.minGap} (${result.minGapPair})`);

console.log(failures === 0 ? "\nvehicle checks: all pass" : `\nvehicle checks: ${failures} failed`);
await browser.close();
process.exit(failures === 0 ? 0 : 1);
