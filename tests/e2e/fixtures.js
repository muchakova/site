// Shared test setup: the visitor-statistics script (plausible.io) is answered with an empty script,
// so tests never depend on an outside service and custom events stay in the page's queue (window.plausible.q).
import { test as base, expect } from "@playwright/test";

export const test = base.extend({
  page: async ({ page }, use) => {
    await page.route("https://plausible.io/**", (route) => route.fulfill({ contentType: "text/javascript", body: "" }));
    await use(page);
  },
});
export { expect };
