// muchakova.com — Eleventy configuration
// BG pages live in src/bg/ and are published at the site root (old URLs unchanged);
// EN pages live in src/en/ and are published under /en/. Pages that exist in both
// languages share a `key` in their front matter, which links them for hreflang and
// the language switch.
import { createHash } from "node:crypto";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { eleventyImageTransformPlugin } from "@11ty/eleventy-img";

// Old pages that are not redesigned yet are copied unchanged, so every legacy URL
// keeps working at every step. Remove an entry once its new template exists.
const LEGACY_PASSTHROUGH = [
  "blog.html", "blog", "booking", "vlog", "projects", "partners", "donate", "game", "meet",
  "files", "css", "js", "robots.txt", "llms.txt", "CNAME",
];

// cache-busting version for /assets (changes whenever a source asset changes)
function hashDir(dir) {
  const h = createHash("sha256");
  const walk = (d) => readdirSync(d).sort().forEach((f) => {
    const p = join(d, f);
    statSync(p).isDirectory() ? walk(p) : h.update(readFileSync(p));
  });
  walk(dir);
  return h.digest("hex").slice(0, 10);
}

const DATE_FORMATS = {
  long: { bg: { day: "numeric", month: "long", year: "numeric" }, en: { day: "numeric", month: "long", year: "numeric" } },
  short: { bg: { day: "2-digit", month: "2-digit", year: "numeric" }, en: { day: "numeric", month: "short", year: "numeric" } },
};

export default function (eleventyConfig) {
  // ---------- static files ----------
  for (const p of LEGACY_PASSTHROUGH) eleventyConfig.addPassthroughCopy(p);
  eleventyConfig.addPassthroughCopy({
    "src/images": "images",            // originals stay at /images/… (old pages, OG images)
    "src/assets/js": "assets/js",
    "src/assets/icons.svg": "assets/icons.svg",
    "src/assets/favicon.svg": "favicon.svg",
    "src/assets/css/styleguide.css": "assets/css/styleguide.css",
    "node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2": "assets/fonts/inter-latin.woff2",
    "node_modules/@fontsource-variable/inter/files/inter-cyrillic-wght-normal.woff2": "assets/fonts/inter-cyrillic.woff2",
  });
  eleventyConfig.addWatchTarget("src/assets/css/");
  eleventyConfig.addGlobalData("assetVersion", () => hashDir("src/assets"));

  // ---------- responsive images: every <img> in our templates becomes AVIF/WebP/JPEG <picture> ----------
  eleventyConfig.addPlugin(eleventyImageTransformPlugin, {
    formats: ["avif", "webp", "jpeg"],
    widths: [400, 800, 1200],
    urlPath: "/img/",
    outputDir: "_site/img/",
    defaultAttributes: { loading: "lazy", decoding: "async", sizes: "(min-width: 860px) 440px, 100vw" },
  });

  // ---------- language map: collections.i18nMap[key][lang] = url ----------
  eleventyConfig.addCollection("i18nMap", (api) => {
    const map = {};
    for (const item of api.getAll()) {
      const { key, lang } = item.data;
      if (!key || !lang || !item.url) continue;
      (map[key] ||= {})[lang] = item.url;
    }
    return map;
  });

  // URL of a page in the wanted language; falls back to the BG page, then to the legacy route
  eleventyConfig.addFilter("urlFor", (key, lang, map, routes) =>
    map?.[key]?.[lang] ?? map?.[key]?.bg ?? routes?.[key] ?? "/");

  eleventyConfig.addFilter("date", (value, lang = "bg", style = "long") => {
    const d = value instanceof Date ? value : new Date(`${value}T12:00:00Z`);
    const s = new Intl.DateTimeFormat(lang === "bg" ? "bg-BG" : "en-GB", { ...DATE_FORMATS[style][lang === "bg" ? "bg" : "en"], timeZone: "UTC" }).format(d);
    return s.replace(/\s?г\.$/, ""); // "8 октомври 2026 г." → "8 октомври 2026"
  });
  eleventyConfig.addFilter("isoDate", (value) => (value instanceof Date ? value : new Date(`${value}T12:00:00Z`)).toISOString().slice(0, 10));
  eleventyConfig.addFilter("price", (amount, lang) => (lang === "bg" ? `${amount} €` : `€${amount}`));
  eleventyConfig.addFilter("limit", (arr, n) => (arr || []).slice(0, n));
  eleventyConfig.addFilter("json", (value) => JSON.stringify(value));

  // <svg> icon from the sprite; always decorative
  eleventyConfig.addShortcode("icon", (name, cls = "") =>
    `<svg class="icon${cls ? " " + cls : ""}" aria-hidden="true" focusable="false"><use href="/assets/icons.svg#${name}"/></svg>`);

  // sitemap entries: indexable template pages with their language alternates
  eleventyConfig.addFilter("sitemapPages", (items) =>
    items.filter((i) => i.url && !i.data.noindex && !i.data.eleventyExcludeFromCollections && i.outputPath?.endsWith(".html")));

  eleventyConfig.setNunjucksEnvironmentOptions({ trimBlocks: true, lstripBlocks: true });

  return {
    dir: { input: "src", includes: "_includes", data: "_data", output: "_site" },
    templateFormats: ["njk", "11ty.js"],
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
  };
}
