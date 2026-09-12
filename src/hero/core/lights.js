import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
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

/**
 * A prefiltered environment map, for the Tugu model's metallic gold.
 *
 * Deliberately *not* assigned to `scene.environment`: that would re-shade every
 * MeshStandardMaterial in the diorama — terrain, vehicles, water — and the
 * island's look is already tuned against the three lights above. The map is
 * handed to `createTugu()` and applied to the model's materials alone.
 *
 * RoomEnvironment rather than an HDR file: it is procedural, so it costs no
 * network request, and a soft neutral studio box is what a small gold spire
 * needs to read as metal at this scale.
 */
export function createEnvironment(renderer) {
  const pmrem = new THREE.PMREMGenerator(renderer);
  const texture = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  pmrem.dispose();
  return texture;
}
