// Keyboard and text-spacing audit of the main pages (desktop):
//  • Tab through the whole page: every stop is on screen and shows a focus indicator,
//    and focus gets all the way to the footer (no keyboard trap);
//  • WCAG 1.4.12 text spacing: with wider letter, word, line and paragraph spacing no text is cut off.
import { test, expect } from "./fixtures.js";

const PAGES = ["/", "/en/", "/services/", "/about/", "/booking/", "/contact/", "/blog.html", "/vlog/",
  "/blog/kak-se-oblagat-etf-ite-v-balgaria.html", "/projects/", "/partners/", "/donate/", "/game/", "/privacy/", "/404.html"];

for (const path of PAGES) {
  test(`${path}: every Tab stop is visible, has a focus indicator, and focus reaches the footer`, async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "keyboard audit on desktop");
    await page.route("https://app.cal.com/**", (r) => r.abort());
    await page.goto(path);
    const problems = [];
    let reachedFooter = false;
    for (let i = 0; i < 160 && !reachedFooter; i++) {
      await page.keyboard.press("Tab");
      await page.waitForTimeout(20);   // "reduce motion" still runs 1 ms transitions; measure after them
      const info = await page.evaluate(() => {
        const el = document.activeElement;
        if (!el || el === document.body) return null;
        const r = el.getBoundingClientRect();
        const ringOn = (node) => {
          if (!node) return false;
          const s = getComputedStyle(node);
          return (s.outlineStyle !== "none" && parseFloat(s.outlineWidth) > 0) || s.boxShadow !== "none";
        };
        // card links draw the ring around the whole card (:has(:focus-visible))
        const ring = ringOn(el) || ringOn(el.closest(".card, .post-row, .post-lead, .format-option, .video-card"));
        const label = (el.getAttribute("aria-label") || el.textContent || el.id || el.tagName).trim().replace(/\s+/g, " ").slice(0, 50);
        return { label, ring, visible: r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth,
          footer: !!el.closest("footer") && !!el.closest(".theme-switch") };
      });
      if (!info) continue;
      if (!info.visible) problems.push(`not on screen: ${info.label}`);
      if (!info.ring) problems.push(`no focus indicator: ${info.label}`);
      reachedFooter = info.footer;
    }
    expect(problems).toEqual([]);
    expect(reachedFooter, "Tab reaches the theme switch in the footer").toBe(true);
  });

  test(`${path}: text spacing (WCAG 1.4.12) cuts nothing off`, async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "one viewport is enough");
    await page.route("https://app.cal.com/**", (r) => r.abort());
    await page.goto(path);
    // what is cut off before and after the wider spacing: only text that gets cut BY the spacing fails
    // (card excerpts are shortened to a few lines by design; the full text is the article itself)
    const cutOff = () => page.evaluate(() => [...document.querySelectorAll("body *")].filter((el) => {
      const s = getComputedStyle(el);
      if (!/hidden|clip/.test(s.overflowX + s.overflowY) || el.closest(".sr-only, .skip-link, .skip-game, canvas, .video-card__media, .reading-progress")) return false;
      if (!el.textContent.trim() || el.getClientRects().length === 0) return false;
      return el.scrollHeight > el.clientHeight + 2 || el.scrollWidth > el.clientWidth + 2;
    }).map((el) => `${el.tagName.toLowerCase()}.${[...el.classList].join(".")}: ${el.textContent.trim().slice(0, 40)}`));
    const before = new Set(await cutOff());
    await page.addStyleTag({ content: "* { line-height: 1.5 !important; letter-spacing: .12em !important; word-spacing: .16em !important; } p { margin-bottom: 2em !important; }" });
    const clipped = (await cutOff()).filter((x) => !before.has(x));
    expect(clipped).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
  });
}
