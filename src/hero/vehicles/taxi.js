import * as THREE from "three";
import { box, rollWheels, wheel } from "./parts.js";
import { followCurve } from "./paths.js";
import { ROAD_SPEED } from "../config.js";

const WHEEL_R = 0.26;

export function createTaxi(paths) {
  const group = new THREE.Group();
  group.name = "taxi";
  group.scale.setScalar(0.85);

  const wheels = [];

  box(group, 1.12, 0.48, 2.7, 0xe6b422, 0, 0.5, 0); // body
  box(group, 1.0, 0.46, 1.35, 0xe6b422, 0, 0.95, -0.12); // cabin
  box(group, 1.02, 0.3, 1.2, 0x22333f, 0, 0.98, -0.12, { roughness: 0.12, metalness: 0.3 });
  box(group, 0.96, 0.06, 1.3, 0xf6d05c, 0, 1.2, -0.12); // roof

  box(group, 0.46, 0.2, 0.22, 0xf5f1e6, 0, 1.32, -0.12); // roof sign
  box(group, 1.14, 0.14, 0.12, 0x3b3b40, 0, 0.4, 1.32); // front bumper
  box(group, 1.14, 0.14, 0.12, 0x3b3b40, 0, 0.4, -1.32); // rear bumper
  box(group, 1.1, 0.12, 2.6, 0x2f2f36, 0, 0.28, 0); // side skirt

  const lampL = box(group, 0.2, 0.12, 0.08, 0xfff3cf, -0.38, 0.58, 1.36, { roughness: 0.3 });
  const lampR = box(group, 0.2, 0.12, 0.08, 0xfff3cf, 0.38, 0.58, 1.36, { roughness: 0.3 });
  for (const lamp of [lampL, lampR]) {
    lamp.material.emissive = new THREE.Color(0xffe9a8);
    lamp.material.emissiveIntensity = 0.7;
  }
  box(group, 0.22, 0.1, 0.08, 0xc0392b, -0.38, 0.58, -1.36);
  box(group, 0.22, 0.1, 0.08, 0xc0392b, 0.38, 0.58, -1.36);

  for (const z of [0.92, -0.92]) {
    wheels.push(wheel(group, WHEEL_R, 0.18, -0.55, WHEEL_R, z));
    wheels.push(wheel(group, WHEEL_R, 0.18, 0.55, WHEEL_R, z));
  }

  const curve = paths.road;
  const length = curve.getLength();
  const speed = ROAD_SPEED; // Shared by the whole fleet, so the gaps never close.
  let t = 0.55;

  return {
    group,
    label: "Taksi",
    labelHeight: 1.8,
    update(delta) {
      t += (delta * speed) / length;
      followCurve(group, curve, t, { lateral: 0 });
      rollWheels(wheels, delta, speed, WHEEL_R);
    },
  };
}
