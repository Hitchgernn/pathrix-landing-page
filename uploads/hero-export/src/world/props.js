import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { PALETTE } from "../config.js";
import { valueNoise2D } from "../utils/noise.js";

function instanced(geometry, material, spots, place) {
  const mesh = new THREE.InstancedMesh(geometry, material, spots.length);
  const dummy = new THREE.Object3D();

  spots.forEach((spot, i) => {
    place(dummy, spot, i);
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);
  });

  mesh.instanceMatrix.needsUpdate = true;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function createTrees(spots) {
  const group = new THREE.Group();
  group.name = "trees";
  if (spots.length === 0) return group;

  const trunkGeo = new THREE.CylinderGeometry(0.08, 0.14, 0.6, 5);
  trunkGeo.translate(0, 0.3, 0);

  const lowerGeo = new THREE.ConeGeometry(0.52, 1.3, 7);
  lowerGeo.translate(0, 1.05, 0);

  const upperGeo = new THREE.ConeGeometry(0.34, 0.95, 7);
  upperGeo.translate(0, 1.75, 0);

  const place = (dummy, spot) => {
    dummy.position.set(spot.x, spot.y, spot.z);
    dummy.rotation.set(0, valueNoise2D(spot.x * 5, spot.z * 5, 3) * Math.PI * 2, 0);
    dummy.scale.setScalar(spot.scale);
  };

  group.add(
    instanced(
      trunkGeo,
      new THREE.MeshStandardMaterial({ color: PALETTE.trunk, flatShading: true, roughness: 1 }),
      spots,
      place,
    ),
    instanced(
      lowerGeo,
      new THREE.MeshStandardMaterial({ color: PALETTE.leaf, flatShading: true, roughness: 0.95 }),
      spots,
      place,
    ),
    instanced(
      upperGeo,
      new THREE.MeshStandardMaterial({
        color: PALETTE.leafLight,
        flatShading: true,
        roughness: 0.95,
      }),
      spots,
      place,
    ),
  );

  return group;
}

function createHouses(spots) {
  const group = new THREE.Group();
  group.name = "houses";
  if (spots.length === 0) return group;

  const walls = [];
  const roofs = [];

  spots.forEach((spot, i) => {
    const w = 0.85 + (i % 3) * 0.12;

    const wall = new THREE.BoxGeometry(w, 0.72, w * 0.9);
    wall.translate(0, 0.36, 0);
    wall.rotateY(spot.rotation);
    wall.translate(spot.x, spot.y, spot.z);
    walls.push(wall);

    // Joglo-ish steep pyramid roof.
    const roof = new THREE.ConeGeometry(w * 0.92, 0.62, 4);
    roof.rotateY(Math.PI / 4);
    roof.translate(0, 1.03, 0);
    roof.rotateY(spot.rotation);
    roof.translate(spot.x, spot.y, spot.z);
    roofs.push(roof);
  });

  const wallMesh = new THREE.Mesh(
    mergeGeometries(walls, false),
    new THREE.MeshStandardMaterial({ color: 0xe8dcc4, flatShading: true, roughness: 0.9 }),
  );
  const roofMesh = new THREE.Mesh(
    mergeGeometries(roofs, false),
    new THREE.MeshStandardMaterial({ color: 0x9c4a2f, flatShading: true, roughness: 0.85 }),
  );

  walls.forEach((g) => g.dispose());
  roofs.forEach((g) => g.dispose());

  for (const mesh of [wallMesh, roofMesh]) {
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);
  }

  return group;
}

function createLamps(spots) {
  const group = new THREE.Group();
  group.name = "lamps";
  if (spots.length === 0) return group;

  const poles = [];
  spots.forEach((spot) => {
    const pole = new THREE.CylinderGeometry(0.05, 0.07, 1.5, 6);
    pole.translate(spot.x, spot.y + 0.75, spot.z);
    poles.push(pole);
  });

  const poleMesh = new THREE.Mesh(
    mergeGeometries(poles, false),
    new THREE.MeshStandardMaterial({ color: 0x35302b, flatShading: true, roughness: 0.7 }),
  );
  poles.forEach((g) => g.dispose());
  poleMesh.castShadow = true;
  group.add(poleMesh);

  const headGeo = new THREE.SphereGeometry(0.13, 10, 8);
  const headMat = new THREE.MeshStandardMaterial({
    color: 0xffe6a8,
    emissive: 0xffc453,
    emissiveIntensity: 1.4,
    roughness: 0.4,
  });
  group.add(
    instanced(headGeo, headMat, spots, (dummy, spot) => {
      dummy.position.set(spot.x, spot.y + 1.56, spot.z);
      dummy.rotation.set(0, 0, 0);
      dummy.scale.setScalar(1);
    }),
  );

  return group;
}

export function createProps({ treeSpots, houseSpots, lampSpots }) {
  const group = new THREE.Group();
  group.name = "props";
  group.add(createTrees(treeSpots), createHouses(houseSpots), createLamps(lampSpots));
  return group;
}
