import * as THREE from "three";
import { createStage } from "./core/stage.js";
import { createLights } from "./core/lights.js";
import { createIsland } from "./world/island.js";
import { createProps } from "./world/props.js";
import { createWater } from "./world/water.js";
import { createTracks, sidePlacement } from "./world/rail.js";
import { createTugu } from "./landmarks/tugu.js";
import { createPaths } from "./vehicles/paths.js";
import { RAIL_HEIGHT, ROAD_HEIGHT } from "./config.js";
import { createVehicles } from "./vehicles/index.js";
import { createLabelSystem } from "./ui/labels.js";

const container = document.getElementById("app");
const labelContainer = document.getElementById("labels");

const stage = createStage({ container, labelContainer });
const { scene, camera, renderer, labelRenderer, controls } = stage;

createLights(scene);

const paths = createPaths();

// Both buildings sit on the *outer* shoulder of their loop, far enough out that
// the train's and the bus's swept width stays clear of the platform edge; the
// island flattens a pad under each so nothing floats over sloped hexes.
const placements = {
  halte: sidePlacement(paths.road, 0.62, 2.8),
  station: sidePlacement(paths.rail, 0.12, 2.2),
};

const island = createIsland({
  pads: [
    { ...placements.halte, radius: 1.4, height: ROAD_HEIGHT, biome: "asphalt" },
    { ...placements.station, radius: 2.4, height: RAIL_HEIGHT, biome: "gravel" },
  ],
});
scene.add(island.group);
scene.add(createProps(island));

scene.add(createTracks(paths, placements));

const tugu = createTugu();
tugu.group.userData.pickName = tugu.label;
tugu.group.userData.labelHeight = tugu.labelHeight;
scene.add(tugu.group);

const vehicles = createVehicles(paths);
scene.add(vehicles.group);

const water = createWater();
scene.add(water.group);

const labels = createLabelSystem({
  camera,
  domElement: renderer.domElement,
  pickables: [vehicles.group, tugu.group],
});

const clock = new THREE.Clock();

function animate() {
  const delta = Math.min(clock.getDelta(), 0.1); // Clamp after tab-switch stalls.

  vehicles.update(delta);
  water.update(delta);
  controls.update();

  renderer.render(scene, camera);
  labelRenderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

function disposeAll() {
  renderer.setAnimationLoop(null);
  labels.dispose();

  scene.traverse((object) => {
    object.geometry?.dispose();
    const material = object.material;
    if (Array.isArray(material)) material.forEach((m) => m.dispose());
    else material?.dispose();
  });

  stage.dispose();
}

window.addEventListener("beforeunload", disposeAll);

if (import.meta.hot) {
  import.meta.hot.dispose(disposeAll);
}
