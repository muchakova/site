// One build for any folder: proves the built site works when published in a folder (e.g. /new/).
//  • no HTML page (except 404.html) uses a root-absolute URL in an attribute;
//  • every relative URL, resolved from inside a folder, stays in that folder and finds its file;
//  • CSS, the web manifest and the scripts use no root-absolute paths;
//  • nothing GitHub Pages' Jekyll would skip or transform (names starting with _ . # ~, Markdown, front matter).
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, extname } from "node:path";
import { collectUrls } from "../../lib/relative-urls.js";
import { SITE, htmlFiles, read, urlOf, fileFor, report } from "./_lib.mjs";

const errors = [];
const MOUNT = "https://mount.invalid/x/y/";
const external = (u) => /^([a-z][a-z0-9+.-]*:|\/\/|#)/i.test(u);
const rootAbsolute = (u) => u.startsWith("/") && !u.startsWith("//");

let pages = 0;
for (const file of htmlFiles()) {
  const page = urlOf(file);
  if (page === "/404.html") {
    if (!read(file).includes('href="/assets/css/site.css')) errors.push("404.html: expected root URLs (GitHub Pages serves it at any depth)");
    continue;
  }
  pages++;
  for (const { tag, attr, url } of collectUrls(read(file))) {
    if (rootAbsolute(url)) { errors.push(`${page}: root-absolute ${tag}[${attr}] ${url}`); continue; }
    if (external(url)) continue;
    const resolved = new URL(url, MOUNT + page.slice(1));
    if (!resolved.pathname.startsWith("/x/y/")) { errors.push(`${page}: ${url} leaves the folder`); continue; }
    if (!fileFor(resolved.pathname.slice("/x/y".length))) errors.push(`${page}: ${url} → missing ${resolved.pathname.slice(4)}`);
  }
}

function walk(dir) {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? [p + "/", ...walk(p)] : [p];
  });
}
const TEXT = new Set([".html", ".css", ".js", ".xml", ".txt", ".json", ".webmanifest", ".svg"]);
for (const p of walk(SITE)) {
  const rel = relative(SITE, p);
  const name = rel.replace(/\/$/, "").split("/").pop();
  if (/^[_.#~]|~$/.test(name)) errors.push(`${rel}: GitHub Pages (Jekyll) would skip a name starting with ${name[0]}`);
  if (/\.(md|markdown)$/i.test(name)) errors.push(`${rel}: Jekyll renders Markdown files`);
  if (p.endsWith("/") || !TEXT.has(extname(p))) continue;
  const text = readFileSync(p, "utf8");
  if (text.startsWith("---")) errors.push(`${rel}: starts with "---" (Jekyll front matter)`);
  if (extname(p) === ".css" && /url\(\s*['"]?\/(?!\/)|@import\s+['"]\/(?!\/)/.test(text)) errors.push(`${rel}: root-absolute url() in CSS`);
  if (extname(p) === ".webmanifest") {
    const m = JSON.parse(text);
    for (const u of [m.start_url, m.scope, ...(m.icons || []).map((i) => i.src)]) if (u && rootAbsolute(u)) errors.push(`${rel}: root-absolute ${u}`);
  }
  if (extname(p) === ".js" && /['"`]\/(assets|images|img|files|en|blog|booking|services|about|contact|vlog|projects|partners|donate|game|privacy|accessibility|meet)\b/.test(text)) {
    errors.push(`${rel}: a root-absolute path in a script`);
  }
}
report(`relocatable build (${pages} pages)`, errors);
