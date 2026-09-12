import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import { PLAZA_HEIGHT } from "../config.js";

/** Packed by `npm run model` from scripts/art/tugu-jogja/. See AGENTS.md for the licence. */
const MODEL_URL = "/hero/tugu-jogja.glb";

/**
 * The model is authored around the origin, Y-up, base at y=0, and stands
 * 4.0385 units tall on a 1.45 footprint. The procedural monument it replaces
 * topped out at 10.49 with its plinth, and `scripts/verify.mjs` asserts the
 * island silhouette never climbs over the hero wordmark — so that height is a
 * ceiling, not a suggestion. Seating the model on the 3.5-wide stone step
 * (top y = 0.78) and scaling to fill what is left puts the spire at 10.49 and
 * gives a 3.49 footprint, which lands almost exactly on that step.
 */
const MODEL_BASE_Y = 0.78;
const MODEL_HEIGHT = 4.0385;
const MODEL_SCALE = (10.49 - MODEL_BASE_Y) / MODEL_HEIGHT;

/**
 * The page's `--warm` accent, and the one gold in the scene. AGENTS.md requires
 * this to stay in step with `--warm` in tokens.css; keeping it as a named
 * constant means the model override below cannot drift from the posts' caps.
 */
const GOLD_HEX = 0xd9a521;

const WHITE = new THREE.MeshStandardMaterial({ color: 0xf4f1e8, roughness: 0.62, metalness: 0.02 });
const GOLD = new THREE.MeshStandardMaterial({ color: GOLD_HEX, roughness: 0.26, metalness: 0.92 });
/**
 * The thin trim pieces — ribs, plaques, band, and the horizontal collars and
 * cornices — are too narrow and too often side-on to catch a specular
 * highlight, and at GOLD's metalness they render near-black without an
 * environment map. Dropping metalness lets them pick up diffuse light and
 * actually read as gold at hero render scale. GOLD stays on the big rounded
 * pieces (upper cornice, ball, spire), which are lit well enough to want it.
 *
 * This only applies to the procedural fallback below. The real model *is* given
 * an environment map (see `applyModelMaterials`), which is why its gold can keep
 * the metalness the glTF authored.
 */
const GOLD_SOFT = new THREE.MeshStandardMaterial({ color: 0xe0ae2e, roughness: 0.45, metalness: 0.35 });
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

/**
 * Place a mesh on one facet of the octagonal body. CylinderGeometry starts its
 * first vertex on +Z, so a pivot rotated by `angle` with the child pushed out
 * along local +Z lands on the matching facet, already facing outward.
 */
function facet(group, geometry, material, angle, y, radius, tiltX = 0) {
  const pivot = new THREE.Group();
  pivot.rotation.y = angle;
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(0, y, radius);
  mesh.rotation.x = tiltX;
  mesh.castShadow = true;
  pivot.add(mesh);
  group.add(pivot);
  return mesh;
}

// Facet centres of an 8-gon, taken every 90 degrees.
const FACETS = [22.5, 112.5, 202.5, 292.5].map(THREE.MathUtils.degToRad);

/**
 * The monument as hand-built primitives: white tapered octagonal shaft ribbed in
 * gold, a banded drum with arched window plaques, then gold cornice, ball and
 * spire, all on a white pedestal block.
 *
 * This is no longer what a working page shows — it is the standby for when the
 * glTF fails to load. A bare plinth is not an acceptable degraded state, so the
 * approximation stays in the tree until the real model is actually in hand.
 */
function buildProceduralMonument() {
  const group = new THREE.Group();
  group.name = "Tugu Jogja (procedural fallback)";

  add(group, new THREE.BoxGeometry(2.1, 1.15, 2.1), WHITE, 1.35);
  add(group, new THREE.BoxGeometry(2.45, 0.18, 2.45), GOLD_SOFT, 2.02);

  // Collar and shaft are both eight-sided, matching the real monument's faceting.
  add(group, new THREE.CylinderGeometry(0.7, 0.7, 0.16, 8), GOLD_SOFT, 2.19);
  add(group, new THREE.CylinderGeometry(0.44, 0.64, 4.7, 8), WHITE, 4.46);

  // One gold rib per visible facet, leaning inward so it tracks the shaft's taper.
  const ribGeo = new THREE.BoxGeometry(0.1, 4.72, 0.07);
  const ribTilt = -Math.atan2(0.184, 4.7);
  for (const angle of FACETS) {
    facet(group, ribGeo, GOLD_SOFT, angle, 4.46, 0.505, ribTilt);
  }

  // Necking ring flares out of the shaft top into the bulbous drum.
  add(group, new THREE.CylinderGeometry(0.5, 0.46, 0.14, 8), GOLD_SOFT, 6.88);
  add(group, new THREE.CylinderGeometry(0.62, 0.58, 1.15, 8), WHITE, 7.525);

  // Shallow plaques, half sunk into the drum, standing in for its arched windows.
  const plaqueGeo = new THREE.BoxGeometry(0.26, 0.42, 0.05);
  for (const angle of FACETS) {
    facet(group, plaqueGeo, GOLD_SOFT, angle, 7.4, 0.573);
  }

  // The real drum carries a star-and-crescent band; at this render scale a raised
  // gold trim ring reads the same and costs no extruded profile.
  add(group, new THREE.CylinderGeometry(0.65, 0.65, 0.12, 8), GOLD_SOFT, 7.9);

  // Modest cornice ledge, a small ball, then a long spire — the real monument's
  // top is slim, not a mushroom cap.
  add(group, new THREE.CylinderGeometry(0.52, 0.72, 0.28, 8), GOLD, 8.24);
  add(group, new THREE.SphereGeometry(0.3, 18, 12), GOLD, 8.59);
  add(group, new THREE.ConeGeometry(0.14, 1.6, 12), GOLD, 9.69);

  return group;
}

/**
 * Geometries only. The materials are the module-level constants above, shared
 * with the plinth and the perimeter posts that stay in the scene.
 */
function disposeGeometries(root) {
  root.traverse((object) => object.geometry?.dispose());
}

function applyModelMaterials(root, envMap) {
  root.traverse((object) => {
    if (!object.isMesh) return;
    object.castShadow = true;
    object.receiveShadow = true;
    const materials = Array.isArray(object.material) ? object.material : [object.material];
    for (const material of materials) {
      if (!material) continue;
      /*
       * All three glTF materials declare doubleSided, which three honours as
       * THREE.DoubleSide. The monument is closed, so back faces only cost a
       * second pass through the shadow map and invite acne on the thin trim.
       */
      material.side = THREE.FrontSide;

      /*
       * The environment map goes on the metal only.
       *
       * A metal has no diffuse response, so under the scene's three lights the
       * gold renders near-black — the same failure that forced GOLD_SOFT's
       * metalness down in the procedural version, and the reason this map exists
       * at all. On the white marble, though, an env map adds diffuse irradiance
       * on top of an already-generous ambient + hemisphere + sun, and the body
       * flattens into a featureless white silhouette. Verified across 0/0.3/0.6:
       * the shading on the shaft visibly disappears by 0.3.
       *
       * 0.4 on the metal is where the gold reads as gold without going brighter
       * than the sunlit terrain around it.
       */
      if (envMap && material.metalness > 0.2) {
        material.envMap = envMap;
        material.envMapIntensity = 0.4;
        /*
         * The export's gold is #e8cf01 — an acid lemon that fights the page's
         * warm accent. Retint to the scene's one gold.
         */
        material.color.setHex(GOLD_HEX);
      }
      material.needsUpdate = true;
    }
  });
}

/**
 * Swap the procedural monument for the glTF once it arrives. Never rejects:
 * on any failure the fallback simply stays standing.
 */
function loadModel(group, fallback, envMap) {
  return new Promise((resolve) => {
    const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
    loader.load(
      MODEL_URL,
      (gltf) => {
        const model = gltf.scene;
        model.name = "Tugu Jogja (model)";
        model.scale.setScalar(MODEL_SCALE);
        model.position.y = MODEL_BASE_Y;
        applyModelMaterials(model, envMap);

        group.remove(fallback);
        disposeGeometries(fallback);
        group.add(model);
        resolve();
      },
      undefined,
      (error) => {
        console.warn("[pathrix] Tugu model unavailable, keeping the fallback:", error);
        resolve();
      },
    );
  });
}

/**
 * Tugu Pal Putih on its stepped square plinth, ringed by perimeter posts.
 *
 * Synchronous by contract — the caller gets a group it can add to the world
 * immediately. The monument itself arrives asynchronously; await `loaded` before
 * compiling shaders or showing the first frame.
 */
export function createTugu(envMap) {
  const group = new THREE.Group();
  group.name = "Tugu Jogja";
  group.position.y = PLAZA_HEIGHT;

  // Stepped stone plinth. Not part of the model, and the plaza reads bare
  // without it.
  add(group, new THREE.BoxGeometry(4.6, 0.42, 4.6), STONE, 0.21);
  add(group, new THREE.BoxGeometry(3.5, 0.36, 3.5), STONE, 0.6);

  const fallback = buildProceduralMonument();
  group.add(fallback);

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

  return { group, loaded: loadModel(group, fallback, envMap), label: "Tugu Jogja", labelHeight: 10.8 };
}
