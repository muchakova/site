#!/usr/bin/env python3
"""Add/refresh reading time on blog cards in blog.html and index.html.

Usage (from the site root):  python3 tools/blog_meta.py

For every card <a href="blog/SLUG.html" class="blog-card …"> the script counts
the words inside the post's <article class="post-content"> (halved when the
post has both BG and EN versions), assumes ~200 words per minute, and writes
    <span class="blog-read-time">…N мин / N min…</span>
as the last item of the card's .blog-meta. Running it again only updates N.
"""
import re
from html import unescape
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
WPM = 200
PAGES = ["blog.html", "index.html"]


def minutes(post: Path) -> int:
    html = post.read_text(encoding="utf-8")
    m = re.search(r'<article class="post-content">(.*?)</article>', html, re.S)
    body = m.group(1) if m else html
    body = re.sub(r"<!--.*?-->|<script.*?</script>|<style.*?</style>", " ", body, flags=re.S)
    words = len(unescape(re.sub(r"<[^>]+>", " ", body)).split())
    if 'data-lang="en"' in body:
        words //= 2
    return max(1, round(words / WPM))


def span(n: int) -> str:
    return ('<span class="blog-read-time">'
            f'<span class="lang-content" data-lang="bg">{n} мин</span>'
            f'<span class="lang-content" data-lang="en" style="display:none;">{n} min</span>'
            '</span>')


CARD = re.compile(r'(<a href="(?:\.\./)?blog/([^"]+\.html)" class="blog-(?:card|featured)[^"]*"[^>]*>(?:(?!</a>).)*?<div class="blog-meta">)(.*?)(</div>)', re.S)
OLD = re.compile(r'\s*<span class="blog-read-time">.*? min</span></span>', re.S)


def main():
    cache = {}
    for name in PAGES:
        page = ROOT / name
        html = page.read_text(encoding="utf-8")

        def fix(m):
            slug = m.group(2)
            post = ROOT / "blog" / slug
            if not post.exists():
                return m.group(0)
            if slug not in cache:
                cache[slug] = minutes(post)
            meta = OLD.sub("", m.group(3)).rstrip()
            return f"{m.group(1)}{meta}\n            {span(cache[slug])}\n          {m.group(4)}"

        new = CARD.sub(fix, html)
        if new != html:
            page.write_text(new, encoding="utf-8")
            print(f"updated {name}")
    for slug, n in sorted(cache.items()):
        print(f"{n:>3} min  {slug}")


if __name__ == "__main__":
    main()
