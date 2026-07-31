import * as THREE from "three";

const materialCache = new Map();

/** Shared flat-shaded material per colour, so hundreds of parts stay cheap. */
export function mat(color, { roughness = 0.55, metalness = 0.05, flatShading = true } = {}) {
  const key = `${color}|${roughness}|${metalness}|${flatShading}`;
  if (!materialCache.has(key)) {
    materialCache.set(
      key,
      new THREE.MeshStandardMaterial({ color, roughness, metalness, flatShading }),
    );
  }
  return materialCache.get(key);
}

export function glass(color = 0x2b3b48) {
  return mat(color, { roughness: 0.12, metalness: 0.35, flatShading: false });
}

export function box(parent, w, h, d, color, x, y, z, options = {}) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(color, options));
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

export function cyl(parent, rTop, rBottom, h, seg, color, x, y, z, options = {}) {
  const mesh = new THREE.Mesh(
    new THREE.CylinderGeometry(rTop, rBottom, h, seg),
    mat(color, options),
  );
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  parent.add(mesh);
  return mesh;
}

const WHEEL_MAT = new THREE.MeshStandardMaterial({
  color: 0x23232a,
  roughness: 0.8,
  flatShading: true,
});
const HUB_MAT = new THREE.MeshStandardMaterial({
  color: 0xa8a8ae,
  roughness: 0.4,
  metalness: 0.6,
});

/**
 * Wheel with its axle along X (so it rolls with `mesh.rotation.x += ...`).
 * Returns the mesh; collect them in a `wheels` array and spin them together.
 */
export function wheel(parent, radius, width, x, y, z, { spokes = false } = {}) {
  const geometry = new THREE.CylinderGeometry(radius, radius, width, spokes ? 10 : 12);
  geometry.rotateZ(Math.PI / 2);

  const mesh = new THREE.Mesh(geometry, WHEEL_MAT);
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  parent.add(mesh);

  const hubGeo = new THREE.CylinderGeometry(radius * 0.4, radius * 0.4, width * 1.15, 8);
  hubGeo.rotateZ(Math.PI / 2);
  const hub = new THREE.Mesh(hubGeo, HUB_MAT);
  mesh.add(hub);

  return mesh;
}

/** Spin every wheel to match ground speed. */
export function rollWheels(wheels, delta, speed, radius) {
  const spin = (delta * speed) / radius;
  for (const w of wheels) w.rotation.x += spin;
}

/** Mark a group as clickable; the label system walks up parents to find this tag. */
export function tagPickable(group, name) {
  group.userData.pickName = name;
}
