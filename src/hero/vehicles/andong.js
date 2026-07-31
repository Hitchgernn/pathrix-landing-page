import * as THREE from "three";
import { box, cyl, rollWheels, wheel } from "./parts.js";
import { followCurve } from "./paths.js";
import { ROAD_SPEED } from "../config.js";

const WHEEL_R = 0.42;
const HORSE_COLOR = 0x6b452c;

/**
 * How far ahead of the carriage the horse walks, in world units. It used to be a
 * child at z = +1.95, but a rigid child follows the carriage's *heading*, not the
 * road, so on a ring this tight the horse swung a full 0.6 units outside the
 * asphalt and walked through the grass tiles. It now rides the curve at its own
 * arc offset, the way the train's carriages do.
 */
const HORSE_LEAD = 1.66;

function buildHorse() {
  const horse = new THREE.Group();
  horse.name = "andong-horse";
  horse.scale.setScalar(0.85);

  box(horse, 0.44, 0.55, 1.25, HORSE_COLOR, 0, 1.05, 0); // barrel
  box(horse, 0.3, 0.55, 0.3, HORSE_COLOR, 0, 1.35, 0.62); // neck
  box(horse, 0.26, 0.26, 0.55, HORSE_COLOR, 0, 1.55, 0.92); // head
  box(horse, 0.06, 0.16, 0.1, 0x4a2f1e, -0.09, 1.74, 0.75); // ears
  box(horse, 0.06, 0.16, 0.1, 0x4a2f1e, 0.09, 1.74, 0.75);
  box(horse, 0.12, 0.42, 0.14, 0x2e1d12, 0, 1.05, -0.68); // tail
  box(horse, 0.48, 0.12, 0.5, 0x8c3f2b, 0, 1.36, -0.1); // saddle blanket

  const legs = [];
  const legMat = { roughness: 0.85 };
  for (const [x, z, phase] of [
    [-0.16, 0.45, 0],
    [0.16, 0.45, Math.PI],
    [-0.16, -0.45, Math.PI],
    [0.16, -0.45, 0],
  ]) {
    const pivot = new THREE.Group();
    pivot.position.set(x, 0.95, z);
    horse.add(pivot);
    box(pivot, 0.13, 0.85, 0.13, HORSE_COLOR, 0, -0.42, 0, legMat);
    box(pivot, 0.15, 0.12, 0.18, 0x2e1d12, 0, -0.8, 0.01, legMat); // hoof
    legs.push({ pivot, phase });
  }

  return { horse, legs };
}

/** Andong: horse-drawn carriage, the classic Malioboro ride. */
export function createAndong(paths) {
  const group = new THREE.Group();
  group.name = "andong";

  // The carriage and the horse each ride the curve, so the group itself stays at
  // the origin and carries no transform.
  const carriage = new THREE.Group();
  carriage.name = "andong-carriage";
  carriage.scale.setScalar(0.85);
  group.add(carriage);

  const wheels = [];
  const { horse, legs } = buildHorse();
  group.add(horse);

  // Carriage box.
  box(carriage, 1.05, 0.62, 1.35, 0x7a4b25, 0, 0.92, -0.3);
  box(carriage, 1.08, 0.12, 1.38, 0x5c3417, 0, 0.6, -0.3); // underframe
  box(carriage, 0.98, 0.36, 0.1, 0x5c3417, 0, 1.35, -0.92); // seat back
  box(carriage, 0.9, 0.1, 0.5, 0x3a2a1c, 0, 1.25, -0.6); // bench
  box(carriage, 0.9, 0.1, 0.42, 0x3a2a1c, 0, 1.25, 0.05); // driver bench

  // Canopy.
  for (const [x, z] of [
    [-0.46, 0.2],
    [0.46, 0.2],
    [-0.46, -0.85],
    [0.46, -0.85],
  ]) {
    cyl(carriage, 0.035, 0.035, 0.85, 6, 0x4a3320, x, 1.62, z);
  }
  box(carriage, 1.16, 0.08, 1.5, 0x8f2f2f, 0, 2.08, -0.3);
  box(carriage, 1.16, 0.16, 0.07, 0xe8dcc0, 0, 2.0, 0.44);

  // Shafts linking carriage to horse.
  box(carriage, 0.07, 0.07, 1.7, 0x5c3417, -0.34, 1.02, 1.15);
  box(carriage, 0.07, 0.07, 1.7, 0x5c3417, 0.34, 1.02, 1.15);

  const lantern = box(carriage, 0.14, 0.2, 0.14, 0xffe6a8, 0.5, 1.28, 0.32, { roughness: 0.35 });
  lantern.material.emissive = new THREE.Color(0xffc453);
  lantern.material.emissiveIntensity = 0.9;

  // Big rear wheels + small front pair.
  wheels.push(wheel(carriage, WHEEL_R, 0.1, -0.62, WHEEL_R, -0.55));
  wheels.push(wheel(carriage, WHEEL_R, 0.1, 0.62, WHEEL_R, -0.55));
  const front = [
    wheel(carriage, 0.28, 0.09, -0.5, 0.28, 0.75),
    wheel(carriage, 0.28, 0.09, 0.5, 0.28, 0.75),
  ];

  const curve = paths.road;
  const length = curve.getLength();
  const speed = ROAD_SPEED;
  const lane = 0;
  let t = 0.78;
  let phase = 0;

  return {
    group,
    // The group stays put and the carriage carries the motion, so the label has
    // to ride the carriage.
    labelAnchor: carriage,
    label: "Andong",
    labelHeight: 2.8,
    update(delta) {
      t += (delta * speed) / length;
      phase += delta * speed * 3.15; // Gait tied to ground speed.

      followCurve(carriage, curve, t, { lateral: lane });
      followCurve(horse, curve, t + HORSE_LEAD / length, { lateral: lane });
      rollWheels(wheels, delta, speed, WHEEL_R);
      rollWheels(front, delta, speed, 0.28);

      for (const leg of legs) {
        leg.pivot.rotation.x = Math.sin(phase + leg.phase) * 0.42;
      }
    },
  };
}
