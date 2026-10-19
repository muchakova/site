// Checks that every external link on the built site still answers (run now and then, not in CI:
// it depends on other people's servers). Broken = the page is gone (404/410), the server fails (5xx)
// or the address does not exist. Refusals of automated requests (403/429/999, e.g. a Cloudflare check
// or a social network) and certificate-chain problems that browsers handle are "could not verify".
//   node tools/check-external-links.mjs
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const SITE = new URL("../_site/", import.meta.url).pathname;
const files = (d) => readdirSync(d).flatMap((f) => (statSync(join(d, f)).isDirectory() ? files(join(d, f)) : f.endsWith(".html") ? [join(d, f)] : []));
const links = new Map();
for (const f of files(SITE)) {
  for (const m of readFileSync(f, "utf8").matchAll(/<a [^>]*href="(https?:\/\/[^"#]+)[^"]*"/g)) {
    const url = m[1].replace(/&amp;/g, "&");
    if (url.startsWith("https://muchakova.com") || /sharer|share-offsite|intent\/post/.test(url)) continue;   // own site, share buttons
    if (!links.has(url)) links.set(url, new Set());
    links.get(url).add("/" + relative(SITE, f));
  }
}
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15";
async function check(url) {
  for (const method of ["HEAD", "GET"]) {
    try {
      const res = await fetch(url, { method, redirect: "follow", headers: { "user-agent": UA, accept: "text/html,*/*" }, signal: AbortSignal.timeout(15000) });
      if (res.ok || method === "GET") return res.status;
    } catch (e) { if (method === "GET") return e.name === "TimeoutError" ? "timeout" : e.cause?.code || e.message; }
  }
}
const results = [];
const queue = [...links.keys()];
await Promise.all(Array.from({ length: 8 }, async () => { while (queue.length) { const u = queue.shift(); results.push([u, await check(u)]); } }));
const ok = (s) => typeof s === "number" && s < 400;
const social = /facebook\.com|linkedin\.com|x\.com|twitter\.com|tiktok\.com|instagram\.com/;   // answer bots with errors
const refused = (u, s) => social.test(u) || [401, 403, 405, 429, 999].includes(s) || /CERT|SIGNATURE|SELF_SIGNED/.test(String(s));
const broken = results.filter(([u, s]) => !ok(s) && !refused(u, s));
const unverified = results.filter(([u, s]) => !ok(s) && refused(u, s));
for (const [u, s] of broken) console.log(`  BROKEN  ${s}  ${u}\n          on ${[...links.get(u)].slice(0, 3).join(", ")}${links.get(u).size > 3 ? " …" : ""}`);
for (const [u, s] of unverified) console.log(`  could not verify (${s})  ${u}`);
console.log(`${broken.length ? "✗" : "✓"} external links: ${results.length} checked, ${broken.length} broken, ${unverified.length} could not be verified`);
process.exitCode = broken.length ? 1 : 0;
