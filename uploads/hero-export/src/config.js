// Single source of truth for island layout. island.js, rail.js and paths.js all
// read from here so terrain, tracks and vehicle curves can never drift apart.

export const ISLAND_RADIUS = 18.5;
export const BASE_RADIUS = 19.6;
export const BASE_DEPTH = 2.8;

export const PLAZA_RADIUS = 3.8;
export const PLAZA_HEIGHT = 2.4;

export const ROAD_INNER = 5.0;
export const ROAD_OUTER = 9.0;
export const ROAD_HEIGHT = 1.9;
export const ROAD_PATH_RADIUS = 7.0;

export const RAIL_INNER = 10.5;
export const RAIL_OUTER = 13.5;
export const RAIL_HEIGHT = 1.5;
export const RAIL_PATH_RADIUS = 12.0;

export const AIR_PATH_RADIUS = 15.5;
export const AIR_PATH_HEIGHT = 14.0;

export const WATER_LEVEL = 1.25;
export const MAX_TERRAIN_HEIGHT = 7.6;

// Biome height thresholds (tile top y).
export const SAND_MAX = 1.8;
export const GRASS_MAX = 3.2;
export const FOREST_MAX = 5.0;

export const PALETTE = {
  sand: 0xd9c08c,
  grass: 0x8fa85a,
  forest: 0x5b7a3c,
  rock: 0x8d8577,
  snow: 0xe6e2d6,
  dirt: 0x6b4b32,
  baseSide: 0x4a3324,
  plaza: 0xbdb2a0,
  asphalt: 0x4a4a4c,
  gravel: 0x7a6a55,
  water: 0x2f6f96,
  sky: 0xf2e4cf,
  trunk: 0x5a3a26,
  leaf: 0x3f6b39,
  leafLight: 0x577f43,
};
