#!/usr/bin/env python3
"""Split a legacy bilingual post (blog/<slug>.html) into two Eleventy templates:
    src/bg/blog/<slug>.html  → /blog/<slug>.html     (same URL as before)
    src/en/blog/<slug>.html  → /en/blog/<slug>.html
The text is copied verbatim; only the wrappers of special blocks change to the
new design-system components (tables, prompt box, disclosure, download link,
images). Shared header data goes into the front matter.

Usage (from the site root):
    python3 tools/migrate-posts.py slug [slug …]     # selected posts
    python3 tools/migrate-posts.py --all             # every post except sample-post
"""
import json
import re
import sys
from pathlib import Path

from bs4 import BeautifulSoup, NavigableString

ROOT = Path(__file__).resolve().parent.parent
LEGACY = json.loads((ROOT / "src/_data/legacyPosts.json").read_text(encoding="utf-8"))
BY_URL = {p["url"]: p for p in LEGACY}

TEXT = {
    "bg": {"table": "Таблица", "prompt": "Промпт", "copied": "Копирано", "copyFailed": "Изберете текста и копирайте ръчно",
           "newTab": "(отваря се в нов раздел)"},
    "en": {"table": "Table", "prompt": "Prompt", "copied": "Copied", "copyFailed": "Select the text and copy it manually",
           "newTab": "(opens in a new tab)"},
}
ICON = '<svg class="icon" aria-hidden="true" focusable="false"><use href="/assets/icons.svg#{}"/></svg>'


def absolute(href):
    """Legacy relative links → site-absolute (the build localises them per language)."""
    if not href or href.startswith(("http:", "https:", "mailto:", "tel:", "#", "/")):
        return href
    if href.startswith("../"):
        return "/" + re.sub(r"^(\.\./)+", "", href)
    return "/blog/" + href  # sibling post


def convert(block, lang, slug, soup):
    t = TEXT[lang]
    for el in block.select("[style]"):
        if "display:none" in el["style"].replace(" ", ""):
            del el["style"]
    for el in block.select("script"):
        el.decompose()
    for a in block.select("a[href]"):
        a["href"] = absolute(a["href"])
        if a.get("target") == "_blank" and not a.select_one(".sr-only"):
            hint = soup.new_tag("span", attrs={"class": "sr-only"})
            hint.string = " " + t["newTab"]
            a.append(hint)
    # images: responsive widths, no fixed width/height (the build adds real dimensions)
    for img in block.select("img"):
        img["src"] = absolute(img["src"])
        for attr in ("width", "height", "loading", "decoding"):
            img.attrs.pop(attr, None)
        img["sizes"] = "(min-width: 980px) 680px, calc(100vw - 40px)"
        img["eleventy:widths"] = "680,1360"
        if img["src"].lower().endswith(".png"):
            img["eleventy:formats"] = "webp,png"  # screenshots with text stay sharp
    # h2 ids keep the old table-of-contents anchors (#bg-1, #en-2 …)
    for i, h2 in enumerate(block.find_all("h2"), 1):
        h2["id"] = h2.get("id") or f"{lang}-{i}"
    # tables → focusable, named region
    for n, wrap in enumerate(block.select(".post-table-wrap"), 1):
        heading = wrap.find_previous(["h2", "h3"])
        label = f"{t['table']}: {heading.get_text(' ', strip=True)}" if heading else f"{t['table']} {n}"
        wrap.name = "section"
        wrap.attrs = {"class": "table-wrap", "tabindex": "0", "aria-label": label}
    # prompt box with copy button (the site script handles copying and the announcement)
    for n, box in enumerate(block.select(".post-prompt"), 1):
        button = box.select_one(".post-prompt-copy")
        label = button.get_text(strip=True) if button else t["prompt"]
        pre = box.select_one("pre")
        pid = f"prompt-{slug}-{n}"
        html = (f'<div class="prompt-box" data-copy-scope><div class="prompt-box__bar"><span>{t["prompt"]}</span>'
                f'<span class="cluster" style="--cluster: 8px"><span class="copy-status" role="status" data-copy-status></span>'
                f'<button class="btn btn--secondary btn--small" type="button" data-copy-target="{pid}" data-copied="{t["copied"]}" '
                f'data-copy-failed="{t["copyFailed"]}">{ICON.format("copy")}{label}</button></span></div>'
                f'<pre id="{pid}">{pre.decode_contents()}</pre></div>')
        box.replace_with(BeautifulSoup(html, "html.parser"))
    # download link: icon instead of the emoji
    for dl in block.select(".post-download"):
        a = dl.select_one("a")
        for s in a.find_all(string=True):
            if "📄" in s:
                s.replace_with(s.replace("📄", "").lstrip())
        a["class"] = "download-link"
        a.insert(0, BeautifulSoup(ICON.format("download"), "html.parser"))
        dl.replace_with(BeautifulSoup(f'<p>{a}</p>', "html.parser"))
    return block


def migrate(slug):
    src = ROOT / "blog" / f"{slug}.html"
    soup = BeautifulSoup(src.read_text(encoding="utf-8"), "lxml")
    legacy = BY_URL[f"/blog/{slug}.html"]
    content = soup.select_one(".post-content")
    ld = {}
    for s in soup.select('script[type="application/ld+json"]'):
        try:
            data = json.loads(s.string)
        except (TypeError, json.JSONDecodeError):
            continue
        if data.get("@type") == "BlogPosting":
            ld = data
    og = (soup.find("meta", property="og:image") or {}).get("content", "")
    date = soup.select_one(".post-meta time")["datetime"]
    disclosure = content.select_one(":scope > .post-disclosure")

    for lang in ("bg", "en"):
        block = content.select_one(f':scope > .lang-content[data-lang="{lang}"]')
        block = convert(block, lang, slug, soup)
        body = block.decode_contents().strip()
        if disclosure is not None:
            span = disclosure.select_one(f'[data-lang="{lang}"]')
            note = BeautifulSoup(str(span), "html.parser").span
            for a in note.select("a[href]"):
                a["href"] = absolute(a["href"])
            body = f'<p class="disclosure">{note.decode_contents()}</p>\n\n' + body
        front = {
            "title": legacy["title"][lang],
            "description": (soup.find("meta", attrs={"name": "description"})["content"] if lang == "bg" else legacy["excerpt"][lang]),
            "date": date,
            "tag": legacy["tag"][lang],
            "cats": legacy["cats"],
        }
        if ld.get("dateModified") and ld["dateModified"] != date:
            front["updated"] = ld["dateModified"]
        if og and not og.endswith("/og-site.jpg"):
            front["ogImage"] = og.replace("https://muchakova.com", "")
        if ld.get("keywords"):
            front["keywords"] = ld["keywords"]
        lines = ["---"] + [f"{k}: {json.dumps(v, ensure_ascii=False)}" for k, v in front.items()] + ["---", ""]
        out = ROOT / "src" / lang / "blog" / f"{slug}.html"
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text("\n".join(lines) + body + "\n", encoding="utf-8")
    print("migrated", slug)


if __name__ == "__main__":
    args = sys.argv[1:]
    if args == ["--all"]:
        args = sorted(p.stem for p in (ROOT / "blog").glob("*.html") if p.stem != "sample-post")
    if not args:
        sys.exit(__doc__)
    for slug in args:
        migrate(slug)
