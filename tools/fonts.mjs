// Inter for the site, from the official release (npm inter-ui): only the Latin and Cyrillic letters the site
// needs, with ALL OpenType features kept — the site turns on cv05 (l with a tail) and cv08 (I with serifs),
// so l / I / 1 never look alike. The optical-size axis is fixed at text size; weight stays variable
// within the range the site uses (400–700).
// Run after updating inter-ui:  node tools/fonts.mjs
import subsetFont from "subset-font";
import { readFileSync, writeFileSync } from "node:fs";

const ROOT = new URL("..", import.meta.url).pathname;
const source = readFileSync(ROOT + "node_modules/inter-ui/variable/InterVariable.woff2");
const range = (...pairs) => pairs.map(([a, b = a]) => Array.from({ length: b - a + 1 }, (_, i) => String.fromCodePoint(a + i)).join("")).join("");
// the same unicode-range split as in fonts.css, so a page only downloads the file it uses
const SUBSETS = {
  latin: range([0x20, 0xff], [0x131], [0x152, 0x153], [0x2bb, 0x2bc], [0x2c6], [0x2da], [0x2dc], [0x304], [0x308], [0x329],
    [0x2000, 0x206f], [0x20ac], [0x2122], [0x2191], [0x2193], [0x2212], [0x2215], [0xfeff], [0xfffd]),
  cyrillic: range([0x301], [0x400, 0x45f], [0x490, 0x491], [0x4b0, 0x4b1], [0x2116]),
};
for (const [name, text] of Object.entries(SUBSETS)) {
  const out = await subsetFont(source, text, { targetFormat: "woff2", variationAxes: { opsz: 14, wght: { min: 400, max: 700, default: 400 } } });
  writeFileSync(`${ROOT}src/assets/fonts/inter-${name}.woff2`, out);
  console.log(`inter-${name}.woff2  ${(out.length / 1024).toFixed(1)} KB`);
}
