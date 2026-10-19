// End-to-end checks against the built site (_site), served like GitHub Pages.
// Locally it drives the installed Google Chrome; CI installs Playwright's Chromium.
// npm run test:e2e      → desktop + phone (Chrome)
// npm run test:browsers → the same tests in Safari's engine on an iPhone and in Firefox
//                         (needs: npx playwright install webkit firefox)
import { defineConfig, devices } from "@playwright/test";

const chrome = process.env.CI ? {} : { channel: "chrome" };
export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  reporter: process.env.CI ? "github" : "list",
  use: { baseURL: "http://127.0.0.1:4173", reducedMotion: "reduce" },
  webServer: { command: "node tools/serve.mjs _site 4173", url: "http://127.0.0.1:4173/", reuseExistingServer: !process.env.CI },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], ...chrome, viewport: { width: 1280, height: 900 } } },
    { name: "phone", use: { ...devices["Pixel 7"], ...chrome } },
    { name: "iphone-safari", use: { ...devices["iPhone 13"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"], viewport: { width: 1280, height: 900 } } },
  ],
});
