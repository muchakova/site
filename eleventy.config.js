// muchakova.com — Eleventy configuration
// BG pages live in src/bg/ and are published at the site root (old URLs unchanged);
// EN pages live in src/en/ and are published under /en/. Pages that exist in both
// languages share a `key` in their front matter, which links them for hreflang and
// the language switch.
import { createHash } from "node:crypto";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { eleventyImageTransformPlugin } from "@11ty/eleventy-img";
import { plainText as plain, readingMinutes } from "./lib/text.js";
import { structuredData, breadcrumbLd } from "./lib/structured-data.js";
import { ogFor } from "./lib/og.js";

const SITE = JSON.parse(readFileSync("src/_data/site.json", "utf8"));

// Files published as they are: the /meet/ redirect, downloadable files, the domain.
// (robots.txt and llms.txt are generated: src/robots.njk, src/llms.njk)
const STATIC_FILES = ["meet", "files", "CNAME"];

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
  for (const p of STATIC_FILES) eleventyConfig.addPassthroughCopy(p);
  eleventyConfig.addPassthroughCopy({
    "src/images": "images",            // originals stay at /images/… (old pages, OG images)
    "src/assets/js": "assets/js",
    "src/assets/icons.svg": "assets/icons.svg",
    "src/assets/favicon.svg": "favicon.svg",
    "src/assets/icons/favicon.ico": "favicon.ico",
    "src/assets/icons/apple-touch-icon.png": "apple-touch-icon.png",
    "src/assets/icons/icon-192.png": "icon-192.png",
    "src/assets/icons/icon-512.png": "icon-512.png",
    "src/assets/site.webmanifest": "site.webmanifest",
    "src/assets/css/styleguide.css": "assets/css/styleguide.css",
    "src/assets/css/game.css": "assets/css/game.css",
    "src/images/og-game.png": "game/og-game.png",   // the game's share image keeps its old URL
    "src/assets/fonts": "assets/fonts",   // Inter with cv05/cv08 (tools/fonts.mjs)
    // the game's display and typewriter fonts (only /game/ loads them)
    "node_modules/@fontsource/russo-one/files/russo-one-latin-400-normal.woff2": "assets/fonts/russo-one-latin.woff2",
    "node_modules/@fontsource/russo-one/files/russo-one-cyrillic-400-normal.woff2": "assets/fonts/russo-one-cyrillic.woff2",
    "node_modules/@fontsource/pt-mono/files/pt-mono-latin-400-normal.woff2": "assets/fonts/pt-mono-latin.woff2",
    "node_modules/@fontsource/pt-mono/files/pt-mono-cyrillic-400-normal.woff2": "assets/fonts/pt-mono-cyrillic.woff2",
  });
  eleventyConfig.addWatchTarget("src/assets/css/");
  eleventyConfig.addGlobalData("assetVersion", () => hashDir("src/assets"));
  // SITE_PREVIEW=1: a build for testers — not indexed by search engines, no visitor statistics
  eleventyConfig.addGlobalData("preview", process.env.SITE_PREVIEW === "1");

  // ---------- responsive images: every <img> in our templates becomes AVIF/WebP/JPEG <picture> ----------
  eleventyConfig.addPlugin(eleventyImageTransformPlugin, {
    formats: ["avif", "webp", "jpeg"],
    widths: [400, 800, 1200],
    urlPath: "/img/",
    outputDir: "_site/img/",
    defaultAttributes: { loading: "lazy", decoding: "async", sizes: "(min-width: 860px) 440px, 100vw" },
  });

  // ---------- structured data: page graph (filter, in base.njk) + breadcrumbs from the visible breadcrumb ----------
  eleventyConfig.addFilter("structuredData", structuredData);
  eleventyConfig.addFilter("ogFor", ogFor);
  eleventyConfig.addTransform("breadcrumb-ld", function (content) {
    return this.page.outputPath?.endsWith(".html") ? breadcrumbLd(content, SITE.url) : content;
  });

  // ---------- post list: one entry per article with both languages, built from the post files ----------
  // Used by the home page, the blog, services, related posts and the feeds. Newest first;
  // posts published on the same day are ordered by `order` (higher first).
  eleventyConfig.addCollection("postIndex", (api) => {
    const byKey = new Map();
    for (const item of api.getFilteredByTag("posts")) {
      const { key, lang } = item.data;
      if (!byKey.has(key)) byKey.set(key, { key, urls: {}, title: {}, tag: {}, excerpt: {}, minutes: {} });
      const p = byKey.get(key);
      p.urls[lang] = item.url;
      p.title[lang] = item.data.title;
      p.tag[lang] = item.data.tag;
      p.excerpt[lang] = item.data.excerpt || item.data.description;
      p.minutes[lang] = item.data.minutes;
      if (lang === "bg") {
        Object.assign(p, { url: item.url, date: item.date.toISOString().slice(0, 10), cats: item.data.cats || [], order: item.data.order || 0, topics: item.data.topics });
      }
    }
    return [...byKey.values()].filter((p) => p.url)
      .sort((a, b) => b.date.localeCompare(a.date) || b.order - a.order);
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
  eleventyConfig.addFilter("rfc822", (value) => new Date(`${value}T12:00:00Z`).toUTCString());   // RSS dates
  eleventyConfig.addFilter("isoDate", (value) => (value instanceof Date ? value : new Date(`${value}T12:00:00Z`)).toISOString().slice(0, 10));
  eleventyConfig.addFilter("price", (amount, lang) => (lang === "bg" ? `${amount} €` : `€${amount}`));
  eleventyConfig.addFilter("limit", (arr, n) => (arr || []).slice(0, n));
  // pick posts by URL, keeping the given order (curated "related articles")
  eleventyConfig.addFilter("postsByUrl", (urls, posts) => (urls || []).map((u) => posts.find((p) => p.url === u)).filter(Boolean));
  eleventyConfig.addFilter("json", (value) => JSON.stringify(value));

  // ---------- posts ----------
  eleventyConfig.addFilter("readingTime", readingMinutes);
  // table of contents from the <h2 id> headings of a post body
  // (`label` keeps <span lang="…"> so foreign terms in a heading are still pronounced right in the contents)
  eleventyConfig.addFilter("toc", (html) => [...String(html).matchAll(/<h2[^>]*\sid="([^"]+)"[^>]*>([\s\S]*?)<\/h2>/g)]
    .map((m) => ({
      id: m[1],
      text: plain(m[2]).replace(/\s+/g, " ").trim(),
      label: m[2]
        .replace(/<span[^>]*\slang="([^"]+)"[^>]*>([^<]*)<\/span>/g, "\u0001$1\u0002$2\u0003")   // park language marks
        .replace(/<[^>]+>/g, " ")                                                            // drop every other tag
        .replace(/\u0001([^\u0002]+)\u0002([^\u0003]*)\u0003/g, '<span lang="$1">$2</span>')
        .replace(/\s+/g, " ").trim(),
    })));
  // links point to the page in the reader's language when it exists
  function localUrl(path, lang, map) {
    if (lang === "bg" || !map) return null;
    const byUrl = {};
    for (const [key, urls] of Object.entries(map)) if (urls.bg) byUrl[urls.bg] = key;
    const key = byUrl[path] || (path.startsWith("/blog/") ? "post-" + path.slice(6).replace(/\.html$/, "") : null);
    return (key && map[key]?.[lang]) || null;
  }
  eleventyConfig.addFilter("localizeLinks", (html, lang, map) => String(html).replace(/href="(\/[^"#?]*)([^"]*)"/g,
    (all, path, rest) => { const t = localUrl(path, lang, map); return t ? `href="${t}${rest}"` : all; }));
  eleventyConfig.addFilter("localizeLinkUrl", (url, lang, map) => {
    const [path, rest = ""] = String(url).split(/(?=[#?])/);
    return (localUrl(path, lang, map) || path) + rest;
  });
  // schema.org ItemList of VideoObject for the videos page
  eleventyConfig.addFilter("videoListLd", (videos, lang, siteUrl) => JSON.stringify({
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: videos.map((v, i) => ({
      "@type": "ListItem", position: i + 1, url: `${siteUrl}${lang === "en" ? "/en" : ""}/vlog/#${v.id}`,
      item: { "@type": "VideoObject", name: v.title[lang], description: v.answer[lang],
        thumbnailUrl: `https://i.ytimg.com/vi/${v.yt}/hqdefault.jpg`, uploadDate: v.uploadDate, duration: v.isoDuration,
        embedUrl: `https://www.youtube-nocookie.com/embed/${v.yt}`, contentUrl: `https://www.youtube.com/watch?v=${v.yt}`, inLanguage: "bg" },
    })),
  }).replace(/</g, "\\u003c"));
  // URL of a listed post in the reader's language (falls back to the BG article)
  eleventyConfig.addFilter("postUrl", (post, lang) => post.urls?.[lang] ?? post.url);
  // related posts: most shared categories first, then newest
  eleventyConfig.addFilter("relatedPosts", (posts, url, cats, n = 3) => (posts || [])
    .filter((p) => p.url !== url)
    .map((p) => ({ p, score: p.cats.filter((c) => (cats || []).includes(c)).length }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || b.p.date.localeCompare(a.p.date))
    .slice(0, n).map((x) => x.p));
  eleventyConfig.addFilter("encodeUri", (s) => encodeURIComponent(s));

  // <svg> icon from the sprite; always decorative
  eleventyConfig.addShortcode("icon", (name, cls = "") =>
    `<svg class="icon${cls ? " " + cls : ""}" aria-hidden="true" focusable="false"><use href="/assets/icons.svg#${name}"/></svg>`);

  // Placeholder for an answer we are still waiting for (questions ⟨?N⟩ in docs/redesign).
  // Hidden by default (the published site leaves them out, and blocks that would be empty are skipped);
  // SHOW_PENDING=1 npm start shows them as yellow boxes. tests/static/pending.mjs lists them either way.
  const SHOW_PENDING = process.env.SHOW_PENDING === "1";
  eleventyConfig.addGlobalData("showPending", SHOW_PENDING);
  eleventyConfig.addShortcode("pending", (n, label, block = false) => (SHOW_PENDING
    ? `<span class="pending${block ? " pending--block" : ""}" data-pending="?${n}"><strong>⟨?${n}⟩</strong> ${label}</span>` : ""));

  // sitemap entries: indexable template pages with their language alternates
  eleventyConfig.addFilter("sitemapPages", (items) =>
    items.filter((i) => i.url && !i.data.noindex && !i.data.eleventyExcludeFromCollections && i.outputPath?.endsWith(".html")));

  eleventyConfig.setNunjucksEnvironmentOptions({ trimBlocks: true, lstripBlocks: true });

  return {
    dir: { input: "src", includes: "_includes", data: "_data", output: "_site" },
    templateFormats: ["njk", "html", "11ty.js"],
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
  };
}
