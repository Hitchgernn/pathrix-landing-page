import * as THREE from "three";
import { box, cyl, rollWheels, wheel } from "./parts.js";
import { followCurve } from "./paths.js";

const FRONT_R = 0.26;
const REAR_R = 0.3;

/** Becak: passenger cab up front, driver pedalling behind. */
export function createBecak(paths) {
  const group = new THREE.Group();
  group.name = "becak";
  group.scale.setScalar(0.85);

  const wheels = [];

  // Passenger cab.
  box(group, 0.92, 0.1, 1.15, 0x7a2b20, 0, 0.3, 0.45); // floor
  box(group, 0.9, 0.14, 0.62, 0x2f2a26, 0, 0.46, 0.25); // seat base
  box(group, 0.9, 0.46, 0.1, 0x2f2a26, 0, 0.72, -0.03); // seat back
  box(group, 0.08, 0.5, 1.0, 0xc0392b, -0.45, 0.6, 0.4); // side panel
  box(group, 0.08, 0.5, 1.0, 0xc0392b, 0.45, 0.6, 0.4);
  box(group, 0.92, 0.42, 0.08, 0xc0392b, 0, 0.56, 1.0); // front apron

  // Canopy on four posts.
  for (const [x, z] of [
    [-0.42, 0.95],
    [0.42, 0.95],
    [-0.42, -0.05],
    [0.42, -0.05],
  ]) {
    cyl(group, 0.035, 0.035, 0.75, 6, 0x39332d, x, 1.0, z);
  }
  box(group, 1.02, 0.07, 1.25, 0x1f2a33, 0, 1.4, 0.45);
  box(group, 1.02, 0.16, 0.07, 0xe0d5be, 0, 1.31, 1.06); // canopy trim

  // Rider side: frame, saddle, handlebar.
  cyl(group, 0.035, 0.035, 0.9, 6, 0x3d3730, 0, 0.72, -0.55);
  box(group, 0.24, 0.08, 0.36, 0x2b2622, 0, 1.16, -0.62); // saddle
  box(group, 0.72, 0.05, 0.05, 0x8a8a90, 0, 1.12, -0.02, { metalness: 0.5, roughness: 0.4 });
  cyl(group, 0.03, 0.03, 0.6, 6, 0x8a8a90, 0, 0.9, -0.05, { metalness: 0.5, roughness: 0.4 });

  const rider = new THREE.Group();
  rider.position.set(0, 0, 0);
  group.add(rider);
  box(rider, 0.34, 0.5, 0.26, 0x2e6f8e, 0, 1.5, -0.6); // torso
  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.14, 10, 8),
    new THREE.MeshStandardMaterial({ color: 0xd8a878, roughness: 0.8, flatShading: true }),
  );
  head.position.set(0, 1.86, -0.6);
  head.castShadow = true;
  rider.add(head);
  box(rider, 0.34, 0.1, 0.3, 0xe4dcc8, 0, 1.96, -0.6); // caping hat

  wheels.push(wheel(group, FRONT_R, 0.09, -0.45, FRONT_R, 0.62));
  wheels.push(wheel(group, FRONT_R, 0.09, 0.45, FRONT_R, 0.62));
  const rear = wheel(group, REAR_R, 0.09, 0, REAR_R, -0.85);

  const curve = paths.road;
  const length = curve.getLength();
  const speed = 1.75; // Matches the andong, so the pair keeps a fixed gap.
  let t = 0.3;
  let phase = 0;

  return {
    group,
    label: "Becak",
    labelHeight: 2.2,
    update(delta) {
      t += (delta * speed) / length;
      phase += delta * 4;

      followCurve(group, curve, t, { lateral: 0.75, bank: Math.sin(phase) * 0.035 });
      rollWheels(wheels, delta, speed, FRONT_R);
      rear.rotation.x += (delta * speed) / REAR_R;

      // Pedalling bob.
      rider.position.y = Math.abs(Math.sin(phase)) * 0.05;
    },
  };
}
