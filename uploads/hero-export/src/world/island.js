import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { forEachTileInDisk } from "../utils/hex.js";
import { fbm2D, valueNoise2D } from "../utils/noise.js";
import {
  BASE_DEPTH,
  BASE_RADIUS,
  FOREST_MAX,
  GRASS_MAX,
  ISLAND_RADIUS,
  MAX_TERRAIN_HEIGHT,
  PALETTE,
  PLAZA_HEIGHT,
  PLAZA_RADIUS,
  RAIL_HEIGHT,
  RAIL_INNER,
  RAIL_OUTER,
  ROAD_HEIGHT,
  ROAD_INNER,
  ROAD_OUTER,
  SAND_MAX,
  WATER_LEVEL,
} from "../config.js";

const HEX_SEGMENTS = 6;

/** Ease a terrain height toward a flat band height when close to that band. */
function blendTowardBand(height, bandHeight, distance, inner, outer, feather) {
  if (distance >= inner && distance <= outer) return bandHeight;
  const gap = distance < inner ? inner - distance : distance - outer;
  if (gap >= feather) return height;
  const w = THREE.MathUtils.smootherstep(1 - gap / feather, 0, 1);
  return THREE.MathUtils.lerp(height, bandHeight, w);
}

function pickBiome(height) {
  if (height < SAND_MAX) return "sand";
  if (height < GRASS_MAX) return "grass";
  if (height < FOREST_MAX) return "forest";
  if (height > MAX_TERRAIN_HEIGHT * 0.86) return "snow";
  return "rock";
}

/** Flat apron carved for a roadside/trackside building: {x, z, radius, height}. */
function padAt(pads, x, z) {
  for (const pad of pads) {
    if (Math.hypot(x - pad.x, z - pad.z) <= pad.radius) return pad;
  }
  return null;
}

export function createIsland({ pads = [] } = {}) {
  const group = new THREE.Group();
  group.name = "island";

  const buckets = new Map();
  const treeSpots = [];
  const houseSpots = [];
  const lampSpots = [];

  const push = (biome, geometry) => {
    if (!buckets.has(biome)) buckets.set(biome, []);
    buckets.get(biome).push(geometry);
  };

  forEachTileInDisk(ISLAND_RADIUS, ({ x, z, distance }) => {
    let height;
    let biome;

    const pad = padAt(pads, x, z);

    if (pad) {
      height = pad.height;
      biome = pad.biome ?? "plaza";
    } else if (distance < PLAZA_RADIUS) {
      height = PLAZA_HEIGHT;
      biome = "plaza";
    } else if (distance >= ROAD_INNER && distance <= ROAD_OUTER) {
      height = ROAD_HEIGHT;
      biome = "asphalt";
    } else if (distance >= RAIL_INNER && distance <= RAIL_OUTER) {
      height = RAIL_HEIGHT;
      biome = "gravel";
    } else {
      const n = fbm2D(x * 0.115 + 40, z * 0.115 + 40, { octaves: 4, seed: 7 });
      const shoreFalloff =
        1 - THREE.MathUtils.smootherstep(distance, ISLAND_RADIUS - 3.6, ISLAND_RADIUS);

      height = (0.55 + Math.pow(n, 1.7) * MAX_TERRAIN_HEIGHT) * (0.3 + 0.7 * shoreFalloff);

      // Ease terrain into the flat infrastructure rings. Keep the feather short —
      // the gaps between rings are narrow, and a wide feather flattens the whole island.
      height = blendTowardBand(height, PLAZA_HEIGHT, distance, 0, PLAZA_RADIUS, 1.0);
      height = blendTowardBand(height, ROAD_HEIGHT, distance, ROAD_INNER, ROAD_OUTER, 1.0);
      height = blendTowardBand(height, RAIL_HEIGHT, distance, RAIL_INNER, RAIL_OUTER, 1.0);

      // Keep the interior low so the monument and the traffic stay readable;
      // the real relief belongs on the outer band.
      const cap =
        distance < ROAD_INNER ? 2.7 : distance < RAIL_OUTER ? 4.2 : MAX_TERRAIN_HEIGHT;
      height = Math.min(height, cap);

      // Chunky terraces, like the reference diorama.
      height = Math.max(0.45, Math.round(height * 2) / 2);
      biome = pickBiome(height);
    }

    const geometry = new THREE.CylinderGeometry(1, 1, height, HEX_SEGMENTS, 1, false);
    geometry.translate(x, height * 0.5, z);
    push(biome, geometry);

    const jitter = valueNoise2D(x * 3.1, z * 3.1, 91);

    if (biome === "forest" && jitter > 0.42) {
      treeSpots.push({ x, y: height, z, scale: 0.5 + jitter * 0.45 });
    }
    if (biome === "grass" && jitter > 0.82 && distance > ROAD_OUTER + 0.6) {
      houseSpots.push({ x, y: height, z, rotation: Math.atan2(x, z) + Math.PI });
    }
  });

  // Lamps ring the plaza, not the road: the plaza has a known flat height and no
  // traffic lanes, so nothing floats and nothing gets clipped by a passing bus.
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2 + 0.39;
    lampSpots.push({
      x: Math.cos(angle) * (PLAZA_RADIUS - 0.5),
      y: PLAZA_HEIGHT,
      z: Math.sin(angle) * (PLAZA_RADIUS - 0.5),
      rotation: -angle,
    });
  }

  for (const [biome, geometries] of buckets) {
    const merged = mergeGeometries(geometries, false);
    geometries.forEach((g) => g.dispose());

    const material = new THREE.MeshStandardMaterial({
      color: PALETTE[biome] ?? PALETTE.grass,
      flatShading: true,
      roughness: biome === "asphalt" ? 0.95 : 0.88,
      metalness: 0,
    });

    const mesh = new THREE.Mesh(merged, material);
    mesh.name = `tiles-${biome}`;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);
  }

  // Solid plinth under the tiles so the island reads as one carved block.
  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(BASE_RADIUS, BASE_RADIUS * 0.94, BASE_DEPTH, 64, 1, false),
    new THREE.MeshStandardMaterial({
      color: PALETTE.baseSide,
      flatShading: true,
      roughness: 1,
    }),
  );
  base.position.y = -BASE_DEPTH * 0.5 + 0.05;
  base.receiveShadow = true;
  base.castShadow = true;
  group.add(base);

  // Thin dirt rim peeking between the tiles and the plinth edge.
  const rim = new THREE.Mesh(
    new THREE.CylinderGeometry(BASE_RADIUS - 0.15, BASE_RADIUS - 0.15, 0.5, 64),
    new THREE.MeshStandardMaterial({ color: PALETTE.dirt, flatShading: true, roughness: 1 }),
  );
  rim.position.y = 0.2;
  rim.receiveShadow = true;
  group.add(rim);

  return { group, treeSpots, houseSpots, lampSpots, waterLevel: WATER_LEVEL };
}
