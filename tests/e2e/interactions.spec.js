// Behaviour of the interactive components (keyboard first).
import { test, expect } from "@playwright/test";

// on phones the language link sits inside the collapsed menu
async function openMenuIfCollapsed(page) {
  const button = page.locator("[data-menu-button]");
  if (await button.isVisible()) await button.click();
}

test("language switch leads to the counterpart page and back", async ({ page }) => {
  await page.goto("/");
  await openMenuIfCollapsed(page);
  await page.locator('.header-tools a[hreflang="en"]').click();
  await expect(page).toHaveURL(/\/en\/$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await openMenuIfCollapsed(page);
  await page.locator('.header-tools a[hreflang="bg"]').click();
  await expect(page).toHaveURL(/127\.0\.0\.1:4173\/$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "bg");
});

test("theme: header toggle and footer choice stay in sync and persist", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/");
  const toggle = page.locator("[data-theme-toggle]");
  await openMenuIfCollapsed(page);
  await toggle.click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(toggle).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator('input[name="theme"][value="dark"]')).toBeChecked();
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.locator('input[name="theme"][value="system"]').check({ force: true });
  await expect(page.locator("html")).not.toHaveAttribute("data-theme", /.+/);
});

test("mobile menu: keyboard opens it, focus moves in, Escape closes and returns focus", async ({ page }) => {
  await page.goto("/");
  const button = page.locator("[data-menu-button]");
  test.skip(!(await button.isVisible()), "menu button is only shown on narrow screens");
  await button.focus();
  await page.keyboard.press("Enter");
  await expect(button).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator("#site-menu")).toBeVisible();
  await expect(page.locator(":focus")).toHaveText(/Услуги/);
  await page.keyboard.press("Escape");
  await expect(button).toHaveAttribute("aria-expanded", "false");
  await expect(button).toBeFocused();
});

test("video loads from youtube-nocookie only after the click", async ({ page }) => {
  const youtube = [];
  await page.route(/youtube/, (route) => { youtube.push(route.request().url()); route.abort(); });
  await page.goto("/");
  expect(youtube, "nothing from YouTube before the click").toEqual([]);
  await page.locator("[data-yt]").first().click();
  const frame = page.locator(".video-card__media iframe").first();
  await expect(frame).toHaveAttribute("src", /youtube-nocookie\.com\/embed\//);
  await expect(frame).toHaveAttribute("title", /.+/);
});

test("filters announce the result count and show an empty state", async ({ page }) => {
  await page.goto("/styleguide/");
  const status = page.locator("[data-filter-status]");
  await page.locator('[data-filter="crypto"]').click();
  await expect(page.locator('[data-filter="crypto"]')).toHaveAttribute("aria-pressed", "true");
  await expect(status).toHaveText("Показани са 2 статии");
  await page.locator("[data-filter-search]").fill("zzzz");
  await expect(status).toHaveText("Няма статии по този филтър");
  await expect(page.locator("[data-filter-empty]")).toBeVisible();
});

test("copy button announces success", async ({ page, context, browserName }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/styleguide/");
  await page.locator('[data-copy-target="sg-prompt"]').click();
  await expect(page.locator("[data-copy-target='sg-prompt']").locator("xpath=ancestor::*[@data-copy-scope][1]").locator("[data-copy-status]")).toHaveText("Копирано");
});
