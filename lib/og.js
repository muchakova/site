// Share image (og:image) of a page: src/images/og/<name>.jpg made by tools/og-images.mjs, named after the URL.
import { existsSync } from "node:fs";

export const ogName = (url) => url.replace(/^\/|\/$/g, "").replace(/\.html$/, "").replace(/\//g, "-") || "index";
export const ogFor = (url) => (existsSync(`src/images/og/${ogName(url)}.jpg`) ? `/images/og/${ogName(url)}.jpg` : "/images/og-site.jpg");
