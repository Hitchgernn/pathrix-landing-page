import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Pinned, not incidental: scripts/vehicle-check.mjs defaults to :5174 and the
  // docs quote it. strictPort so a busy port fails loudly instead of drifting to
  // another number and quietly breaking that check.
  server: { open: false, port: 5174, strictPort: true },
  build: {
    target: "es2020",
    assetsInlineLimit: 0,
    rollupOptions: {
      output: {
        // Split the heavy libraries out of the entry chunk so the hero wordmark
        // (the LCP element) is not waiting on three.js to parse.
        manualChunks: {
          three: [
            "three",
            "three/examples/jsm/utils/BufferGeometryUtils.js",
            "three/examples/jsm/loaders/GLTFLoader.js",
            "three/examples/jsm/libs/meshopt_decoder.module.js",
            "three/examples/jsm/environments/RoomEnvironment.js",
          ],
          gsap: ["gsap", "gsap/ScrollTrigger"],
        },
      },
    },
  },
  resolve: {
    // Guarantee a single three.js instance in the bundle. The diorama modules
    // and BufferGeometryUtils must resolve to the same copy or instanceof
    // checks inside three start failing.
    dedupe: ["three", "react", "react-dom"],
  },
});
