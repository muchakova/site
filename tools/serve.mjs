// Minimal static server for a built site (tests, Lighthouse, local checks). No dependencies.
// Usage: node tools/serve.mjs <dir> <port> [mount]
//   mount "/" (default) serves the site at the root; mount "/x/y/" serves it in that folder (and 404s
//   everything outside it), to prove the build works from any folder.
// Mimics GitHub Pages: /dir/ → dir/index.html, /page → page.html, a folder without its trailing slash
// redirects to the slash (relative links depend on it), and missing files get 404.html at the root.
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { join, extname, resolve } from "node:path";

const root = resolve(process.argv[2] || "_site");
const port = Number(process.env.PORT || process.argv[3] || 4173);
const mount = ("/" + (process.argv[4] || "/") + "/").replace(/\/+/g, "/");
const TYPES = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".svg": "image/svg+xml",
  ".xml": "application/xml", ".txt": "text/plain; charset=utf-8", ".json": "application/json", ".woff2": "font/woff2",
  ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp", ".avif": "image/avif",
  ".pdf": "application/pdf", ".webmanifest": "application/manifest+json", ".ico": "image/x-icon" };

const isFile = async (p) => { try { return (await stat(p)).isFile(); } catch { return false; } };

// → { file } or { redirect } or null
async function find(sitePath) {
  const p = join(root, decodeURIComponent(sitePath));
  if (!p.startsWith(root)) return null;
  if (await isFile(p)) return { file: p };
  if (sitePath.endsWith("/") && (await isFile(join(p, "index.html")))) return { file: join(p, "index.html") };
  if (!sitePath.endsWith("/") && (await isFile(join(p, "index.html")))) return { redirect: true };
  if (await isFile(p + ".html")) return { file: p + ".html" };
  return null;
}

const send = async (res, status, file) => {
  res.writeHead(status, { "content-type": TYPES[extname(file)] || "application/octet-stream" });
  res.end(await readFile(file));
};

createServer(async (req, res) => {
  const { pathname, search } = new URL(req.url, "http://x");
  if (mount !== "/" && pathname === mount.slice(0, -1)) { res.writeHead(301, { location: mount + search }).end(); return; }
  if (!pathname.startsWith(mount)) { res.writeHead(404, { "content-type": "text/plain" }).end(`outside the site folder ${mount}: ${pathname}`); return; }
  const found = await find("/" + pathname.slice(mount.length));
  if (found?.redirect) { res.writeHead(301, { location: pathname + "/" + search }).end(); return; }
  if (found) return send(res, 200, found.file);
  // GitHub Pages serves the ROOT 404.html; a site in a folder never gets its own
  if (mount === "/" && (await isFile(join(root, "404.html")))) return send(res, 404, join(root, "404.html"));
  res.writeHead(404, { "content-type": "text/plain" }).end("Not found");
}).listen(port, "127.0.0.1", () => console.log(`serving ${root} on http://127.0.0.1:${port}${mount}`));
