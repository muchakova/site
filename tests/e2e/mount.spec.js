// The same build, served in a folder: locally at http://127.0.0.1:4174/x/y/ (tools/serve.mjs mount), or the
// live site with MOUNT_URL=https://muchakova.com/. Every request must stay inside the
// folder and succeed; pictures, fonts and icons load; navigation never leaves the folder.
import { test, expect } from "./fixtures.js";
import { crawl } from "../../tools/crawl.mjs";

const PAGES = ["", "en/", "services/", "en/services/", "about/", "blog.html", "blog/tax-loss-harvesting-po-balgarski.html",
  "en/blog/dds-registraciya-interactive-brokers.html", "booking/", "en/booking/", "contact/", "vlog/", "game/", "en/game/",
  "styleguide/", "privacy/"];

test("crawl: every link, picture, stylesheet, font and icon answers 200 inside the folder", async ({ baseURL }) => {
  test.setTimeout(180_000);
  const { checked, problems } = await crawl(baseURL);
  expect(problems).toEqual([]);
  expect(checked).toBeGreaterThan(200);
});

for (const path of PAGES) {
  test(`${path || "home"}: requests stay in the folder; pictures, fonts and icons load; no console errors`, async ({ page, baseURL }) => {
    const folder = new URL(baseURL);
    const problems = [];
    await page.route(/cal\.com|youtube/, (r) => r.abort());
    page.on("response", (r) => {
      const u = new URL(r.url());
      if (u.origin !== folder.origin) return;
      if (!u.pathname.startsWith(folder.pathname)) problems.push(`outside the folder: ${u.pathname}`);
      else if (r.status() >= 400) problems.push(`${r.status()}: ${u.pathname}`);
    });
    page.on("console", (m) => m.type() === "error" && problems.push(`console: ${m.text()}`));
    page.on("pageerror", (e) => problems.push(`page error: ${e.message}`));
    await page.goto(path);
    const media = await page.evaluate(async () => {
      document.querySelectorAll("details").forEach((d) => (d.open = true));
      const imgs = [...document.images];
      imgs.forEach((i) => (i.loading = "eager"));
      await Promise.all(imgs.map((i) => (i.complete ? null : new Promise((ok) => { i.onload = i.onerror = ok; }))));
      await Promise.allSettled([...document.fonts].map((f) => f.load()));
      return {
        brokenImages: imgs.filter((i) => !i.naturalWidth).map((i) => i.currentSrc || i.src),
        brokenFonts: [...document.fonts].filter((f) => f.status === "error").map((f) => f.family),
      };
    });
    expect(problems).toEqual([]);
    expect(media.brokenImages).toEqual([]);
    expect(media.brokenFonts).toEqual([]);
  });
}

test("navigation and language links stay in the folder", async ({ page, baseURL }) => {
  await page.goto("");
  await page.locator('.header-tools a[hreflang="en"]').click();
  await expect(page).toHaveURL(baseURL + "en/");
  await page.locator(".site-nav a").first().click();
  await expect(page).toHaveURL(baseURL + "en/services/");
  await page.locator(".site-header .brand").click();
  await expect(page).toHaveURL(baseURL + "en/");
  await page.locator('.header-tools a[hreflang="bg"]').click();
  await expect(page).toHaveURL(baseURL);
});

test("old shared #en-2 anchor, /meet/ redirect and style-guide icons work in the folder", async ({ page, baseURL }) => {
  await page.goto("blog/tax-loss-harvesting-po-balgarski.html#en-2");
  await expect(page).toHaveURL(baseURL + "en/blog/tax-loss-harvesting-po-balgarski.html#en-2");
  await page.goto("meet/");
  await expect(page).toHaveURL(baseURL + "booking/");
  await page.goto("styleguide/");
  await expect.poll(() => page.locator("[data-icon-list] li").count()).toBeGreaterThan(10);
});
