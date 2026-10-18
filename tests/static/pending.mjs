// Lists every placeholder that still waits for an answer (⟨?N⟩).
// Warns during the redesign; with STRICT_PENDING=1 (the launch build) any placeholder fails.
import { htmlFiles, read, urlOf, isNewPage, report } from "./_lib.mjs";

const found = new Map();
for (const file of htmlFiles()) {
  const html = read(file);
  if (!isNewPage(html)) continue;
  for (const m of html.matchAll(/data-pending="(\?\d+)"/g)) {
    const list = found.get(m[1]) || new Set();
    list.add(urlOf(file).replace(/index\.html$/, ""));
    found.set(m[1], list);
  }
}
const lines = [...found.entries()].sort((a, b) => Number(a[0].slice(1)) - Number(b[0].slice(1)))
  .map(([q, pages]) => `⟨${q}⟩ on ${[...pages].join(", ")}`);
const strict = process.env.STRICT_PENDING === "1";
report(`pending answers (${found.size} question(s))`, strict ? lines : [], strict ? [] : lines);
