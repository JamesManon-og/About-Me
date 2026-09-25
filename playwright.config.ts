import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;
const baseURL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [
    { name: "desktop-chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile-webkit", use: { ...devices["iPhone 15"] } },
  ],
  // E2E runs against a production build, not the dev server. The chat uses the scripted
  // mock model, so no API key is needed and answers are deterministic.
  webServer: {
    command: `bun run build && bun run start --port ${PORT}`,
    url: baseURL,
    env: { CHAT_MODEL_MOCK: "1" },
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
