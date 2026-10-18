// Every internal link, image, script and #anchor on the new pages must resolve.
// Legacy pages (copied unchanged) are checked too, but their problems are warnings.
import { htmlFiles, read, urlOf, isNewPage, fileFor, idsIn, resolveHref, report } from "./_lib.mjs";

const errors = [], warnings = [];
const idCache = new Map();
const ids = (file) => idCache.get(file) ?? idCache.set(file, idsIn(read(file))).get(file);
const SKIP = /^(https?:|mailto:|tel:|viber:|data:|javascript:|\/\/)/i;

for (const file of htmlFiles()) {
  const html = read(file), url = urlOf(file), isNew = isNewPage(html);
  const refs = [...html.matchAll(/\s(?:href|src)="([^"]+)"/g)].map((m) => m[1])
    .concat([...html.matchAll(/\ssrcset="([^"]+)"/g)].flatMap((m) => m[1].split(",").map((s) => s.trim().split(/\s+/)[0])));
  for (const raw of refs) {
    const ref = raw.replace(/&amp;/g, "&");
    if (!ref || SKIP.test(ref) || ref.startsWith("{{")) continue;
    const [path, frag] = ref.split("#");
    const target = path ? fileFor(resolveHref(url, path)) : file;
    const bucket = isNew ? errors : warnings;
    if (!target) { bucket.push(`${url} → ${ref} (missing)`); continue; }
    if (frag && target.endsWith(".html") && isNewPage(read(target)) && !ids(target).has(decodeURIComponent(frag)))
      bucket.push(`${url} → ${ref} (no id="${frag}")`);
  }
}
report("links", errors, warnings);
