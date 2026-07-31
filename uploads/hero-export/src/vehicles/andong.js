import * as THREE from "three";
import { box, cyl, rollWheels, wheel } from "./parts.js";
import { followCurve } from "./paths.js";

const WHEEL_R = 0.42;
const HORSE_COLOR = 0x6b452c;

function buildHorse(parent) {
  const horse = new THREE.Group();
  horse.position.set(0, 0, 1.95);
  parent.add(horse);

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
  group.scale.setScalar(0.85);

  const wheels = [];
  const { legs } = buildHorse(group);

  // Carriage box.
  box(group, 1.05, 0.62, 1.35, 0x7a4b25, 0, 0.92, -0.3);
  box(group, 1.08, 0.12, 1.38, 0x5c3417, 0, 0.6, -0.3); // underframe
  box(group, 0.98, 0.36, 0.1, 0x5c3417, 0, 1.35, -0.92); // seat back
  box(group, 0.9, 0.1, 0.5, 0x3a2a1c, 0, 1.25, -0.6); // bench
  box(group, 0.9, 0.1, 0.42, 0x3a2a1c, 0, 1.25, 0.05); // driver bench

  // Canopy.
  for (const [x, z] of [
    [-0.46, 0.2],
    [0.46, 0.2],
    [-0.46, -0.85],
    [0.46, -0.85],
  ]) {
    cyl(group, 0.035, 0.035, 0.85, 6, 0x4a3320, x, 1.62, z);
  }
  box(group, 1.16, 0.08, 1.5, 0x8f2f2f, 0, 2.08, -0.3);
  box(group, 1.16, 0.16, 0.07, 0xe8dcc0, 0, 2.0, 0.44);

  // Shafts linking carriage to horse.
  box(group, 0.07, 0.07, 1.7, 0x5c3417, -0.34, 1.02, 1.15);
  box(group, 0.07, 0.07, 1.7, 0x5c3417, 0.34, 1.02, 1.15);

  const lantern = box(group, 0.14, 0.2, 0.14, 0xffe6a8, 0.5, 1.28, 0.32, { roughness: 0.35 });
  lantern.material.emissive = new THREE.Color(0xffc453);
  lantern.material.emissiveIntensity = 0.9;

  // Big rear wheels + small front pair.
  wheels.push(wheel(group, WHEEL_R, 0.1, -0.62, WHEEL_R, -0.55));
  wheels.push(wheel(group, WHEEL_R, 0.1, 0.62, WHEEL_R, -0.55));
  const front = [
    wheel(group, 0.28, 0.09, -0.5, 0.28, 0.75),
    wheel(group, 0.28, 0.09, 0.5, 0.28, 0.75),
  ];

  const curve = paths.road;
  const length = curve.getLength();
  const speed = 1.75;
  let t = 0.78;
  let phase = 0;

  return {
    group,
    label: "Andong",
    labelHeight: 2.8,
    update(delta) {
      t += (delta * speed) / length;
      phase += delta * 5.5;

      // Pulled in toward the becak's lane: the horse sits ~2 units ahead of the
      // carriage, so on a curve its nose swings well outside the lane centre.
      followCurve(group, curve, t, { lateral: 1.15 });
      rollWheels(wheels, delta, speed, WHEEL_R);
      rollWheels(front, delta, speed, 0.28);

      for (const leg of legs) {
        leg.pivot.rotation.x = Math.sin(phase + leg.phase) * 0.42;
      }
    },
  };
}
