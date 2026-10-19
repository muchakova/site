// End-to-end checks against the built site (_site), served like GitHub Pages, on this machine (no CI).
// npm run test:e2e      → desktop + phone (Chrome) + mount (the same build served in the folder /x/y/)
// npm run test:browsers → the same tests in Safari's engine on an iPhone and in Firefox
//                         (needs: npx playwright install webkit firefox)
// npm run check:new     → the mount checks against the published test version, https://muchakova.com/new/
import { defineConfig, devices } from "@playwright/test";

const chrome = process.env.CI ? {} : { channel: "chrome" };
export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  reporter: process.env.CI ? "github" : "list",
  use: { baseURL: "http://127.0.0.1:4173", reducedMotion: "reduce" },
  // no local servers when checking the published test version (MOUNT_URL=https://muchakova.com/new/)
  webServer: process.env.MOUNT_URL ? undefined : [
    { command: "node tools/serve.mjs _site 4173", url: "http://127.0.0.1:4173/", reuseExistingServer: !process.env.CI },
    { command: "node tools/serve.mjs _site 4174 /x/y/", url: "http://127.0.0.1:4174/x/y/", reuseExistingServer: !process.env.CI },
  ],
  projects: [
    { name: "desktop", testIgnore: /mount\.spec\.js/, use: { ...devices["Desktop Chrome"], ...chrome, viewport: { width: 1280, height: 900 } } },
    { name: "phone", testIgnore: /mount\.spec\.js/, use: { ...devices["Pixel 7"], ...chrome } },
    { name: "iphone-safari", testIgnore: /mount\.spec\.js/, use: { ...devices["iPhone 13"] } },
    { name: "firefox", testIgnore: /mount\.spec\.js/, use: { ...devices["Desktop Firefox"], viewport: { width: 1280, height: 900 } } },
    { name: "mount", testMatch: /mount\.spec\.js/,
      use: { ...devices["Desktop Chrome"], ...chrome, viewport: { width: 1280, height: 900 }, baseURL: process.env.MOUNT_URL || "http://127.0.0.1:4174/x/y/" } },
  ],
});
