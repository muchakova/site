// Unit tests for lib/relative-urls.js: which URLs become page-relative, and what is left alone.
import assert from "node:assert/strict";
import { prefixFor, toRelative, relativizeUrls } from "../../lib/relative-urls.js";
import { report } from "./_lib.mjs";

const errors = [];
const check = (name, fn) => { try { fn(); } catch (e) { errors.push(`${name}: ${e.message.split("\n")[0]}`); } };

check("depth of a page", () => {
  assert.equal(prefixFor("/"), "");
  assert.equal(prefixFor("/blog.html"), "");
  assert.equal(prefixFor("/services/"), "../");
  assert.equal(prefixFor("/en/"), "../");
  assert.equal(prefixFor("/en/blog/x.html"), "../../");
});
check("URL forms", () => {
  assert.equal(toRelative("/", ""), "./");
  assert.equal(toRelative("/", "../"), "../");
  assert.equal(toRelative("/#about", ""), "./#about");
  assert.equal(toRelative("/?q=x", "../"), "../?q=x");
  assert.equal(toRelative("/services/", ""), "services/");
  assert.equal(toRelative("/blog.html?cat=a&b=c#x", "../../"), "../../blog.html?cat=a&b=c#x");
  assert.equal(toRelative("/a:b", ""), "./a:b");
  for (const keep of ["//cdn.example/x.js", "https://muchakova.com/", "#main", "mailto:a@b.c", "tel:+359", "../x", "x.html"]) {
    assert.equal(toRelative(keep, "../"), keep);
  }
});
check("HTML attributes", () => {
  const html = `<a href="/en/">EN</a><img src="/img/a-400.avif" srcset="/img/a-400.avif 400w, /img/a-800.avif 800w">`
    + `<svg><use href="/assets/icons.svg#x"/><use xlink:href="/assets/icons.svg#y"/></svg>`
    + `<form action="/blog.html"></form><meta http-equiv="refresh" content="0; url=/booking/">`
    + `<link rel="canonical" href="https://muchakova.com/services/"><script src="/assets/js/site.js"></script>`;
  const out = relativizeUrls(html, "/services/");
  assert.match(out, /href="\.\.\/en\/"/);
  assert.match(out, /src="\.\.\/img\/a-400\.avif"/);
  assert.match(out, /srcset="\.\.\/img\/a-400\.avif 400w, \.\.\/img\/a-800\.avif 800w"/);
  assert.match(out, /<use href="\.\.\/assets\/icons\.svg#x"/);
  assert.match(out, /xlink:href="\.\.\/assets\/icons\.svg#y"/);
  assert.match(out, /action="\.\.\/blog\.html"/);
  assert.match(out, /content="0; url=\.\.\/booking\/"/);
  assert.match(out, /href="https:\/\/muchakova\.com\/services\/"/);
  assert.match(out, /<script src="\.\.\/assets\/js\/site\.js">/);
});
check("text, scripts and JSON-LD are left alone", () => {
  const html = `<p>See href="/x" in code: <code>&lt;a href="/x"&gt;</code></p>`
    + `<script type="application/ld+json">{"url":"/blog.html","item":"https://muchakova.com/"}</script>`
    + `<script>location.replace("/booking/")</script><style>a{background:url(/x.png)}</style>`;
  assert.equal(relativizeUrls(html, "/en/blog/x.html"), html);
});
report("relative URLs (unit)", errors);
