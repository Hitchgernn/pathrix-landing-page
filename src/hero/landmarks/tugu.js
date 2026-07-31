import * as THREE from "three";
import { PLAZA_HEIGHT } from "../config.js";

const WHITE = new THREE.MeshStandardMaterial({ color: 0xf4f1e8, roughness: 0.62, metalness: 0.02 });
const GOLD = new THREE.MeshStandardMaterial({ color: 0xd9a521, roughness: 0.26, metalness: 0.92 });
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

/** Tugu Pal Putih: white tapered column on a square pedestal, gold orb and spire. */
export function createTugu() {
  const group = new THREE.Group();
  group.name = "Tugu Jogja";
  group.position.y = PLAZA_HEIGHT;

  add(group, new THREE.BoxGeometry(4.6, 0.42, 4.6), STONE, 0.21);
  add(group, new THREE.BoxGeometry(3.5, 0.36, 3.5), STONE, 0.6);
  add(group, new THREE.BoxGeometry(2.1, 1.15, 2.1), WHITE, 1.35);
  add(group, new THREE.BoxGeometry(2.45, 0.18, 2.45), GOLD, 2.02);

  add(group, new THREE.CylinderGeometry(0.44, 0.64, 4.7, 24), WHITE, 4.46);
  add(group, new THREE.CylinderGeometry(0.7, 0.7, 0.16, 24), GOLD, 2.19);
  add(group, new THREE.CylinderGeometry(0.52, 0.52, 0.22, 24), GOLD, 6.92);
  add(group, new THREE.SphereGeometry(0.46, 20, 14), GOLD, 7.4);
  add(group, new THREE.ConeGeometry(0.17, 1.05, 12), GOLD, 8.2);

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

  return { group, label: "Tugu Jogja", labelHeight: 9.4 };
}
