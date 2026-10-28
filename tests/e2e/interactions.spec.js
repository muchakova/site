// Behaviour of the interactive components (keyboard first).
import { test, expect } from "./fixtures.js";

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

test("article lists on English pages open the English articles", async ({ page }) => {
  for (const path of ["/en/", "/en/services/", "/en/blog.html"]) {
    await page.goto(path);
    const paths = await page.locator(".card__link").evaluateAll((links) =>
      links.map((a) => new URL(a.href).pathname).filter((p) => p.includes("/blog/")));
    expect(paths.length, path).toBeGreaterThan(0);
    for (const p of paths) expect(p, path).toMatch(/^\/en\/blog\//);
  }
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
  // only Chromium asks for a permission; Safari and Firefox allow copying after a click
  if (browserName === "chromium") await context.grantPermissions(["clipboard-read", "clipboard-write"]);
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
  await expect(page.locator('.post-meta a[hreflang="en"]')).toHaveJSProperty("pathname", "/en/blog/tax-loss-harvesting-po-balgarski.html");
});

test("blog: ?cat= preselects a topic and the count is announced", async ({ page }) => {
  await page.goto("/blog.html?cat=crypto");
  await expect(page.locator('[data-filter="crypto"]')).toHaveAttribute("aria-pressed", "true");
  const visible = await page.locator("[data-filter-list] > li:visible").count();
  expect(visible).toBeGreaterThan(0);
  await page.locator('[data-filter="all"]').click();
  await expect(page.locator("[data-filter-status]")).toHaveText(/Показани са 33 статии/);
});

test("videos: topic filter, singular/plural announcement, anchors from the old page", async ({ page }) => {
  await page.goto("/vlog/");
  await expect(page.locator("#zagubi-finansovi-instrumenti, #oborot-dds-kripto, #reguliran-pazar-gettex")).toHaveCount(3);
  await page.locator('[data-filter="crypto"]').click();
  await expect(page.locator("[data-filter-status]")).toHaveText("Показано е 1 видео");
  await page.locator('[data-filter="vat"]').click();
  await expect(page.locator("[data-filter-status]")).toHaveText("Показани са 2 видеа");
  await page.locator('[data-filter="all"]').click();
  await expect(page.locator("[data-filter-status]")).toHaveText("Показани са 5 видеа");
});

test("projects and partners keep the anchors of the old pages", async ({ page }) => {
  await page.goto("/projects/");
  await expect(page.locator("#nabi, #pet, #synth, #game")).toHaveCount(4);
  await page.goto("/partners/");
  await expect(page.locator("#tax-invest, #nx0")).toHaveCount(2);
  await page.goto("/en/partners/");
  await expect(page.locator("#nx0 a")).toHaveJSProperty("pathname", "/en/blog/parviyat-balgarski-white-paper-esma.html");
});

test("game: start, keyboard focus, pause and resume with P, skip link", async ({ page }) => {
  await page.goto("/game/");
  const card = page.locator("#card");
  await expect(card).toHaveAttribute("role", "dialog");
  await expect(card).toHaveAccessibleName("Марина срещу данъчните зомбита");
  await expect(page.locator("#pauseBtn")).toBeHidden();

  await card.locator("[data-go]").click();
  await expect(page.locator("#overlay")).toBeHidden();
  await expect(page.locator("#cabinet")).toBeFocused();         // focus is not lost on the hidden card
  await expect(page.locator("#hudLvl")).toHaveText(/Ниво 1/);  // live region with the level name
  await expect(page.locator("#pauseBtn")).toBeVisible();

  await page.keyboard.press("p");
  await expect(card).toHaveAccessibleName("Пауза");
  await expect(card.locator("[data-resume]")).toBeFocused();
  await page.keyboard.press("p");
  await expect(page.locator("#overlay")).toBeHidden();
  await expect(page.locator("#cabinet")).toBeFocused();

  await page.locator("#pauseBtn").click();
  await expect(card).toHaveAccessibleName("Пауза");
  await page.keyboard.press("Escape");
  await expect(page.locator("#overlay")).toBeHidden();

  // the skip link appears on focus and moves focus past the game
  await page.locator(".skip-game").focus();
  await expect(page.locator(".skip-game")).toBeVisible();
  await page.keyboard.press("Enter");
  await expect(page.locator("#game-after")).toBeFocused();
});

test("game: English page plays in English", async ({ page }) => {
  await page.goto("/en/game/");
  await expect(page.locator("#card")).toHaveAccessibleName("Marina vs the Tax Zombies");
  await expect(page.locator("#snd")).toHaveText("Mute");
  await page.locator("#snd").click();
  await expect(page.locator("#snd")).toHaveText("Unmute");
});

test("404: any missing address gets the bilingual page with status 404; search hands off to the blog", async ({ page }) => {
  const res = await page.goto("/en/no-such-page/");
  expect(res.status()).toBe(404);
  await expect(page.locator("h1")).toHaveText("Тази страница не съществува");
  await expect(page.locator('[lang="en"] h2')).toHaveText("This page doesn’t exist");
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);
  await page.locator("#q-bg").fill("ETF");
  await page.locator("#q-bg").press("Enter");
  await expect(page).toHaveURL(/\/blog\.html\?q=ETF$/);
  await expect(page.locator("#blog-search")).toHaveValue("ETF");
  await expect(page.locator("[data-filter-status]")).toHaveText(/Показан/);
});

test("privacy and accessibility: contents list, marked open questions", async ({ page }) => {
  for (const path of ["/privacy/", "/en/accessibility/"]) {
    await page.goto(path);
    const toc = page.locator(".toc-desktop nav.toc a, .toc-mobile nav.toc a");
    expect(await toc.count()).toBeGreaterThanOrEqual(5);
    await expect(page.locator(".doc-updated time")).toHaveAttribute("datetime", /^\d{4}-\d{2}-\d{2}$/);
  }
});

test("RSS feeds: well-formed, one item per article, links open the article in the feed's language", async ({ page, request }) => {
  for (const [path, lang] of [["/feed.xml", "bg"], ["/en/feed.xml", "en"]]) {
    const xml = await (await request.get(path)).text();
    await page.goto("/");
    const feed = await page.evaluate((text) => {
      const doc = new DOMParser().parseFromString(text, "application/xml");
      return { error: !!doc.querySelector("parsererror"), lang: doc.querySelector("language")?.textContent,
        links: [...doc.querySelectorAll("item > link")].map((l) => new URL(l.textContent).pathname) };
    }, xml);
    expect(feed.error).toBe(false);
    expect(feed.lang).toBe(lang);
    expect(feed.links.length).toBe(33);
    for (const link of feed.links.slice(0, 3)) {
      expect((await request.get(link)).status()).toBe(200);
      if (lang === "en") expect(link).toMatch(/^\/en\/blog\//);
    }
  }
  expect(await page.locator('link[rel="alternate"][type="application/rss+xml"]').evaluate((l) => new URL(l.href).pathname)).toBe("/feed.xml");
});

test("visitor statistics: Plausible without cookies; choosing a format is counted", async ({ page, context }) => {
  await page.route("https://app.cal.com/**", (route) => route.abort());
  await page.goto("/booking/");
  await expect(page.locator('script[data-domain="muchakova.com"][src^="https://plausible.io/js/"]')).toHaveCount(1);
  await page.locator('label:has(#format-60)').click();
  const queued = await page.evaluate(() => (window.plausible.q || []).map((args) => [args[0], args[1]?.props?.format]));
  expect(queued).toContainEqual(["Booking format", "60"]);
  expect(await context.cookies()).toEqual([]);
});
