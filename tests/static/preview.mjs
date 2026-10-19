// The test version (SITE_PREVIEW=1 build, published in /new/): kept out of search engines and statistics.
// Run by tools/publish-new.sh on the folder it is about to publish (SITE_DIR=…).
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { SITE, htmlFiles, read, urlOf, isNewPage, report } from "./_lib.mjs";

const errors = [];
let pages = 0;
for (const file of htmlFiles()) {
  const html = read(file);
  if (!isNewPage(html)) continue;
  pages++;
  if (!html.includes('<meta name="robots" content="noindex, nofollow">')) errors.push(`${urlOf(file)}: not marked noindex, nofollow`);
  if (html.includes("plausible.io")) errors.push(`${urlOf(file)}: loads the visitor statistics`);
}
const robots = join(SITE, "robots.txt");
if (existsSync(robots) && !/Disallow:\s*\/\s*$/m.test(readFileSync(robots, "utf8"))) errors.push("robots.txt does not disallow crawling");
report(`test version (${pages} pages)`, errors);
