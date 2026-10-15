import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env.E2E_PORT ?? 3200);

/**
 * Browser e2e. Requires `npm run setup` (Clerk + Convex keys in .env.local).
 * Boots Convex and a production Next.js server automatically.
 */
export default defineConfig({
  testDir: "./e2e",
  timeout: 90_000,
  fullyParallel: false,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "retain-on-failure",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] }, grep: /public site/ },
  ],
  webServer: [
    {
      command: "npm run dev:convex",
      url: "http://127.0.0.1:3210/version",
      reuseExistingServer: true,
      timeout: 120_000,
    },
    {
      command: `npm run build && npx next start -p ${PORT}`,
      url: `http://localhost:${PORT}/api/health`,
      reuseExistingServer: !process.env.CI,
      timeout: 300_000,
    },
  ],
});
