import * as THREE from "three";
import { BASE_RADIUS, PALETTE, WATER_LEVEL } from "../config.js";

/**
 * Disc built from concentric rings (not CircleGeometry, which only has rim
 * vertices) so the wave displacement has interior vertices to actually move.
 */
function polarDisc(radius, rings, sectors) {
  const positions = [0, 0, 0];
  const normals = [0, 1, 0];
  const uvs = [0.5, 0.5];
  const indices = [];

  for (let r = 1; r <= rings; r++) {
    const rad = (radius * r) / rings;
    for (let s = 0; s < sectors; s++) {
      const angle = (s / sectors) * Math.PI * 2;
      const x = Math.cos(angle) * rad;
      const z = Math.sin(angle) * rad;
      positions.push(x, 0, z);
      normals.push(0, 1, 0);
      uvs.push(0.5 + x / (radius * 2), 0.5 + z / (radius * 2));
    }
  }

  for (let s = 0; s < sectors; s++) {
    indices.push(0, 1 + ((s + 1) % sectors), 1 + s);
  }

  for (let r = 1; r < rings; r++) {
    const inner = 1 + (r - 1) * sectors;
    const outer = 1 + r * sectors;
    for (let s = 0; s < sectors; s++) {
      const s2 = (s + 1) % sectors;
      indices.push(inner + s, outer + s2, outer + s);
      indices.push(inner + s, inner + s2, outer + s2);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeBoundingSphere();
  return geometry;
}

const WAVE_GLSL = /* glsl */ `
  float waveHeight(vec3 p) {
    float d = length(p.xz);
    return sin(d * 1.15 - uTime * 1.7) * 0.085
         + sin(p.x * 0.42 + uTime * 0.95) * 0.055
         + sin(p.z * 0.37 - uTime * 0.72) * 0.045;
  }
`;

export function createWater() {
  const geometry = polarDisc(BASE_RADIUS - 0.25, 34, 96);

  const uniforms = { uTime: { value: 0 } };

  const material = new THREE.MeshStandardMaterial({
    color: PALETTE.water,
    transparent: true,
    opacity: 0.88,
    roughness: 0.16,
    metalness: 0.2,
    depthWrite: false,
  });

  material.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = uniforms.uTime;

    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", `#include <common>\nuniform float uTime;\n${WAVE_GLSL}`)
      .replace(
        "#include <beginnormal_vertex>",
        /* glsl */ `
        #include <beginnormal_vertex>
        // Analytic normal from the same wave function, so light actually catches the swell.
        float eps = 0.35;
        float hL = waveHeight(position + vec3(-eps, 0.0, 0.0));
        float hR = waveHeight(position + vec3(eps, 0.0, 0.0));
        float hD = waveHeight(position + vec3(0.0, 0.0, -eps));
        float hU = waveHeight(position + vec3(0.0, 0.0, eps));
        objectNormal = normalize(vec3(hL - hR, eps * 2.0, hD - hU));
        `,
      )
      .replace(
        "#include <begin_vertex>",
        `#include <begin_vertex>\ntransformed.y += waveHeight(position);`,
      );
  };

  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = "water";
  mesh.position.y = WATER_LEVEL;
  mesh.renderOrder = 2;
  mesh.receiveShadow = false;

  return {
    group: mesh,
    update(delta) {
      uniforms.uTime.value += delta;
    },
  };
}
