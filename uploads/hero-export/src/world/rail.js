import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

const _p = new THREE.Vector3();
const _t = new THREE.Vector3();

/**
 * Where a trackside/roadside building goes: `offset` units to the side of the
 * curve at `u`, turned to face along it. Shared with the island builder so the
 * ground under the building can be flattened to match.
 */
export function sidePlacement(curve, u, offset) {
  curve.getPointAt(u, _p);
  curve.getTangentAt(u, _t).normalize();
  return {
    x: _p.x + _t.z * offset,
    y: _p.y,
    z: _p.z - _t.x * offset,
    rotationY: Math.atan2(_t.x, _t.z),
  };
}

/** A copy of `curve` shifted sideways by `offset`, still a closed loop. */
function offsetCurve(curve, offset, samples = 72) {
  const points = [];
  for (let i = 0; i < samples; i++) {
    const u = i / samples;
    curve.getPointAt(u, _p);
    curve.getTangentAt(u, _t).normalize();
    points.push(
      new THREE.Vector3(_p.x + _t.z * offset, _p.y, _p.z - _t.x * offset),
    );
  }
  const offsetted = new THREE.CatmullRomCurve3(points, true, "centripetal", 0.5);
  offsetted.arcLengthDivisions = 600;
  return offsetted;
}

function createSleepers(curve, count) {
  const parts = [];
  for (let i = 0; i < count; i++) {
    const u = i / count;
    curve.getPointAt(u, _p);
    curve.getTangentAt(u, _t).normalize();

    const sleeper = new THREE.BoxGeometry(1.75, 0.1, 0.3);
    sleeper.rotateY(Math.atan2(_t.x, _t.z));
    sleeper.translate(_p.x, _p.y + 0.06, _p.z);
    parts.push(sleeper);
  }
  const merged = mergeGeometries(parts, false);
  parts.forEach((g) => g.dispose());
  return merged;
}

function createDashes(curve, count, { width = 0.14, length = 0.7, lift = 0.03 } = {}) {
  const parts = [];
  for (let i = 0; i < count; i++) {
    const u = i / count;
    curve.getPointAt(u, _p);
    curve.getTangentAt(u, _t).normalize();

    const dash = new THREE.BoxGeometry(width, 0.04, length);
    dash.rotateY(Math.atan2(_t.x, _t.z));
    dash.translate(_p.x, _p.y + lift, _p.z);
    parts.push(dash);
  }
  const merged = mergeGeometries(parts, false);
  parts.forEach((g) => g.dispose());
  return merged;
}

function createStation(placement) {
  const group = new THREE.Group();
  group.name = "stasiun";

  const platform = new THREE.Mesh(
    new THREE.BoxGeometry(5.2, 0.4, 1.9),
    new THREE.MeshStandardMaterial({ color: 0xc9bda6, flatShading: true, roughness: 0.9 }),
  );
  platform.position.y = 0.2;
  platform.receiveShadow = true;
  platform.castShadow = true;
  group.add(platform);

  const wallMat = new THREE.MeshStandardMaterial({
    color: 0xe7dcc5,
    flatShading: true,
    roughness: 0.9,
  });
  // Tall enough that the locomotive's cab roof and chimney clear the canopy
  // where it overhangs the track.
  const back = new THREE.Mesh(new THREE.BoxGeometry(5.0, 2.9, 0.14), wallMat);
  back.position.set(0, 1.85, -0.82);
  back.castShadow = true;
  back.receiveShadow = true;
  group.add(back);

  for (const x of [-2.43, 2.43]) {
    const side = new THREE.Mesh(new THREE.BoxGeometry(0.14, 2.9, 1.6), wallMat);
    side.position.set(x, 1.85, 0);
    side.castShadow = true;
    group.add(side);
  }

  const roofMat = new THREE.MeshStandardMaterial({
    color: 0x9c4126,
    flatShading: true,
    roughness: 0.8,
  });
  // Shallow gable: two slabs leaning against each other.
  for (const dir of [-1, 1]) {
    const slope = new THREE.Mesh(new THREE.BoxGeometry(5.7, 0.16, 1.35), roofMat);
    slope.position.set(0, 3.5, dir * 0.55);
    slope.rotation.x = dir * 0.26;
    slope.castShadow = true;
    group.add(slope);
  }
  const ridge = new THREE.Mesh(new THREE.BoxGeometry(5.8, 0.14, 0.22), roofMat);
  ridge.position.y = 3.7;
  ridge.castShadow = true;
  group.add(ridge);

  const postMat = new THREE.MeshStandardMaterial({
    color: 0x4b3a2c,
    flatShading: true,
    roughness: 0.9,
  });
  for (const x of [-1.6, 0, 1.6]) {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 3.0, 6), postMat);
    post.position.set(x, 1.9, 0.72);
    post.castShadow = true;
    group.add(post);
  }

  // Name board on the platform edge.
  const board = new THREE.Mesh(
    new THREE.BoxGeometry(1.9, 0.42, 0.08),
    new THREE.MeshStandardMaterial({ color: 0x1f4f8f, flatShading: true, roughness: 0.6 }),
  );
  board.position.set(0, 2.95, 0.8);
  board.castShadow = true;
  group.add(board);

  const bench = new THREE.Mesh(
    new THREE.BoxGeometry(2.6, 0.12, 0.4),
    new THREE.MeshStandardMaterial({ color: 0x6b4b2f, flatShading: true, roughness: 0.85 }),
  );
  bench.position.set(0, 0.85, -0.55);
  bench.castShadow = true;
  group.add(bench);

  group.scale.setScalar(0.8);
  group.position.set(placement.x, placement.y, placement.z);
  // `rotationY` aligns local +Z with the curve; the station is modelled long
  // side along X with its open front at +Z, so turn it a quarter so the
  // platform runs *beside* the track instead of straddling it. -90° puts the
  // front on the inward side, which is where the rails are.
  group.rotation.y = placement.rotationY - Math.PI / 2;
  return group;
}

function createBusStop(placement) {
  const group = new THREE.Group();
  group.name = "halte";

  const pad = new THREE.Mesh(
    new THREE.BoxGeometry(2.4, 0.16, 1.1),
    new THREE.MeshStandardMaterial({ color: 0xcfc6b4, flatShading: true, roughness: 0.95 }),
  );
  pad.position.y = 0.08;
  pad.receiveShadow = true;
  group.add(pad);

  const shelter = new THREE.Mesh(
    new THREE.BoxGeometry(2.4, 0.12, 1.2),
    new THREE.MeshStandardMaterial({ color: 0x1d7ec4, flatShading: true, roughness: 0.6 }),
  );
  shelter.position.y = 1.3;
  shelter.castShadow = true;
  group.add(shelter);

  const backing = new THREE.Mesh(
    new THREE.BoxGeometry(2.4, 1.1, 0.08),
    new THREE.MeshStandardMaterial({ color: 0xe9e2d3, flatShading: true, roughness: 0.8 }),
  );
  backing.position.set(0, 0.72, -0.52);
  backing.castShadow = true;
  group.add(backing);

  group.scale.setScalar(0.85);
  group.position.set(placement.x, placement.y, placement.z);
  // Same quarter turn as the station: shelter runs alongside the road, open
  // side facing the traffic.
  group.rotation.y = placement.rotationY - Math.PI / 2;
  return group;
}

export function createTracks(paths, placements) {
  const group = new THREE.Group();
  group.name = "tracks";

  // --- Railway -------------------------------------------------------------
  const sleeperMesh = new THREE.Mesh(
    createSleepers(paths.rail, 190),
    new THREE.MeshStandardMaterial({ color: 0x4d3624, flatShading: true, roughness: 1 }),
  );
  sleeperMesh.receiveShadow = true;
  sleeperMesh.castShadow = true;
  group.add(sleeperMesh);

  const railMat = new THREE.MeshStandardMaterial({
    color: 0x8e8a86,
    roughness: 0.35,
    metalness: 0.75,
  });
  for (const offset of [-0.6, 0.6]) {
    const rail = new THREE.Mesh(
      new THREE.TubeGeometry(offsetCurve(paths.rail, offset), 420, 0.055, 4, true),
      railMat,
    );
    rail.position.y = 0.16;
    rail.castShadow = true;
    group.add(rail);
  }

  // --- Road ----------------------------------------------------------------
  const dashMat = new THREE.MeshStandardMaterial({ color: 0xf0e6cf, roughness: 0.8 });
  const dashes = new THREE.Mesh(createDashes(paths.road, 44), dashMat);
  dashes.receiveShadow = true;
  group.add(dashes);

  const edgeMat = new THREE.MeshStandardMaterial({ color: 0xd8cfb8, roughness: 0.9 });
  for (const offset of [-2.0, 2.0]) {
    const edge = new THREE.Mesh(
      new THREE.TubeGeometry(offsetCurve(paths.road, offset), 300, 0.045, 3, true),
      edgeMat,
    );
    edge.position.y = 0.03;
    group.add(edge);
  }

  group.add(createStation(placements.station), createBusStop(placements.halte));

  return group;
}
