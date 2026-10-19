// Search basics for every indexed page: a canonical URL, a title of at most 70 characters and a
// description of 70–160 characters, both unique across the site; every indexed page is in sitemap.xml.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { htmlFiles, read, urlOf, isNewPage, report, SITE } from "./_lib.mjs";

const site = "https://muchakova.com";
const decode = (s) => s.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
const sitemap = readFileSync(join(SITE, "sitemap.xml"), "utf8");
const errors = [], titles = new Map(), descriptions = new Map();
let pages = 0;
for (const file of htmlFiles()) {
  const html = read(file);
  if (!isNewPage(html) || html.includes('name="robots" content="noindex')) continue;
  pages++;
  const url = urlOf(file).replace(/index\.html$/, "");
  const title = decode(html.match(/<title>([^<]*)<\/title>/)?.[1] || "");
  const description = decode(html.match(/<meta name="description" content="([^"]*)"/)?.[1] || "");
  if (title.length > 70) errors.push(`${url}: title is ${title.length} characters`);
  if (description.length < 70 || description.length > 160) errors.push(`${url}: description is ${description.length} characters`);
  if (!html.includes(`<link rel="canonical" href="${site}${url}">`)) errors.push(`${url}: canonical missing or wrong`);
  if (!sitemap.includes(`<loc>${site}${url}</loc>`)) errors.push(`${url}: not in sitemap.xml`);
  titles.set(title, [...(titles.get(title) || []), url]);
  descriptions.set(description, [...(descriptions.get(description) || []), url]);
}
for (const [t, urls] of titles) if (urls.length > 1) errors.push(`same title on ${urls.join(", ")}: ${t}`);
for (const [d, urls] of descriptions) if (urls.length > 1) errors.push(`same description on ${urls.join(", ")}: ${d.slice(0, 60)}…`);
report(`SEO basics (${pages} indexed pages)`, errors);
