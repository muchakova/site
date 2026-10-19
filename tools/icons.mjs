// Site icons from the "MM" mark, in the site font: favicon.ico (16 + 32 px), apple-touch-icon.png (180 px),
// icon-192.png and icon-512.png for the web manifest (the mark stays inside the safe zone, so they can be masked).
// Run once after changing the mark:  node tools/icons.mjs
import { chromium } from "@playwright/test";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const OUT = join(ROOT, "src/assets/icons");
const font = readFileSync(join(ROOT, "node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2")).toString("base64");

// `scale`: size of the letters relative to the icon; `radius`: rounded corners (0 = full square, the OS rounds it)
const html = (size, scale, radius) => `<!doctype html><style>
  @font-face { font-family: Inter; font-weight: 100 900; src: url(data:font/woff2;base64,${font}) format("woff2"); }
  html, body { margin: 0; background: transparent; }
  div { width: ${size}px; height: ${size}px; display: grid; place-items: center; background: #0E1838; border-radius: ${radius}px;
    color: #EEF1FF; font: 800 ${Math.round(size * scale)}px/1 Inter, sans-serif; letter-spacing: -0.03em; }
</style><div>MM</div>`;

mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch(process.env.CI ? {} : { channel: "chrome" });
const page = await browser.newPage({ deviceScaleFactor: 1 });
async function render(size, scale, radius) {
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(html(size, scale, radius));
  await page.evaluate(() => document.fonts.ready);
  return page.screenshot({ type: "png", omitBackground: true, clip: { x: 0, y: 0, width: size, height: size } });
}
writeFileSync(join(OUT, "apple-touch-icon.png"), await render(180, 0.42, 0));
writeFileSync(join(OUT, "icon-192.png"), await render(192, 0.36, 0));
writeFileSync(join(OUT, "icon-512.png"), await render(512, 0.36, 0));
const png16 = await render(16, 0.5, 3), png32 = await render(32, 0.47, 7);
await browser.close();

// .ico container holding PNG images (supported by every current browser)
const images = [[16, png16], [32, png32]];
const header = Buffer.alloc(6 + 16 * images.length);
header.writeUInt16LE(0, 0); header.writeUInt16LE(1, 2); header.writeUInt16LE(images.length, 4);
let offset = header.length;
images.forEach(([size, png], i) => {
  const e = 6 + 16 * i;
  header.writeUInt8(size, e); header.writeUInt8(size, e + 1); header.writeUInt8(0, e + 2); header.writeUInt8(0, e + 3);
  header.writeUInt16LE(1, e + 4); header.writeUInt16LE(32, e + 6);
  header.writeUInt32LE(png.length, e + 8); header.writeUInt32LE(offset, e + 12);
  offset += png.length;
});
writeFileSync(join(OUT, "favicon.ico"), Buffer.concat([header, ...images.map(([, png]) => png)]));
console.log("icons written to src/assets/icons/");
