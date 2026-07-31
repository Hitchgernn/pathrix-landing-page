import * as THREE from "three";
import { BASE_RADIUS } from "../config.js";

export function createLights(scene) {
  scene.add(new THREE.AmbientLight(0xffffff, 0.35));

  const hemi = new THREE.HemisphereLight(0xf6e7cd, 0x54402c, 0.85);
  hemi.position.set(0, 30, 0);
  scene.add(hemi);

  const sun = new THREE.DirectionalLight(0xfff1d8, 2.1);
  sun.position.set(20, 28, 14);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.bias = -0.0006;
  sun.shadow.normalBias = 0.02;

  // Fit the shadow frustum to the island so texels are not wasted on empty space.
  const span = BASE_RADIUS + 4;
  const cam = sun.shadow.camera;
  cam.left = -span;
  cam.right = span;
  cam.top = span;
  cam.bottom = -span;
  cam.near = 1;
  cam.far = 90;
  cam.updateProjectionMatrix();

  scene.add(sun);
  scene.add(sun.target);

  // Cool bounce from the opposite side so shadowed faces do not go flat black.
  const fill = new THREE.DirectionalLight(0xbcd4e8, 0.45);
  fill.position.set(-18, 12, -16);
  scene.add(fill);

  return { sun, hemi, fill };
}
