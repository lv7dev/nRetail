import { defineConfig, mergeConfig } from "vite";
import baseConfig from "./vite.config.mts";

export default mergeConfig(baseConfig(), defineConfig({
  test: {
    include: ["**/*.integration.test.{ts,tsx}"],
    setupFiles: ["./src/setupTests.integration.ts"],
    env: {
      // MSW Node server intercepts at the network layer and requires absolute URLs.
      // The production axios instances use this base URL, so integration tests must
      // provide a real origin for MSW to match requests against.
      VITE_API_BASE_URL: "http://localhost",
    },
  },
}));
