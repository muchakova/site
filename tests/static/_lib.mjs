// Small helpers shared by the static checks (no dependencies).
import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join, relative, dirname, posix } from "node:path";

export const SITE = new URL("../../_site/", import.meta.url).pathname;

export function htmlFiles(dir = SITE) {
  const out = [];
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) out.push(...htmlFiles(p));
    else if (f.endsWith(".html")) out.push(p);
  }
  return out;
}

export const urlOf = (file) => "/" + relative(SITE, file).split("\\").join("/");
export const read = (file) => readFileSync(file, "utf8");
// pages built from our templates carry the new header; legacy copies do not
export const isNewPage = (html) => html.includes('class="site-header"');

// map a site URL path to the file GitHub Pages would serve
export function fileFor(pathname) {
  let p = decodeURIComponent(pathname.split("#")[0].split("?")[0]);
  if (p.endsWith("/")) p += "index.html";
  const direct = join(SITE, p);
  if (existsSync(direct) && statSync(direct).isFile()) return direct;
  if (existsSync(direct + ".html")) return direct + ".html";
  if (existsSync(join(direct, "index.html"))) return join(direct, "index.html");
  return null;
}

export const idsIn = (html) => new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));

export function resolveHref(fromUrl, href) {
  if (href.startsWith("/")) return href;
  return posix.normalize(posix.join(posix.dirname(fromUrl), href));
}

export function report(name, errors, warnings = []) {
  for (const w of warnings) console.log(`  warn  ${w}`);
  for (const e of errors) console.log(`  FAIL  ${e}`);
  console.log(`${errors.length ? "✗" : "✓"} ${name}: ${errors.length} error(s)${warnings.length ? `, ${warnings.length} warning(s)` : ""}`);
  if (errors.length) process.exitCode = 1;
}
