import * as THREE from "three";
import { PALETTE } from "./config.js";

/**
 * Container-sized stage (the original sized itself to the window). No
 * OrbitControls and no CSS2D label renderer: in the landing page the camera is
 * fixed and only the vehicles move, so both would only cost frames and steal
 * scroll gestures on touch.
 */
export function createStage({ container, view = {} }) {
  const {
    background = PALETTE.sky,
    transparent = false,
    position = [28, 23, 35],
    target = [0, 3, 0],
    fov = 38,
    fog = [54, 118],
  } = view;

  const scene = new THREE.Scene();
  if (!transparent) scene.background = new THREE.Color(background);
  scene.fog = new THREE.Fog(background, fog[0], fog[1]);

  const camera = new THREE.PerspectiveCamera(fov, 1, 0.1, 400);
  camera.position.set(...position);
  camera.lookAt(...target);

  // preserveDrawingBuffer keeps the last frame readable, so screenshot tooling
  // (and any snapshot/export path) captures the diorama instead of a blank canvas.
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: transparent,
    preserveDrawingBuffer: true,
  });
  if (transparent) renderer.setClearAlpha(0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.domElement.style.display = "block";
  renderer.domElement.style.width = "100%";
  renderer.domElement.style.height = "100%";
  container.appendChild(renderer.domElement);

  // Set by the scene once it has something to draw. renderer.setSize() clears
  // the drawing buffer, so a resize that happens while the loop is paused (the
  // classic repro is a tab-switch) would otherwise leave a live-but-blank
  // canvas. Re-rendering at the end of every resize is what prevents that.
  let redraw = null;
  function setRedraw(fn) {
    redraw = fn;
  }

  function resize() {
    const width = container.clientWidth;
    const height = container.clientHeight;
    if (width < 2 || height < 2) return; // Not laid out yet; the observer will call back.
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
    redraw?.();
  }
  resize();

  const observer = new ResizeObserver(resize);
  observer.observe(container);

  function dispose() {
    observer.disconnect();
    renderer.dispose();
    renderer.domElement.remove();
  }

  return { scene, camera, renderer, resize, setRedraw, dispose };
}
