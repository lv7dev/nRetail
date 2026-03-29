import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import path from "path";

/**
 * Vite config for Playwright E2E tests.
 * Uses root "." so Vite finds index.html at the project root (not inside src/).
 * The main vite.config.mts uses root: "./src" for the zmp start / zmp deploy workflow.
 */
export default defineConfig({
  root: ".",
  base: "",
  plugins: [react(), svgr()],
  build: {
    assetsInlineLimit: 0,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
