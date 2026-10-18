#!/usr/bin/env python3
"""Sync the shared navigation, footer and <head> snippet into every page.

Usage (from the site root):  python3 tools/sync_layout.py

Edit partials/nav.html, partials/footer.html or partials/head.html, then run
this script. Each page holds the shared blocks between marker comments:

    <!-- LAYOUT:HEAD -->   ... <!-- /LAYOUT:HEAD -->
    <!-- LAYOUT:NAV -->    ... <!-- /LAYOUT:NAV -->
    <!-- LAYOUT:FOOTER --> ... <!-- /LAYOUT:FOOTER -->

Pages without markers yet are migrated: the old <nav class="navbar"> and
<footer class="footer"> are replaced, and the head snippet is inserted just
before the css/style.css link. `{{R}}` in a partial becomes the relative path
to the site root ("" or "../"). The nav link whose data-nav matches the page's
section gets aria-current="page". Running the script twice changes nothing.
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SKIP_DIRS = {".git", ".claude", "partials", "tools", "drafts", "meet", "files", "images", "css", "js"}

# First path segment -> nav section highlighted with aria-current.
SECTIONS = {
    "blog.html": "blog",
    "blog": "blog",
    "vlog": "vlog",
    "projects": "projects",
    "game": "projects",
    "synth": "projects",
    "partners": "partners",
    "booking": "booking",
}


def read_partial(name):
    return (ROOT / "partials" / name).read_text(encoding="utf-8").rstrip("\n")


def render(partial, rel_root, section):
    out = partial.replace("{{R}}", rel_root)
    if section:
        out = out.replace(f'data-nav="{section}"', f'data-nav="{section}" aria-current="page"')
    return out


def block(name, body):
    return f"<!-- LAYOUT:{name} -->\n{body}\n  <!-- /LAYOUT:{name} -->"


def replace_block(html, name, body, legacy_pattern=None, insert_before=None):
    marked = re.compile(rf"<!-- LAYOUT:{name} -->.*?<!-- /LAYOUT:{name} -->", re.S)
    new = block(name, body)
    if marked.search(html):
        return marked.sub(lambda _: new, html, count=1)
    if legacy_pattern:
        m = re.search(legacy_pattern, html, re.S)
        if m:
            return html[:m.start()] + new + html[m.end():]
    if insert_before:
        m = re.search(insert_before, html)
        if m:
            return html[:m.start()] + new + "\n  " + html[m.start():]
    raise ValueError(f"no place for {name} block")


def pages():
    for path in sorted(ROOT.rglob("*.html")):
        rel = path.relative_to(ROOT)
        if rel.parts[0] in SKIP_DIRS:
            continue
        yield path, rel


def main():
    head, nav, footer = (read_partial(n) for n in ("head.html", "nav.html", "footer.html"))
    changed = 0
    for path, rel in pages():
        rel_root = "../" * (len(rel.parts) - 1)
        section = SECTIONS.get(rel.parts[0])
        html = path.read_text(encoding="utf-8")
        try:
            new = replace_block(html, "HEAD", render(head, rel_root, None),
                                insert_before=r'<link rel="stylesheet" href="[./]*css/style\.css"')
            new = replace_block(new, "NAV", render(nav, rel_root, section),
                                legacy_pattern=r'(?:<a href="#main" class="skip-link"[^>]*>[^<]*</a>\s*)?<nav class="navbar".*?</nav>')
            new = replace_block(new, "FOOTER", render(footer, rel_root, None),
                                legacy_pattern=r'<footer class="footer">.*?</footer>')
        except ValueError as e:
            print(f"!! {rel}: {e}", file=sys.stderr)
            continue
        if new != html:
            path.write_text(new, encoding="utf-8")
            changed += 1
            print(f"updated {rel}")
    print(f"{changed} page(s) changed")


if __name__ == "__main__":
    main()
