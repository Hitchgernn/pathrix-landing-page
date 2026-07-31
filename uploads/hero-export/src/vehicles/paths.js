import * as THREE from "three";
import {
  AIR_PATH_HEIGHT,
  AIR_PATH_RADIUS,
  RAIL_HEIGHT,
  RAIL_PATH_RADIUS,
  ROAD_HEIGHT,
  ROAD_PATH_RADIUS,
} from "../config.js";
import { valueNoise2D } from "../utils/noise.js";

const _pos = new THREE.Vector3();
const _tan = new THREE.Vector3();
const _side = new THREE.Vector3();
const _target = new THREE.Vector3();

/** Closed loop around the island; small radial jitter keeps it from looking machined. */
function ringCurve({ radius, y, points = 20, jitter = 0, seed = 1, yJitter = 0 }) {
  const pts = [];
  for (let i = 0; i < points; i++) {
    const angle = (i / points) * Math.PI * 2;
    const wobble = jitter === 0 ? 0 : (valueNoise2D(i * 1.7, seed, seed) - 0.5) * 2 * jitter;
    const r = radius + wobble;
    const yw = yJitter === 0 ? 0 : (valueNoise2D(i * 0.9, seed + 5, seed) - 0.5) * 2 * yJitter;
    pts.push(new THREE.Vector3(Math.cos(angle) * r, y + yw, Math.sin(angle) * r));
  }

  const curve = new THREE.CatmullRomCurve3(pts, true, "centripetal", 0.5);
  curve.arcLengthDivisions = 600;
  return curve;
}

export function createPaths() {
  return {
    road: ringCurve({ radius: ROAD_PATH_RADIUS, y: ROAD_HEIGHT, jitter: 0.16, seed: 3 }),
    rail: ringCurve({ radius: RAIL_PATH_RADIUS, y: RAIL_HEIGHT, jitter: 0.12, seed: 11 }),
    air: ringCurve({
      radius: AIR_PATH_RADIUS,
      y: AIR_PATH_HEIGHT,
      jitter: 0.6,
      yJitter: 0.7,
      seed: 23,
    }),
  };
}

export function wrap01(t) {
  return ((t % 1) + 1) % 1;
}

/**
 * Place `obj` on `curve` at normalized arc-length `t`, nose (+Z) along the tangent.
 * `lateral` shifts sideways (lanes), `bank` rolls around the travel axis,
 * `lift` raises it off the path.
 */
export function followCurve(obj, curve, t, { lateral = 0, bank = 0, lift = 0 } = {}) {
  const u = wrap01(t);
  curve.getPointAt(u, _pos);
  curve.getTangentAt(u, _tan).normalize();

  _side.set(_tan.z, 0, -_tan.x).normalize();
  _pos.addScaledVector(_side, lateral);
  _pos.y += lift;

  obj.position.copy(_pos);
  obj.lookAt(_target.copy(_pos).add(_tan));
  if (bank !== 0) obj.rotateZ(bank);

  return _pos;
}
