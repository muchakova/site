// Questions still waiting for an answer (⟨?N⟩).
//  • Visible markers in the built pages (SHOW_PENDING=1 builds) are listed per page; with STRICT_PENDING=1
//    (the publish build) any visible marker fails, so no yellow box ever reaches the live site.
//  • Markers hidden in the published build are still listed from the sources, so none is forgotten.
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { htmlFiles, read, urlOf, isNewPage, report } from "./_lib.mjs";

const visible = new Map();
for (const file of htmlFiles()) {
  const html = read(file);
  if (!isNewPage(html)) continue;
  for (const m of html.matchAll(/data-pending="(\?\d+)"/g)) {
    const list = visible.get(m[1]) || new Set();
    list.add(urlOf(file).replace(/index\.html$/, ""));
    visible.set(m[1], list);
  }
}

// every question referenced in the sources (templates and the i18n data)
const SRC = new URL("../../src/", import.meta.url).pathname;
const walk = (d) => readdirSync(d).flatMap((f) => (statSync(join(d, f)).isDirectory() ? walk(join(d, f)) : /\.(njk|html|json)$/.test(f) ? [join(d, f)] : []));
const open = new Set();
for (const f of walk(SRC)) {
  const text = readFileSync(f, "utf8");
  for (const m of text.matchAll(/\{%\s*pending\s+"(\d+)"/g)) open.add(Number(m[1]));
  for (const m of text.matchAll(/"pending":\s*"q(\d+)"/g)) open.add(Number(m[1]));
}

const byNumber = (a, b) => Number(a[0].slice(1)) - Number(b[0].slice(1));
const shown = [...visible.entries()].sort(byNumber).map(([q, pages]) => `⟨${q}⟩ visible on ${[...pages].join(", ")}`);
const hidden = [...open].filter((n) => !visible.has(`?${n}`)).sort((a, b) => a - b).map((n) => `⟨?${n}⟩ open (hidden on the site; SHOW_PENDING=1 shows it)`);
const strict = process.env.STRICT_PENDING === "1";
report(`open questions (${open.size}, ${visible.size} visible)`, strict ? shown : [], [...(strict ? [] : shown), ...hidden]);
