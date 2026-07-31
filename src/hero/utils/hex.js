import * as THREE from "three";

// A hex from CylinderGeometry(r, r, h, 6) has circumradius 1 and inradius sqrt(3)/2.
// Offset rows: odd rows shift half a column, rows step by 1.5 * circumradius.
export const HEX_COL_STEP = Math.sqrt(3); // ~1.732
export const HEX_ROW_STEP = 1.5;

/** Grid coordinate -> world XZ position (as Vector2: x, y == world z). */
export function tileToPosition(tileX, tileY, out = new THREE.Vector2()) {
  return out.set((tileX + (tileY & 1) * 0.5) * HEX_COL_STEP, tileY * HEX_ROW_STEP);
}

/**
 * Walk every grid cell whose center falls inside `radius`.
 * cb receives ({ x, z, distance, tileX, tileY }).
 */
export function forEachTileInDisk(radius, cb) {
  const cols = Math.ceil(radius / HEX_COL_STEP) + 2;
  const rows = Math.ceil(radius / HEX_ROW_STEP) + 2;
  const p = new THREE.Vector2();

  for (let tileY = -rows; tileY <= rows; tileY++) {
    for (let tileX = -cols; tileX <= cols; tileX++) {
      tileToPosition(tileX, tileY, p);
      const distance = p.length();
      if (distance > radius) continue;
      cb({ x: p.x, z: p.y, distance, tileX, tileY });
    }
  }
}
