import { defineConfig, mergeConfig } from "vite";
import baseConfig from "./vite.config.mts";

export default mergeConfig(baseConfig(), defineConfig({
  test: {
    include: ["src/**/*.integration.test.{ts,tsx}"],
    setupFiles: ["./src/setupTests.integration.ts"],
  },
}));
