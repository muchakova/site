// Accessibility and structure of every redesigned page, in both colour schemes,
// on desktop and phone (see playwright.config.js projects).
import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readdirSync } from "node:fs";

const PAGES = [
  "/", "/en/",
  "/services/", "/en/services/", "/about/", "/en/about/", "/contact/", "/en/contact/",
  "/booking/", "/en/booking/",
  "/blog.html", "/en/blog.html",
  "/vlog/", "/en/vlog/",
  "/projects/", "/en/projects/", "/partners/", "/en/partners/", "/donate/", "/en/donate/", "/game/", "/en/game/",
  "/blog/tax-loss-harvesting-po-balgarski.html", "/en/blog/tax-loss-harvesting-po-balgarski.html",
  "/blog/lichen-ili-firmen-akaunt-broker.html", "/en/blog/parviyat-balgarski-white-paper-esma.html",
  "/privacy/", "/en/privacy/", "/accessibility/", "/en/accessibility/",
  "/styleguide/", "/404.html",
];
const AXE_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"];

for (const path of PAGES) {
  for (const colorScheme of ["light", "dark"]) {
    test(`${path} · ${colorScheme}: axe finds no violations, console is clean`, async ({ page }) => {
      const problems = [];
      page.on("console", (m) => m.type() === "error" && problems.push(m.text()));
      page.on("pageerror", (e) => problems.push(e.message));
      await page.emulateMedia({ colorScheme, reducedMotion: "reduce" });
      await page.goto(path);
      const { violations } = await new AxeBuilder({ page }).withTags(AXE_TAGS).analyze();
      expect(violations.map((v) => `${v.id}: ${v.nodes.slice(0, 3).map((n) => n.target.join(" ")).join(" | ")}`)).toEqual([]);
      expect(problems).toEqual([]);
    });
  }

  test(`${path}: landmarks, headings, skip link, no sideways scroll`, async ({ page }) => {
    await page.goto(path);
    await expect(page.locator("main")).toHaveCount(1);
    await expect(page.locator("h1")).toHaveCount(1);

    await page.keyboard.press("Tab");
    await expect(page.locator(":focus")).toHaveAttribute("href", "#main");

    const levels = await page.$$eval("h1, h2, h3, h4, h5, h6", (hs) =>
      hs.filter((h) => h.getClientRects().length).map((h) => Number(h.tagName[1])));
    levels.forEach((lvl, i) => { if (i) expect(lvl - levels[i - 1], `heading h${levels[i - 1]} → h${lvl}`).toBeLessThanOrEqual(1); });

    const navNames = await page.$$eval("nav", (ns) => ns.filter((n) => n.getClientRects().length).map((n) =>
      n.getAttribute("aria-label") || document.getElementById(n.getAttribute("aria-labelledby") || "")?.textContent.trim() || ""));
    expect(navNames.filter((n) => !n), "every visible <nav> is named").toEqual([]);
    expect(new Set(navNames).size, `nav names are unique: ${navNames.join(" / ")}`).toBe(navNames.length);

    const sideways = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(sideways).toBeLessThanOrEqual(0);
  });
}

// WCAG 1.4.10 Reflow: 400% zoom of a 1280 px window = 320 CSS px, no sideways scrolling
for (const path of PAGES) {
  test(`${path}: reflows at 320 px without sideways scroll`, async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "one viewport is enough");
    await page.setViewportSize({ width: 320, height: 640 });
    await page.goto(path);
    const sideways = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(sideways).toBeLessThanOrEqual(0);
  });
}

// Every article, both languages: axe in both colour schemes, one h1, no skipped heading levels, clean console
const POSTS = readdirSync(new URL("../../src/bg/blog/", import.meta.url)).filter((f) => f.endsWith(".html"))
  .flatMap((f) => [`/blog/${f}`, `/en/blog/${f}`]);
for (const path of POSTS) {
  test(`article ${path}: axe (light + dark), headings, console`, async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "articles share one layout; phones are covered by the sample articles above");
    const problems = [];
    page.on("console", (m) => m.type() === "error" && problems.push(m.text()));
    page.on("pageerror", (e) => problems.push(e.message));
    for (const colorScheme of ["light", "dark"]) {
      await page.emulateMedia({ colorScheme, reducedMotion: "reduce" });
      await page.goto(path);
      const { violations } = await new AxeBuilder({ page }).withTags(AXE_TAGS).analyze();
      expect(violations.map((v) => `${colorScheme} ${v.id}: ${v.nodes.slice(0, 3).map((n) => n.target.join(" ")).join(" | ")}`)).toEqual([]);
    }
    await expect(page.locator("h1")).toHaveCount(1);
    const levels = await page.$$eval("h1, h2, h3, h4, h5, h6", (hs) => hs.filter((h) => h.getClientRects().length).map((h) => Number(h.tagName[1])));
    levels.forEach((lvl, i) => { if (i) expect(lvl - levels[i - 1], `heading h${levels[i - 1]} → h${lvl}`).toBeLessThanOrEqual(1); });
    expect(problems).toEqual([]);
  });
}
