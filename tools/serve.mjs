// Minimal static server for _site (tests, Lighthouse, local checks). No dependencies.
// Usage: node tools/serve.mjs <dir> <port>   — mimics GitHub Pages: /dir/ → index.html, /page → page.html, 404.html
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { join, extname, resolve } from "node:path";

const root = resolve(process.argv[2] || "_site");
const port = Number(process.env.PORT || process.argv[3] || 4173);
const TYPES = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".svg": "image/svg+xml",
  ".xml": "application/xml", ".txt": "text/plain; charset=utf-8", ".json": "application/json", ".woff2": "font/woff2",
  ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp", ".avif": "image/avif", ".pdf": "application/pdf" };

async function find(pathname) {
  const p = join(root, decodeURIComponent(pathname));
  if (!p.startsWith(root)) return null;
  for (const c of [p, join(p, "index.html"), p + ".html"]) {
    try { if ((await stat(c)).isFile()) return c; } catch {}
  }
  return null;
}

createServer(async (req, res) => {
  const { pathname } = new URL(req.url, "http://x");
  let file = await find(pathname), status = 200;
  if (!file) { file = await find("/404.html"); status = 404; }
  if (!file) { res.writeHead(404).end("Not found"); return; }
  res.writeHead(status, { "content-type": TYPES[extname(file)] || "application/octet-stream" });
  res.end(await readFile(file));
}).listen(port, "127.0.0.1", () => console.log(`serving ${root} on http://127.0.0.1:${port}`));
