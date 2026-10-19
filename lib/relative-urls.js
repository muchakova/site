// Page-relative URLs: the same build works at the site root and in any folder (e.g. muchakova.com/new/).
// Templates keep writing root-absolute URLs ("/services/"); this last build step turns every one of them in
// an HTML attribute into a path relative to the page ("../services/"). Left alone: absolute URLs
// (https://…, the metadata bound to muchakova.com), protocol-relative "//…", and all text, script and
// style content (JSON-LD, code samples).
import posthtml from "posthtml";

export const URL_ATTRS = ["href", "src", "action", "formaction", "poster", "data", "cite", "xlink:href"];
export const SRCSET_ATTRS = ["srcset", "imagesrcset"];

// how far a page sits below the site root: "/" and "/blog.html" → "", "/services/" → "../", "/en/blog/x.html" → "../../"
export const prefixFor = (pageUrl) => "../".repeat(Math.max(0, pageUrl.split("/").length - 2));

export function toRelative(url, prefix) {
  if (typeof url !== "string" || !url.startsWith("/") || url.startsWith("//")) return url;
  const rest = url.slice(1);
  if (!rest || rest[0] === "#" || rest[0] === "?") return (prefix || "./") + rest;   // "/" → "./", "/#about" → "./#about"
  if (!prefix && /^[^/?#]*:/.test(rest)) return "./" + rest;                         // "a:b" would read as a scheme
  return prefix + rest;                                                               // keeps ?query, #hash and the trailing "/"
}

const relativeSrcset = (value, prefix) => value.split(",").map((candidate) => {
  const [url, ...descriptors] = candidate.trim().split(/\s+/);
  return url ? [toRelative(url, prefix), ...descriptors].join(" ") : candidate;
}).join(", ");

// calls fn(element, attribute, value) for every URL-bearing attribute; the value fn returns replaces it
function eachUrl(tree, fn) {
  tree.walk((node) => {
    if (!node || !node.attrs) return node;
    for (const name of URL_ATTRS) if (typeof node.attrs[name] === "string") node.attrs[name] = fn(node, name, node.attrs[name]);
    for (const name of SRCSET_ATTRS) if (typeof node.attrs[name] === "string") node.attrs[name] = fn(node, name, node.attrs[name]);
    if (node.tag === "meta" && /refresh/i.test(node.attrs["http-equiv"] || "") && typeof node.attrs.content === "string") {
      node.attrs.content = fn(node, "content", node.attrs.content);
    }
    return node;
  });
  return tree;
}

export function relativizeUrls(html, pageUrl) {
  const prefix = prefixFor(pageUrl);
  const rewrite = (node, name, value) => {
    if (SRCSET_ATTRS.includes(name)) return relativeSrcset(value, prefix);
    if (name === "content") return value.replace(/(url=)(\/[^\s;'"]*)/i, (m, key, url) => key + toRelative(url, prefix));
    return toRelative(value, prefix);
  };
  return posthtml([(tree) => eachUrl(tree, rewrite)]).process(html, { sync: true }).html;
}

// every URL in the HTML attributes above (srcset split into its candidates), for the relocatability checks
export function collectUrls(html) {
  const urls = [];
  posthtml([(tree) => eachUrl(tree, (node, name, value) => {
    if (SRCSET_ATTRS.includes(name)) value.split(",").forEach((c) => { const u = c.trim().split(/\s+/)[0]; if (u) urls.push({ tag: node.tag, attr: name, url: u }); });
    else if (name === "content") { const m = value.match(/url=([^\s;'"]+)/i); if (m) urls.push({ tag: node.tag, attr: name, url: m[1] }); }
    else urls.push({ tag: node.tag, attr: name, url: value });
    return value;
  })]).process(html, { sync: true });
  return urls;
}
