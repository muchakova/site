#!/usr/bin/env bash
# Publishes the test version of the new site to https://muchakova.com/new/ — the folder new/ on the
# branch main of muchakova/site, next to the old site, which stays as it is.
#  • one build for any folder: the same files will later replace the old site at the root;
#  • the test version is not indexed (noindex) and has no visitor statistics (SITE_PREVIEW=1);
#  • everything is built and checked here, on this machine; GitHub only serves the files (no Actions);
#  • on main only new/ changes; every run replaces the previous test version.
# Usage:  npm run publish:new
#         DRY_RUN=1 npm run publish:new   builds, checks and shows the change; commits and pushes nothing
set -euo pipefail
cd "$(dirname "$0")/.."

FOLDER=new
ADDRESS="https://muchakova.com/$FOLDER/"
PORT="${PORT:-4175}"
ROOT_ONLY=(CNAME robots.txt sitemap.xml llms.txt 404.html)   # mean something only at the site root

say() { printf '\n\033[1m%s\033[0m\n' "$*"; }
fail() { printf '\n\033[31m✗ %s\033[0m\n' "$*" >&2; exit 1; }

tmp="$(mktemp -d "${TMPDIR:-/tmp}/publish-new.XXXXXX")"
server=""
cleanup() {
  [ -n "$server" ] && kill "$server" 2>/dev/null || true
  git worktree remove --force "$tmp/main" 2>/dev/null || true
  rm -rf "$tmp"
}
trap cleanup EXIT

say "1/7 Preconditions"
[ -z "$(git status --porcelain)" ] || fail "Uncommitted changes. The test version is built from the last commit: commit them first."
src="$(git rev-parse --abbrev-ref HEAD)@$(git rev-parse --short HEAD)"
git fetch -q origin main
behind="$(git rev-list --count main..origin/main)"
[ "$behind" = 0 ] || fail "Local main is $behind commit(s) behind origin/main. Update it first (git fetch, then fast-forward main)."
if [ -n "$(git log --oneline origin/main..main)" ]; then
  echo "These commits of main are not on GitHub yet and go live with this publish:"
  git log --oneline origin/main..main | sed 's/^/  /'
fi
git branch -r --contains HEAD | grep -q . || echo "Note: $src is not on GitHub yet (git push) — the published files name it in version.txt."

say "2/7 Build ($src, SITE_PREVIEW=1)"
SITE_PREVIEW=1 node_modules/.bin/eleventy --quiet --output="$tmp/site"
for f in "${ROOT_ONLY[@]}"; do rm -f "$tmp/site/$f"; done
printf '%s %s\n' "$src" "$(date -u +%Y-%m-%dT%H:%M:%SZ)" > "$tmp/site/version.txt"

say "3/7 Checks of the build"
SITE_DIR="$tmp/site" node tests/static/relocatable.mjs
SITE_DIR="$tmp/site" node tests/static/links.mjs
SITE_DIR="$tmp/site" node tests/static/preview.mjs
node tools/serve.mjs "$tmp/site" "$PORT" "/$FOLDER/" >/dev/null & server=$!
for _ in $(seq 50); do curl -fs -o /dev/null "http://127.0.0.1:$PORT/$FOLDER/" && break; sleep 0.2; done
node tools/crawl.mjs "http://127.0.0.1:$PORT/$FOLDER/"
{ kill "$server" && wait "$server"; } 2>/dev/null || true; server=""

say "4/7 Copy into $FOLDER/ on main"
git worktree add -q "$tmp/main" main
mkdir -p "$tmp/main/$FOLDER"
rsync -a --delete --exclude .DS_Store "$tmp/site/" "$tmp/main/$FOLDER/"
git -C "$tmp/main" add -A -- "$FOLDER"
outside="$(git -C "$tmp/main" status --porcelain | grep -v " $FOLDER/" || true)"
[ -z "$outside" ] && [ -z "$(git -C "$tmp/main" diff --cached --name-only | grep -v "^$FOLDER/" || true)" ] \
  || fail "Changes outside $FOLDER/ — stopping, nothing published:
$outside"
if [ -z "$(git -C "$tmp/main" diff --cached --name-only -- . ":!$FOLDER/version.txt")" ]; then
  echo "Nothing changed: $ADDRESS already has this version."; exit 0
fi
git -C "$tmp/main" diff --cached --stat=100 | tail -1

if [ -n "${DRY_RUN:-}" ]; then
  say "DRY_RUN: everything checked, nothing committed or pushed."
  exit 0
fi

say "5/7 Commit and push main"
git -C "$tmp/main" commit -q -m "New site test version in /$FOLDER/ from $src" \
  -m "Built with SITE_PREVIEW=1 (not indexed, no visitor statistics). Only $FOLDER/ changes; the old site at the root is untouched."
git -C "$tmp/main" push -q origin main
git -C "$tmp/main" log --oneline -1

say "6/7 Waiting for GitHub Pages to serve it"
want="$(cat "$tmp/site/version.txt")"
for i in $(seq 60); do
  got="$(curl -fsS "${ADDRESS}version.txt?t=$(date +%s)" 2>/dev/null || true)"
  [ "$got" = "$want" ] && break
  [ "$i" = 60 ] && fail "After 10 minutes ${ADDRESS}version.txt still shows \"$got\". Check GitHub → Settings → Pages, then run npm run check:new."
  sleep 10
done
echo "Live: $want"

say "7/7 Checks of the live test version"
npm run --silent check:new
say "✓ Published: $ADDRESS"
