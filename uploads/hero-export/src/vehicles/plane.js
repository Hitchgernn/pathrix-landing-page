import * as THREE from "three";
import { box, cyl } from "./parts.js";
import { followCurve } from "./paths.js";

export function createPlane(paths) {
  const group = new THREE.Group();
  group.name = "plane";
  group.scale.setScalar(0.62); // Keep it toy-sized against the island.

  const fuselage = cyl(group, 0.26, 0.26, 3.0, 12, 0xdfe6ec, 0, 0, 0, { roughness: 0.35 });
  fuselage.rotation.x = Math.PI / 2;

  const nose = cyl(group, 0.02, 0.26, 0.55, 12, 0xdfe6ec, 0, 0, 1.75, { roughness: 0.35 });
  nose.rotation.x = -Math.PI / 2;

  const tailCone = cyl(group, 0.05, 0.26, 0.6, 12, 0xdfe6ec, 0, 0.06, -1.75, { roughness: 0.35 });
  tailCone.rotation.x = Math.PI / 2;

  box(group, 4.4, 0.08, 0.72, 0xe9eef3, 0, 0.04, 0.1); // main wing
  box(group, 1.5, 0.07, 0.4, 0xe9eef3, 0, 0.2, -1.5); // tailplane
  box(group, 0.07, 0.62, 0.5, 0xc0392b, 0, 0.48, -1.6); // fin
  box(group, 2.9, 0.16, 0.28, 0x1d6fa8, 0, -0.03, 0.16); // wing stripe
  box(group, 0.44, 0.2, 1.9, 0x22333f, 0, 0.18, 0.25, { roughness: 0.12, metalness: 0.3 }); // windows

  // Engine nacelles under the wing.
  for (const x of [-1.15, 1.15]) {
    const nacelle = cyl(group, 0.13, 0.13, 0.62, 10, 0xb9c4cd, x, -0.12, 0.2, { roughness: 0.4 });
    nacelle.rotation.x = Math.PI / 2;
  }

  // Nose propeller.
  const prop = new THREE.Group();
  prop.position.set(0, 0, 2.06);
  group.add(prop);
  box(prop, 0.08, 1.3, 0.04, 0x33383d, 0, 0, 0);
  box(prop, 1.3, 0.08, 0.04, 0x33383d, 0, 0, 0);
  cyl(prop, 0.09, 0.09, 0.14, 8, 0xc0392b, 0, 0, -0.04).rotation.x = Math.PI / 2;

  const curve = paths.air;
  const length = curve.getLength();
  const speed = 9.5;
  let t = 0;

  return {
    group,
    label: "Pesawat",
    labelHeight: 1.4,
    update(delta) {
      t += (delta * speed) / length;
      // Constant bank into the turn, plus a slow roll wobble.
      followCurve(group, curve, t, { bank: 0.3 + Math.sin(t * Math.PI * 4) * 0.05 });
      prop.rotation.z += delta * 26;
    },
  };
}
