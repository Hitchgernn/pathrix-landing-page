// Tiny seeded value-noise. Enough for terrain height variation, no dependency.

function hash2(x, y, seed) {
  let h = x * 374761393 + y * 668265263 + seed * 2147483647;
  h = (h ^ (h >>> 13)) * 1274126177;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
}

function smooth(t) {
  return t * t * (3 - 2 * t);
}

/** Value noise in [0,1] at (x, y). */
export function valueNoise2D(x, y, seed = 1) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = smooth(x - xi);
  const yf = smooth(y - yi);

  const a = hash2(xi, yi, seed);
  const b = hash2(xi + 1, yi, seed);
  const c = hash2(xi, yi + 1, seed);
  const d = hash2(xi + 1, yi + 1, seed);

  return (a + (b - a) * xf) * (1 - yf) + (c + (d - c) * xf) * yf;
}

/** Stacked octaves of value noise, normalized to [0,1]. */
export function fbm2D(x, y, { octaves = 4, lacunarity = 2, gain = 0.5, seed = 1 } = {}) {
  let amp = 1;
  let freq = 1;
  let sum = 0;
  let norm = 0;

  for (let i = 0; i < octaves; i++) {
    sum += valueNoise2D(x * freq, y * freq, seed + i * 17) * amp;
    norm += amp;
    amp *= gain;
    freq *= lacunarity;
  }

  return sum / norm;
}
