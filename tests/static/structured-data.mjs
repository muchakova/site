// Structured data (JSON-LD) and share images: valid JSON on every page; every og:image exists (pages that
// are indexed have their own, see `npm run og`); breadcrumbs wherever a breadcrumb is shown;
// the expected entities on key pages; complete BlogPosting data on every article.
import { readFileSync } from "node:fs";
import { htmlFiles, read, urlOf, isNewPage, fileFor, report } from "./_lib.mjs";

const site = JSON.parse(readFileSync(new URL("../../src/_data/site.json", import.meta.url), "utf8"));
const errors = [];
const EXPECT = { "/": ["WebSite", "Person", "ProfessionalService"], "/about/": ["AboutPage", "Person"], "/services/": ["ProfessionalService"],
  "/booking/": ["ProfessionalService"], "/contact/": ["ContactPage", "ProfessionalService"], "/blog.html": ["Blog"] };
let pages = 0;
for (const file of htmlFiles()) {
  const html = read(file);
  if (!isNewPage(html)) continue;
  pages++;
  const url = urlOf(file).replace(/index\.html$/, "");
  const nodes = [];
  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try { const d = JSON.parse(m[1]); nodes.push(...(d["@graph"] || [d])); }
    catch (e) { errors.push(`${url}: invalid JSON-LD (${e.message})`); }
  }
  const types = nodes.map((n) => n["@type"]);
  const og = html.match(/<meta property="og:image" content="([^"]+)"/)?.[1] || "";
  if (!fileFor(og.replace(site.url, ""))) errors.push(`${url}: share image ${og} not built`);
  if (!html.includes('name="robots" content="noindex') && og.endsWith("/images/og-site.jpg")) errors.push(`${url}: no share image of its own — run \`npm run og\``);
  if (html.includes('class="breadcrumb"') && !types.includes("BreadcrumbList")) errors.push(`${url}: breadcrumb shown but no BreadcrumbList`);
  const base = url.replace(/^\/en\//, "/");
  for (const t of EXPECT[base] || []) if (!types.includes(t)) errors.push(`${url}: missing ${t}`);
  for (const offer of nodes.flatMap((n) => n.makesOffer || [])) {
    if (!Object.values(site.prices).map(String).includes(offer.price)) errors.push(`${url}: offer price ${offer.price} is not in site.json`);
  }
  if (/\/blog\/[^/]+\.html$/.test(url)) {
    const post = nodes.find((n) => n["@type"] === "BlogPosting");
    if (!post) { errors.push(`${url}: no BlogPosting`); continue; }
    for (const k of ["headline", "description", "datePublished", "dateModified", "author", "image", "inLanguage"]) if (!post[k]) errors.push(`${url}: BlogPosting without ${k}`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(post.datePublished || "")) errors.push(`${url}: datePublished ${post.datePublished}`);
    for (const img of post.image || []) if (!fileFor(img.replace(site.url, ""))) errors.push(`${url}: image ${img} not built`);
  }
}
report(`structured data and share images (${pages} pages)`, errors);
