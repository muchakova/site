#!/usr/bin/env python3
"""Extract the legacy blog cards (blog.html) and vlog cards (vlog/index.html)
into Eleventy data files, so the new pages can list real posts and videos
before the content migration (Phase 6) turns them into real templates.

Usage (from the site root):  python3 tools/extract-legacy.py
Writes src/_data/legacyPosts.json and src/_data/videos.json.
"""
import json
import re
import subprocess
from pathlib import Path

from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parent.parent

# translations object from js/main.js (older cards use data-key instead of inline BG/EN spans)
js = (ROOT / "js/main.js").read_text(encoding="utf-8")
obj = js[js.index("const translations ="):js.index("// ============ STATE")]
translations = json.loads(subprocess.run(
    ["node", "-e", obj + "\nprocess.stdout.write(JSON.stringify(translations))"],
    capture_output=True, text=True, check=True).stdout)


def bilingual(el):
    """{bg, en} text of an element that holds lang-content spans or a data-key."""
    if el is None:
        return {"bg": "", "en": ""}
    out = {}
    for lang in ("bg", "en"):
        span = el.select_one(f'.lang-content[data-lang="{lang}"]')
        if span is not None:
            out[lang] = span.get_text(" ", strip=True)
        elif el.get("data-key"):
            out[lang] = translations[lang].get(el["data-key"], "")
        else:
            out[lang] = el.get_text(" ", strip=True)
    return out


# ---------- blog cards ----------
soup = BeautifulSoup((ROOT / "blog.html").read_text(encoding="utf-8"), "lxml")
posts = []
for a in soup.select("a.blog-card[data-cats]"):
    minutes = bilingual(a.select_one(".blog-read-time"))["bg"]
    posts.append({
        "url": "/" + a["href"].lstrip("/"),
        "date": a["data-date"],
        "cats": a["data-cats"].split(),
        "pop": int(a.get("data-pop", "0") or 0),
        "tag": bilingual(a.select_one(".blog-tag")),
        "title": bilingual(a.select_one(".blog-card-title")),
        "excerpt": bilingual(a.select_one(".blog-card-excerpt")),
        "minutes": int(re.search(r"\d+", minutes).group()) if re.search(r"\d+", minutes) else None,
    })
# Six of the oldest cards have no English tag/excerpt in blog.html (the old site showed
# Bulgarian there even in English mode). Fill them from the post itself.
CYR = re.compile(r"[\u0400-\u04FF]")
TAGS_EN = {"ДДС": "VAT", "Данъчно право": "Tax law", "Данъци": "Taxes", "Бизнес": "Business",
           "Инвестиции": "Investing", "Икономика": "Economy"}


def first_sentences(text, limit=220):
    text = re.sub(r"\s+", " ", text).strip()
    out = ""
    for sentence in re.split(r"(?<=[.!?])\s+", text):
        if out and len(out) + len(sentence) > limit:
            break
        out = (out + " " + sentence).strip()
    return out


for post in posts:
    if not any(CYR.search(post[f]["en"]) for f in ("tag", "title", "excerpt")):
        continue
    page = BeautifulSoup((ROOT / post["url"].lstrip("/")).read_text(encoding="utf-8"), "lxml")
    if CYR.search(post["title"]["en"]):
        post["title"]["en"] = bilingual(page.select_one(".post-title"))["en"]
    if CYR.search(post["excerpt"]["en"]):
        body = page.select_one('.post-content > .lang-content[data-lang="en"]')
        para = next((p for p in body.find_all("p") if len(p.get_text(strip=True)) > 60 and not re.match(r"\s*Hello\b", p.get_text())), None) if body else None  # skip the greeting
        post["excerpt"]["en"] = first_sentences(para.get_text(" ", strip=True)) if para else ""
    if CYR.search(post["tag"]["en"]):
        post["tag"]["en"] = TAGS_EN.get(post["tag"]["bg"], post["tag"]["en"])
    left = [f for f in ("tag", "title", "excerpt") if CYR.search(post[f]["en"]) or not post[f]["en"]]
    if left:
        print("still Bulgarian or empty in English:", post["url"], left)

# Reading time from the article text itself, per language — the same rule as the
# Eleventy "readingTime" filter (letters/digits runs, 200 words per minute, rounded up).
WORDS = re.compile(r"[^\W_]+")
for post in posts:
    page = BeautifulSoup((ROOT / post["url"].lstrip("/")).read_text(encoding="utf-8"), "lxml")
    post["minutes"] = {}
    for lang in ("bg", "en"):
        body = page.select_one(f'.post-content > .lang-content[data-lang="{lang}"]')
        words = len(WORDS.findall(body.get_text(" "))) if body else 0
        post["minutes"][lang] = max(1, -(-words // 200))

posts.sort(key=lambda p: (p["date"], p["pop"]), reverse=True)
(ROOT / "src/_data/legacyPosts.json").write_text(json.dumps(posts, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")

# ---------- vlog cards ----------
vsoup = BeautifulSoup((ROOT / "vlog/index.html").read_text(encoding="utf-8"), "lxml")
videos = []
for art in vsoup.select("article.video-card[data-yt]"):
    links = art.select(".video-links a")
    article = next((l["href"] for l in links if "youtu" not in l["href"]), None)
    watch = next((l["href"] for l in links if "youtu" in l["href"]), None)
    videos.append({
        "id": art["id"],
        "yt": art["data-yt"],
        "date": art["data-date"],
        "cats": art.get("data-cats", "").split(),
        "duration": (art.select_one(".video-duration") or {}).get_text(strip=True) if art.select_one(".video-duration") else "",
        "shorts": bool(art.select_one(".chip-gold")),
        "tag": bilingual(art.select_one(".blog-tag")),
        "title": bilingual(art.select_one(".video-title")),
        "answer": bilingual(art.select_one(".video-answer")),
        "article": "/" + re.sub(r"^(\.\./)+", "", article) if article else None,
        "watch": watch,
    })
videos.sort(key=lambda v: v["date"], reverse=True)
(ROOT / "src/_data/videos.json").write_text(json.dumps(videos, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")

print(f"{len(posts)} posts, {len(videos)} videos")
