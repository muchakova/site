// Crawls a published copy of the site from a start folder (e.g. https://muchakova.com/new/ or a local
// test server) and reports every internal URL that does not answer 200 or that leads OUT of the folder.
// Followed: relative and root-absolute URLs in HTML attributes (href, src, srcset, use href, …), CSS url()
// and @import, and the web manifest (start_url, icons). Absolute https:// URLs are metadata or external
// links and are not followed (the site's metadata points at https://muchakova.com on purpose).
//   node tools/crawl.mjs <start URL ending in "/">
import { collectUrls } from "../lib/relative-urls.js";

const SKIP = /^(mailto:|tel:|data:|javascript:|#)/i;

export async function crawl(start, { concurrency = 8 } = {}) {
  const base = new URL(start);
  if (!base.pathname.endsWith("/")) base.pathname += "/";
  const seen = new Set(), problems = [], queue = [[base.href, "(start)"]];
  const inside = (u) => u.origin === base.origin && u.pathname.startsWith(base.pathname);

  function add(raw, from) {
    if (!raw || SKIP.test(raw) || /^[a-z][a-z0-9+.-]*:/i.test(raw) || raw.startsWith("//")) return;   // absolute: not followed
    const url = new URL(raw, from);
    url.hash = "";
    if (!inside(url)) { problems.push(`leaves the folder: ${raw} → ${url.pathname} (on ${from})`); return; }
    if (!seen.has(url.href)) { seen.add(url.href); queue.push([url.href, from]); }
  }

  async function visit([href, from]) {
    let res;
    try { res = await fetch(href, { redirect: "follow" }); } catch (e) { problems.push(`${e.message}: ${href} (from ${from})`); return; }
    const finalUrl = new URL(res.url);
    if (res.status !== 200) { problems.push(`${res.status}: ${href} (from ${from})`); return; }
    if (!inside(finalUrl)) { problems.push(`redirect out of the folder: ${href} → ${res.url} (from ${from})`); return; }
    const type = res.headers.get("content-type") || "";
    if (type.includes("text/html")) {
      for (const { url } of collectUrls(await res.text())) add(url, res.url);
    } else if (type.includes("text/css")) {
      const css = await res.text();
      for (const m of css.matchAll(/url\(\s*['"]?([^'")]+)['"]?\s*\)|@import\s+['"]([^'"]+)['"]/g)) add(m[1] || m[2], res.url);
    } else if (/manifest|\.webmanifest$/.test(type + finalUrl.pathname)) {
      const m = JSON.parse(await res.text());
      add(m.start_url, res.url);
      for (const icon of m.icons || []) add(icon.src, res.url);
    } else {
      await res.arrayBuffer();
    }
  }

  seen.add(base.href);
  while (queue.length) await Promise.all(queue.splice(0, concurrency).map(visit));
  return { checked: seen.size, problems };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const start = process.argv[2];
  if (!start) { console.error("usage: node tools/crawl.mjs <start URL ending in />"); process.exit(2); }
  const { checked, problems } = await crawl(start);
  for (const p of problems) console.log(`  FAIL  ${p}`);
  console.log(`${problems.length ? "✗" : "✓"} crawl of ${start}: ${checked} URLs checked, ${problems.length} problem(s)`);
  process.exitCode = problems.length ? 1 : 0;
}
