// Share images (Open Graph, 1200×630) for every indexable page that has no image of its own.
// Reads the built site (_site), renders a card in the site's colours and font with Playwright,
// and saves src/images/og/<page>.jpg. The build then uses it for og:image automatically.
//
//   npm run og            → only pages that have no image yet (e.g. a new article)
//   npm run og -- --all   → all of them again (after a title or design change)
import { chromium } from "@playwright/test";
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { ogName } from "../lib/og.js";

const ROOT = new URL("..", import.meta.url).pathname;
const SITE = join(ROOT, "_site");
const OUT = join(ROOT, "src/images/og");
const all = process.argv.includes("--all");


const dataUrl = (file, type) => `data:${type};base64,${readFileSync(join(ROOT, file)).toString("base64")}`;
const FONTS = `
  @font-face { font-family: Inter; font-weight: 100 900; src: url(${dataUrl("node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2", "font/woff2")}) format("woff2"); unicode-range: U+0000-00FF, U+2000-206F, U+20AC; }
  @font-face { font-family: Inter; font-weight: 100 900; src: url(${dataUrl("node_modules/@fontsource-variable/inter/files/inter-cyrillic-wght-normal.woff2", "font/woff2")}) format("woff2"); unicode-range: U+0400-045F, U+0490-0491, U+2116; }`;
const PHOTO = dataUrl("src/images/profile_9.jpg", "image/jpeg");
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");

// Navy card with soft glows; text on the left, the portrait on the right (nothing over the face).
const card = ({ brand, eyebrow, title, subtitle, foot }) => `<!doctype html><html><head><meta charset="utf-8"><style>${FONTS}
  * { box-sizing: border-box; margin: 0; }
  body { width: 1200px; height: 630px; overflow: hidden; font-family: Inter, sans-serif; color: #EEF1FF;
    background: radial-gradient(60% 80% at 0% 0%, #6366F140, transparent 70%), radial-gradient(50% 70% at 45% 110%, #10B98130, transparent 70%), #0E1838; }
  .text { position: absolute; left: 72px; top: 64px; bottom: 60px; width: 640px; display: flex; flex-direction: column; }
  .brand { display: flex; align-items: center; gap: 14px; margin-bottom: 32px; font-size: 24px; font-weight: 600; color: #EEF1FF; }
  .brand .role { color: #B4BCE0; font-weight: 500; }
  .mark { display: grid; place-items: center; width: 48px; height: 48px; border-radius: 12px; background: #EEF1FF; color: #0E1838; font-weight: 800; font-size: 19px; letter-spacing: -.02em; }
  .eyebrow { margin-top: auto; align-self: flex-start; padding: 8px 18px; border-radius: 999px; background: #A5B4FC24; color: #C7D0FF; font-size: 22px; font-weight: 600; }
  h1 { margin-top: 22px; font-size: 60px; line-height: 1.12; font-weight: 650; letter-spacing: -.02em; text-wrap: balance; }
  .sub { margin-top: 18px; font-size: 26px; line-height: 1.4; color: #B4BCE0; }
  .foot { margin-top: 30px; font-size: 22px; font-weight: 600; color: #A5B4FC; }
  .photo { position: absolute; right: 0; top: 0; width: 400px; height: 630px; object-fit: cover; object-position: 58% 22%; }
  .edge { position: absolute; right: 400px; top: 0; width: 6px; height: 630px; background: #6366F1; }
</style></head><body>
  <div class="text">
    <div class="brand"><span class="mark">MM</span>${esc(brand.name)}<span class="role">· ${esc(brand.role)}</span></div>
    ${eyebrow ? `<div class="eyebrow">${esc(eyebrow)}</div>` : '<div style="margin-top:auto"></div>'}
    <h1>${esc(title)}</h1>
    ${subtitle ? `<p class="sub">${esc(subtitle)}</p>` : ""}
    <div class="foot">muchakova.com</div>
  </div>
  <img class="photo" src="${PHOTO}" alt="">
  <div class="edge"></div>
</body></html>`;

function pages(dir = SITE) {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? pages(p) : f.endsWith(".html") ? [p] : [];
  });
}
const meta = (html, prop) => html.match(new RegExp(`<meta (?:property|name)="${prop}" content="([^"]*)"`))?.[1];
const decode = (s = "") => s.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">");

const i18n = { bg: JSON.parse(readFileSync(join(ROOT, "src/_data/i18n/bg.json"))), en: JSON.parse(readFileSync(join(ROOT, "src/_data/i18n/en.json"))) };
const site = JSON.parse(readFileSync(join(ROOT, "src/_data/site.json")));

const jobs = [];
for (const file of pages()) {
  const html = readFileSync(file, "utf8");
  if (!html.includes('class="site-header"') || html.includes('name="robots" content="noindex')) continue;
  const url = "/" + relative(SITE, file).replace(/index\.html$/, "");
  const image = meta(html, "og:image") || "";
  const own = !image.includes("/images/og/") && !image.endsWith("/images/og-site.jpg");
  if (own) continue;  // the page has its own picture (article cover, the game)
  const lang = html.match(/<html lang="(\w+)"/)[1];
  const T = i18n[lang];
  const isPost = /\/blog\/[^/]+\.html$/.test(url);
  const isHome = url === "/" || url === "/en/";
  const h1 = decode(html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim());
  const tag = decode(html.match(/<p class="post-header__tag"><span class="chip">([^<]*)</)?.[1]);
  const lead = decode(html.match(/<p class="lead[^"]*">([\s\S]*?)<\/p>/)?.[1].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim());
  const crumb = decode(html.match(/<nav class="breadcrumb"[\s\S]*?aria-current="page">([^<]*)</)?.[1]);
  const price = (m) => (lang === "bg" ? `${site.prices[m]} €` : `€${site.prices[m]}`);
  const short = (s, n = 150) => (!s || s.length <= n ? s : s.slice(0, s.lastIndexOf(" ", n)) + "…");
  const job = { url, name: ogName(url), brand: { name: T.site.name, role: T.site.role } };
  if (isHome) Object.assign(job, { brand: { name: "muchakova.com", role: lang === "bg" ? "Онлайн консултации" : "Online consultations" },
    eyebrow: T.site.role, title: T.site.name, subtitle: T.site.tagline.replace(/^[^.]+\.\s*/, "") });
  else if (isPost) Object.assign(job, { eyebrow: `${T.nav.blog} · ${tag}`, title: h1 });
  else if (url.endsWith("/booking/")) Object.assign(job, { eyebrow: T.site.role, title: h1, subtitle: ["30", "60"].map((m) => `${T.home.plans[m].duration} · ${price(m)}`).join("  ·  ") });
  else Object.assign(job, { eyebrow: crumb && crumb !== h1 ? crumb : null, title: h1, subtitle: short(lead) });
  job.foot = "muchakova.com";
  if (all || !existsSync(join(OUT, `${job.name}.jpg`))) jobs.push(job);
}

mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch(process.env.CI ? {} : { channel: "chrome" });
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
for (const job of jobs) {
  await page.setContent(card(job), { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  // long titles: shrink until the text fits above the footer
  await page.evaluate(() => {
    const h1 = document.querySelector("h1"), box = document.querySelector(".text");
    let size = 60;
    while (box.scrollHeight > box.clientHeight && size > 34) { size -= 2; h1.style.fontSize = size + "px"; }
  });
  await page.screenshot({ path: join(OUT, `${job.name}.jpg`), type: "jpeg", quality: 82 });
  console.log("og", job.name);
}
await browser.close();
console.log(`${jobs.length} share image(s) written to src/images/og/`);
