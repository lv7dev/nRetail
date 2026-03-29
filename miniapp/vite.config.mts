import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import path from "path";

// https://vitejs.dev/config/
export default () => {
  return defineConfig({
    root: "./src",
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
    test: {
      environment: "jsdom",
      globals: true,
      setupFiles: ["./src/setupTests.ts"],
      coverage: {
        provider: "v8",
        all: true,
        include: ["src/**/*.{ts,tsx}"],
        exclude: [
          "src/app.tsx",
          "src/i18n.ts",
          "src/setupTests.ts",
          "src/setupTests.integration.ts",
          "src/mocks/**",
          "src/types/**",
          "src/**/index.ts",
          "src/services/authService.ts",
          "src/services/axios.ts",
        ],
        thresholds: {
          statements: 100,
          branches: 100,
          functions: 100,
          lines: 100,
        },
      },
    },
  });
};
