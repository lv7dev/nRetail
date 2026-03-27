import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  retries: process.env.CI ? 2 : 1,
  globalSetup: "./e2e/global-setup.ts",
  use: {
    baseURL: "http://localhost:3000",
  },
  webServer: [
    {
      command:
        "VITE_API_BASE_URL=http://localhost:3001 npx vite --port 3000",
      port: 3000,
      reuseExistingServer: !process.env.CI,
    },
    {
      // Use the NestJS CLI (nest start) which is available via the backend's
      // devDependencies. We cd into the backend directory so NestJS can
      // resolve tsconfig paths and source files correctly.
      command:
        "cd ../backend && PORT=3001 DATABASE_URL=postgresql://postgres:postgres@localhost:5433/test_nretail JWT_SECRET=integration-test-secret-minimum-32-chars JWT_EXPIRES_IN=15m REDIS_URL=redis://localhost:6379 NODE_ENV=test npm run start:dev",
      port: 3001,
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
    },
  ],
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
