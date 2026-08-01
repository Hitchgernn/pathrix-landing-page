import * as THREE from "three";
import { PLAZA_HEIGHT } from "../config.js";

const WHITE = new THREE.MeshStandardMaterial({ color: 0xf4f1e8, roughness: 0.62, metalness: 0.02 });
const GOLD = new THREE.MeshStandardMaterial({ color: 0xd9a521, roughness: 0.26, metalness: 0.92 });
/**
 * The thin trim pieces — ribs, plaques, band, and the horizontal collars and
 * cornices — are too narrow and too often side-on to catch a specular
 * highlight, and at GOLD's metalness they render near-black without an
 * environment map. Dropping metalness lets them pick up diffuse light and
 * actually read as gold at hero render scale. GOLD stays on the big rounded
 * pieces (upper cornice, ball, spire), which are lit well enough to want it.
 */
const GOLD_SOFT = new THREE.MeshStandardMaterial({ color: 0xe0ae2e, roughness: 0.45, metalness: 0.35 });
const STONE = new THREE.MeshStandardMaterial({
  color: 0xbfb4a1,
  roughness: 0.92,
  flatShading: true,
});

function add(group, geometry, material, y) {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.y = y;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  group.add(mesh);
  return mesh;
}

/**
 * Place a mesh on one facet of the octagonal body. CylinderGeometry starts its
 * first vertex on +Z, so a pivot rotated by `angle` with the child pushed out
 * along local +Z lands on the matching facet, already facing outward.
 */
function facet(group, geometry, material, angle, y, radius, tiltX = 0) {
  const pivot = new THREE.Group();
  pivot.rotation.y = angle;
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(0, y, radius);
  mesh.rotation.x = tiltX;
  mesh.castShadow = true;
  pivot.add(mesh);
  group.add(pivot);
  return mesh;
}

// Facet centres of an 8-gon, taken every 90 degrees.
const FACETS = [22.5, 112.5, 202.5, 292.5].map(THREE.MathUtils.degToRad);

/**
 * Tugu Pal Putih: stepped square plinth, white tapered octagonal shaft ribbed in
 * gold, a banded drum with arched window plaques, then gold cornice, ball and spire.
 */
export function createTugu() {
  const group = new THREE.Group();
  group.name = "Tugu Jogja";
  group.position.y = PLAZA_HEIGHT;

  add(group, new THREE.BoxGeometry(4.6, 0.42, 4.6), STONE, 0.21);
  add(group, new THREE.BoxGeometry(3.5, 0.36, 3.5), STONE, 0.6);
  add(group, new THREE.BoxGeometry(2.1, 1.15, 2.1), WHITE, 1.35);
  add(group, new THREE.BoxGeometry(2.45, 0.18, 2.45), GOLD_SOFT, 2.02);

  // Collar and shaft are both eight-sided, matching the real monument's faceting.
  add(group, new THREE.CylinderGeometry(0.7, 0.7, 0.16, 8), GOLD_SOFT, 2.19);
  add(group, new THREE.CylinderGeometry(0.44, 0.64, 4.7, 8), WHITE, 4.46);

  // One gold rib per visible facet, leaning inward so it tracks the shaft's taper.
  const ribGeo = new THREE.BoxGeometry(0.1, 4.72, 0.07);
  const ribTilt = -Math.atan2(0.184, 4.7);
  for (const angle of FACETS) {
    facet(group, ribGeo, GOLD_SOFT, angle, 4.46, 0.505, ribTilt);
  }

  // Necking ring flares out of the shaft top into the bulbous drum.
  add(group, new THREE.CylinderGeometry(0.5, 0.46, 0.14, 8), GOLD_SOFT, 6.88);
  add(group, new THREE.CylinderGeometry(0.62, 0.58, 1.15, 8), WHITE, 7.525);

  // Shallow plaques, half sunk into the drum, standing in for its arched windows.
  const plaqueGeo = new THREE.BoxGeometry(0.26, 0.42, 0.05);
  for (const angle of FACETS) {
    facet(group, plaqueGeo, GOLD_SOFT, angle, 7.4, 0.573);
  }

  // The real drum carries a star-and-crescent band; at this render scale a raised
  // gold trim ring reads the same and costs no extruded profile.
  add(group, new THREE.CylinderGeometry(0.65, 0.65, 0.12, 8), GOLD_SOFT, 7.9);

  // Modest cornice ledge, a small ball, then a long spire — the real monument's
  // top is slim, not a mushroom cap.
  add(group, new THREE.CylinderGeometry(0.52, 0.72, 0.28, 8), GOLD, 8.24);
  add(group, new THREE.SphereGeometry(0.3, 18, 12), GOLD, 8.59);
  add(group, new THREE.ConeGeometry(0.14, 1.6, 12), GOLD, 9.69);

  // Perimeter posts, like the ones ringing the real monument.
  const postGeo = new THREE.CylinderGeometry(0.09, 0.11, 0.75, 8);
  const capGeo = new THREE.SphereGeometry(0.11, 10, 8);
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2;
    const x = Math.cos(angle) * 2.95;
    const z = Math.sin(angle) * 2.95;

    const post = new THREE.Mesh(postGeo, WHITE);
    post.position.set(x, 0.79, z);
    post.castShadow = true;
    group.add(post);

    const cap = new THREE.Mesh(capGeo, GOLD);
    cap.position.set(x, 1.22, z);
    cap.castShadow = true;
    group.add(cap);
  }

  return { group, label: "Tugu Jogja", labelHeight: 10.8 };
}
