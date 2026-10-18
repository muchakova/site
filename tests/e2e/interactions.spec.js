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

test("booking: nothing loads from Cal.com until a format is chosen; fallback if it fails", async ({ page }) => {
  const cal = [];
  await page.route(/cal\.com/, (route) => { cal.push(route.request().url()); route.abort(); });
  await page.goto("/booking/");
  await expect(page.locator("[data-cal-hint]")).toBeVisible();
  expect(cal, "no Cal.com requests before a choice").toEqual([]);
  await page.locator('label:has(input[value="30"])').click();
  await expect(page.locator("#format-30")).toBeChecked();
  await expect.poll(() => cal.length, { message: "Cal.com is requested after the choice" }).toBeGreaterThan(0);
  await expect(page.locator("[data-cal-fallback]")).toBeVisible();   // embed.js was blocked → contacts shown
});

test("booking: ?format=60 preselects the 60-minute consultation", async ({ page }) => {
  await page.route(/cal\.com/, (route) => route.abort());
  await page.goto("/booking/?format=60");
  await expect(page.locator("#format-60")).toBeChecked();
  await expect(page.locator("[data-cal-hint]")).toBeHidden();
  // the queued Cal.com instruction must point at the 60-minute event type
  const inline = await page.evaluate(() => (window.Cal.ns.f60.q || []).find((i) => i[0] === "inline")?.[1]);
  expect(inline.calLink).toBe("marina-muchakova-dxmkoe/60-min-meeting");
  expect(inline.elementOrSelector).toBe("#cal-60");
});

test("booking: format options are keyboard-operable radios", async ({ page }) => {
  await page.route(/cal\.com/, (route) => route.abort());
  await page.goto("/booking/");
  await page.locator("#format-30").focus();
  await page.keyboard.press("Space");
  await expect(page.locator("#format-30")).toBeChecked();
  await page.keyboard.press("ArrowRight");
  await expect(page.locator("#format-60")).toBeChecked();
});

test("old shared anchor #en-2 on a Bulgarian post opens the English post", async ({ page }) => {
  await page.goto("/blog/tax-loss-harvesting-po-balgarski.html#en-2");
  await expect(page).toHaveURL(/\/en\/blog\/tax-loss-harvesting-po-balgarski\.html#en-2$/);
  await expect(page.locator("#en-2")).toHaveCount(1);
});

test("article: table of contents, reading time and language link", async ({ page }) => {
  await page.goto("/blog/tax-loss-harvesting-po-balgarski.html");
  const toc = page.locator(".toc-desktop nav.toc a, .toc-mobile nav.toc a");
  expect(await toc.count()).toBeGreaterThanOrEqual(6);
  await expect(page.locator(".post-meta")).toContainText(/\d+ мин четене/);
  await expect(page.locator('.post-meta a[hreflang="en"]')).toHaveAttribute("href", "/en/blog/tax-loss-harvesting-po-balgarski.html");
});

test("blog: ?cat= preselects a topic and the count is announced", async ({ page }) => {
  await page.goto("/blog.html?cat=crypto");
  await expect(page.locator('[data-filter="crypto"]')).toHaveAttribute("aria-pressed", "true");
  const visible = await page.locator("[data-filter-list] > li:visible").count();
  expect(visible).toBeGreaterThan(0);
  await page.locator('[data-filter="all"]').click();
  await expect(page.locator("[data-filter-status]")).toHaveText(/Показани са 29 статии/);
});

test("videos: topic filter, singular/plural announcement, anchors from the old page", async ({ page }) => {
  await page.goto("/vlog/");
  await expect(page.locator("#zagubi-finansovi-instrumenti, #oborot-dds-kripto, #reguliran-pazar-gettex")).toHaveCount(3);
  await page.locator('[data-filter="vat"]').click();
  await expect(page.locator("[data-filter-status]")).toHaveText("Показано е 1 видео");
  await page.locator('[data-filter="all"]').click();
  await expect(page.locator("[data-filter-status]")).toHaveText("Показани са 3 видеа");
});
