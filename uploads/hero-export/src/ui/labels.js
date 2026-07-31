import * as THREE from "three";
import { CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer.js";

const CLICK_SLOP = 6; // px of pointer travel still counted as a click, not a drag

/**
 * Click a tagged object to pin its name above it. One CSS2DObject is reused and
 * re-parented, so labels cost nothing when nothing is selected.
 */
export function createLabelSystem({ camera, domElement, pickables }) {
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();

  const element = document.createElement("div");
  element.className = "pin";
  const label = new CSS2DObject(element);

  let attachedTo = null;
  let downX = 0;
  let downY = 0;

  function detach() {
    if (attachedTo) {
      attachedTo.remove(label);
      attachedTo = null;
    }
  }

  function attach(anchor, text, height) {
    detach();
    element.textContent = text;
    label.position.set(0, height, 0);
    anchor.add(label);
    attachedTo = anchor;
  }

  function findTagged(object) {
    let node = object;
    while (node) {
      if (node.userData.pickName) return node;
      node = node.parent;
    }
    return null;
  }

  function onPointerDown(event) {
    downX = event.clientX;
    downY = event.clientY;
  }

  function onPointerUp(event) {
    if (Math.hypot(event.clientX - downX, event.clientY - downY) > CLICK_SLOP) return;

    const rect = domElement.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(pickables, true);

    for (const hit of hits) {
      const tagged = findTagged(hit.object);
      if (!tagged) continue;

      const anchor = tagged.userData.labelAnchor ?? tagged;
      if (attachedTo === anchor) detach();
      else attach(anchor, tagged.userData.pickName, tagged.userData.labelHeight ?? 2);
      return;
    }

    detach(); // Clicked empty space or scenery.
  }

  domElement.addEventListener("pointerdown", onPointerDown);
  domElement.addEventListener("pointerup", onPointerUp);

  return {
    dispose() {
      domElement.removeEventListener("pointerdown", onPointerDown);
      domElement.removeEventListener("pointerup", onPointerUp);
      detach();
    },
  };
}
