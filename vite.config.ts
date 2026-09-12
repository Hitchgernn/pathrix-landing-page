import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: { open: false },
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
