import * as THREE from "three";
import { box, rollWheels, wheel } from "./parts.js";
import { followCurve } from "./paths.js";

const WHEEL_R = 0.32;

/** TransJogja: blue body, white belt, long window strip. */
export function createBus(paths) {
  const group = new THREE.Group();
  group.name = "bus";
  group.scale.setScalar(0.85); // Four lanes share a narrow ring road; keep them clear of each other.

  const wheels = [];

  box(group, 1.5, 1.35, 4.6, 0x1d7ec4, 0, 1.05, 0); // body
  box(group, 1.53, 0.26, 4.62, 0xf1ece0, 0, 0.66, 0); // belt line
  box(group, 1.54, 0.5, 3.9, 0x22333f, 0, 1.5, 0.1, { roughness: 0.12, metalness: 0.3 });
  box(group, 1.44, 0.14, 4.5, 0xe9e3d6, 0, 1.78, 0); // roof
  box(group, 0.6, 0.24, 1.2, 0xd8d2c6, 0, 1.9, -0.6); // roof AC unit
  box(group, 1.3, 0.62, 0.1, 0x22333f, 0, 1.45, 2.32, { roughness: 0.12 }); // windscreen
  box(group, 1.44, 0.2, 0.16, 0x0f4f80, 0, 0.44, 2.3); // bumper
  box(group, 0.1, 0.9, 1.0, 0x11364f, 0.76, 0.95, 1.1, { roughness: 0.3 }); // door panel

  const headMat = { roughness: 0.3 };
  const left = box(group, 0.24, 0.16, 0.1, 0xfff3cf, -0.5, 0.68, 2.33, headMat);
  const right = box(group, 0.24, 0.16, 0.1, 0xfff3cf, 0.5, 0.68, 2.33, headMat);
  for (const lamp of [left, right]) {
    lamp.material.emissive = new THREE.Color(0xffe9a8);
    lamp.material.emissiveIntensity = 0.7;
  }

  for (const z of [1.55, -1.45]) {
    wheels.push(wheel(group, WHEEL_R, 0.22, -0.72, WHEEL_R, z));
    wheels.push(wheel(group, WHEEL_R, 0.22, 0.72, WHEEL_R, z));
  }

  const curve = paths.road;
  const length = curve.getLength();
  const speed = 2.9;
  let t = 0.05;

  return {
    group,
    label: "Bus TransJogja",
    labelHeight: 2.5,
    update(delta) {
      t += (delta * speed) / length;
      followCurve(group, curve, t, { lateral: -1.5 });
      rollWheels(wheels, delta, speed, WHEEL_R);
    },
  };
}
