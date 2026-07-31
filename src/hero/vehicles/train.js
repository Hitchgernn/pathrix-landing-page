import * as THREE from "three";
import { box, cyl, rollWheels, wheel } from "./parts.js";
import { followCurve } from "./paths.js";

const WHEEL_R = 0.3;
const WHEEL_Y = 0.52;
const GAUGE = 0.6;

function buildLocomotive() {
  const group = new THREE.Group();
  const wheels = [];

  box(group, 1.3, 0.26, 3.6, 0x2a2a30, 0, 0.66, 0); // chassis
  box(group, 1.2, 0.55, 3.5, 0x1f4f8f, 0, 1.05, 0); // hood base

  // Boiler along the travel axis.
  const boiler = cyl(group, 0.42, 0.42, 2.0, 14, 0x1f4f8f, 0, 1.45, 0.75);
  boiler.rotation.x = Math.PI / 2;

  box(group, 1.24, 1.15, 1.35, 0x173d70, 0, 1.6, -1.05); // cab
  box(group, 1.4, 0.14, 1.55, 0xe8e2d4, 0, 2.24, -1.05); // cab roof
  box(group, 1.28, 0.42, 1.0, 0x14304f, 0, 1.85, -1.05, { roughness: 0.15 }); // cab windows

  cyl(group, 0.19, 0.24, 0.5, 10, 0x2a2a30, 0, 2.0, 1.35); // chimney
  cyl(group, 0.12, 0.12, 0.24, 10, 0xd9a521, 0, 1.9, 0.2, { metalness: 0.8, roughness: 0.3 });

  box(group, 1.05, 0.35, 0.2, 0xc94b2b, 0, 0.62, 1.85); // cow catcher
  const lamp = box(group, 0.22, 0.22, 0.14, 0xfff0c2, 0, 1.62, 1.78, { roughness: 0.3 });
  lamp.material.emissive = new THREE.Color(0xffdd88);
  lamp.material.emissiveIntensity = 0.8;

  for (const z of [-1.15, 0.05, 1.25]) {
    wheels.push(wheel(group, WHEEL_R, 0.14, -GAUGE, WHEEL_Y, z));
    wheels.push(wheel(group, WHEEL_R, 0.14, GAUGE, WHEEL_Y, z));
  }

  return { group, wheels };
}

function buildCarriage(color) {
  const group = new THREE.Group();
  const wheels = [];

  box(group, 1.25, 0.22, 3.0, 0x2a2a30, 0, 0.64, 0);
  box(group, 1.22, 1.05, 2.9, color, 0, 1.28, 0);
  box(group, 1.26, 0.4, 2.5, 0x14304f, 0, 1.55, 0, { roughness: 0.15 });
  box(group, 1.34, 0.12, 3.0, 0xe8e2d4, 0, 1.87, 0);
  box(group, 1.24, 0.16, 2.92, 0xd9a521, 0, 0.92, 0, { metalness: 0.4, roughness: 0.4 });

  for (const z of [-1.0, 1.0]) {
    wheels.push(wheel(group, WHEEL_R, 0.14, -GAUGE, WHEEL_Y, z));
    wheels.push(wheel(group, WHEEL_R, 0.14, GAUGE, WHEEL_Y, z));
  }

  return { group, wheels };
}

export function createTrain(paths) {
  const group = new THREE.Group();
  group.name = "train";

  const cars = [
    { ...buildLocomotive(), gap: 0 },
    { ...buildCarriage(0x9c2f2f), gap: 3.7 },
    { ...buildCarriage(0x2f6b4f), gap: 7.0 },
  ];
  cars.forEach((car) => group.add(car.group));

  const curve = paths.rail;
  const length = curve.getLength();
  const speed = 5.2;
  let t = 0.32;

  return {
    group,
    // The train group stays at the origin; its cars carry the motion, so the
    // label has to ride the locomotive.
    labelAnchor: cars[0].group,
    label: "Kereta Api",
    labelHeight: 2.6,
    update(delta) {
      t += (delta * speed) / length;
      for (const car of cars) {
        followCurve(car.group, curve, t - car.gap / length);
        rollWheels(car.wheels, delta, speed, WHEEL_R);
      }
    },
  };
}
