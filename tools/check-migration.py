#!/usr/bin/env python3
"""Content-preservation check for the post migration (Phase 6).

For every legacy bilingual post (blog/<slug>.html) and both languages, compares the old
article text with the built page (_site/blog/<slug>.html, _site/en/blog/<slug>.html):
  • every paragraph, list item, heading, table cell, caption and quote of the old text
    must appear in the new article body;
  • the number of images, tables, table cells and links must match;
  • image alt texts and external link targets must be kept.
Text is compared without whitespace, because the new markup adds language marks and
wrappers that shift spaces; screen-reader hints and the partner disclosure (moved into
the article on purpose) are left out of the comparison.
Run after `npm run build`:  python3 tools/check-migration.py
"""
import re
import sys
from pathlib import Path

from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parent.parent
SEGMENTS = ["p", "li", "h2", "h3", "h4", "td", "th", "figcaption", "blockquote", "pre", "dt", "dd"]


def norm(text):
    return re.sub(r"\s+", "", text.replace("📄", ""))


def external(a):
    href = a.get("href", "")
    return href if href.startswith(("http:", "https:", "mailto:", "tel:")) else None


def counts(soup):
    return {
        "images": len(soup.select("img")),
        "tables": len(soup.select("table")),
        "cells": len(soup.select("td, th")),
        "links": len(soup.select("a[href]")),
    }


def check(slug, lang):
    old_soup = BeautifulSoup((ROOT / "blog" / f"{slug}.html").read_text(encoding="utf-8"), "lxml")
    old = old_soup.select_one(f'.post-content > .lang-content[data-lang="{lang}"]')
    for el in old.select("script"):
        el.decompose()
    built = ROOT / "_site" / ("" if lang == "bg" else "en") / "blog" / f"{slug}.html"
    new = BeautifulSoup(built.read_text(encoding="utf-8"), "lxml").select_one(".prose")
    for el in new.select(".sr-only, .disclosure"):
        el.decompose()

    problems = []
    new_text = norm(new.get_text())
    for el in old.find_all(SEGMENTS):
        if el.find(SEGMENTS):  # the innermost blocks only
            continue
        if norm(el.get_text()) not in new_text:
            problems.append(f"text missing: {el.get_text(' ', strip=True)[:90]}")
    before, after = counts(old), counts(new)
    for k in before:
        if before[k] != after[k]:
            problems.append(f"{k}: {before[k]} before, {after[k]} after")
    for img in old.select("img[alt]"):
        if img["alt"] and not any(i.get("alt") == img["alt"] for i in new.select("img")):
            problems.append(f"image alt missing: {img['alt'][:60]}")
    new_ext = {external(a) for a in new.select("a[href]")} - {None}
    for a in old.select("a[href]"):
        if external(a) and external(a) not in new_ext:
            problems.append(f"link missing: {external(a)}")
    return problems


def main():
    slugs = sorted(p.stem for p in (ROOT / "blog").glob("*.html") if p.stem != "sample-post")
    failed = 0
    for slug in slugs:
        for lang in ("bg", "en"):
            problems = check(slug, lang)
            if problems:
                failed += 1
                print(f"✗ {lang} {slug}")
                for p in problems[:12]:
                    print(f"    {p}")
    print(f"{'✓' if not failed else '✗'} {len(slugs)} posts × 2 languages checked, {failed} with differences")
    sys.exit(1 if failed else 0)


if __name__ == "__main__":
    main()
