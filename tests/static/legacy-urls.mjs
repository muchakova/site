// Every URL of the pre-redesign site (docs/redesign/legacy-urls.txt) must still be served.
import { readFileSync } from "node:fs";
import { fileFor, read, idsIn, report } from "./_lib.mjs";

const list = readFileSync(new URL("../../docs/redesign/legacy-urls.txt", import.meta.url), "utf8")
  .split("\n").map((l) => l.trim()).filter((l) => l && !l.startsWith("#"));
const errors = [];
for (const url of list) {
  const [path, frag] = url.split("#");
  const file = fileFor(path);
  if (!file) { errors.push(`${url} (not built)`); continue; }
  if (frag && !idsIn(read(file)).has(frag)) errors.push(`${url} (anchor missing)`);
}
report(`legacy URLs (${list.length})`, errors);
