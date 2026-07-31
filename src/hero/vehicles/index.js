import * as THREE from "three";
import { createAndong } from "./andong.js";
import { createBecak } from "./becak.js";
import { createBus } from "./bus.js";
import { createPlane } from "./plane.js";
import { createTaxi } from "./taxi.js";
import { createTrain } from "./train.js";
import { tagPickable } from "./parts.js";

export function createVehicles(paths) {
  const group = new THREE.Group();
  group.name = "vehicles";

  const vehicles = [
    createTrain(paths),
    createBus(paths),
    createTaxi(paths),
    createBecak(paths),
    createAndong(paths),
    createPlane(paths),
  ];

  for (const vehicle of vehicles) {
    tagPickable(vehicle.group, vehicle.label);
    vehicle.group.userData.labelHeight = vehicle.labelHeight;
    vehicle.group.userData.labelAnchor = vehicle.labelAnchor ?? vehicle.group;
    group.add(vehicle.group);
    vehicle.update(0); // Seat every vehicle on its path before the first frame.
  }

  return {
    group,
    vehicles,
    update(delta) {
      for (const vehicle of vehicles) vehicle.update(delta);
    },
  };
}
