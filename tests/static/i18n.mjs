// Bilingual integrity: same translation keys in bg/en, every new page has its
// counterpart with reciprocal hreflang, <html lang> matches the URL, and no
// Bulgarian text leaks into English pages.
import { readFileSync } from "node:fs";
import { htmlFiles, read, urlOf, isNewPage, fileFor, report } from "./_lib.mjs";

const errors = [];
const load = (l) => JSON.parse(readFileSync(new URL(`../../src/_data/i18n/${l}.json`, import.meta.url), "utf8"));
function shape(o, prefix = "") {
  if (Array.isArray(o)) return [`${prefix}[${o.length}]`, ...o.flatMap((v, i) => shape(v, `${prefix}[${i}]`))];
  if (o && typeof o === "object") return Object.keys(o).flatMap((k) => shape(o[k], prefix ? `${prefix}.${k}` : k));
  return [prefix];
}
const bg = new Set(shape(load("bg"))), en = new Set(shape(load("en")));
for (const k of bg) if (!en.has(k)) errors.push(`i18n key missing in en.json: ${k}`);
for (const k of en) if (!bg.has(k)) errors.push(`i18n key missing in bg.json: ${k}`);

const site = "https://muchakova.com";
let pages = 0;
for (const file of htmlFiles()) {
  const html = read(file);
  if (!isNewPage(html)) continue;
  pages++;
  const url = urlOf(file).replace(/index\.html$/, "");
  const lang = html.match(/<html lang="([^"]+)"/)?.[1];
  const expected = url.startsWith("/en/") ? "en" : "bg";
  if (lang !== expected) errors.push(`${url}: <html lang="${lang}">, expected "${expected}"`);
  if (html.includes('name="mm:i18n" content="bg-only"')) continue;
  const alt = Object.fromEntries([...html.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)">/g)].map((m) => [m[1], m[2]]));
  if (!alt.bg || !alt.en || !alt["x-default"]) { errors.push(`${url}: missing hreflang bg/en/x-default`); continue; }
  if (alt[expected] !== site + url) errors.push(`${url}: hreflang ${expected} points to ${alt[expected]}`);
  const other = expected === "bg" ? "en" : "bg";
  const otherFile = fileFor(alt[other].replace(site, ""));
  if (!otherFile) { errors.push(`${url}: counterpart ${alt[other]} not built`); continue; }
  const back = read(otherFile).match(new RegExp(`hreflang="${expected}" href="([^"]+)"`))?.[1];
  if (back !== site + url) errors.push(`${url}: counterpart does not link back (got ${back})`);
  if (expected === "en") {
    const text = html.replace(/<(script|style)[\s\S]*?<\/\1>/g, "")
      .replace(/<([a-z]+)[^>]*\slang="bg"[^>]*>[\s\S]*?<\/\1>/g, "")
      .replace(/<[^>]+>/g, " ");
    const cyr = text.match(/[\u0400-\u04FF][\u0400-\u04FF\s.,„“-]{2,}/g);
    if (cyr) errors.push(`${url}: Bulgarian text on an English page: ${[...new Set(cyr)].slice(0, 3).join(" | ")}`);
  }
}
report(`i18n (${pages} pages)`, errors);
