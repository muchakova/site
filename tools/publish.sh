#!/usr/bin/env bash
# Publishes the site to https://muchakova.com/ — the root of the branch main of muchakova/site.
#  • everything is built and checked here, on this machine; GitHub only serves the files (no Actions);
#  • main holds only the built site: every run replaces it with the build of the current commit;
#  • the old addresses keep working (tests/static/legacy-urls.mjs) and CNAME never changes.
# Usage:  npm run publish:site
#         DRY_RUN=1 npm run publish:site   builds, checks and shows the change; commits and pushes nothing
# Undo:   git revert of the publish commit on main (the pre-redesign site is also in the tag pre-redesign-2026)
set -euo pipefail
cd "$(dirname "$0")/.."

ADDRESS="https://muchakova.com/"
PORT="${PORT:-4175}"
KEEP=(.git .gitignore)   # on main, but not part of the build

say() { printf '\n\033[1m%s\033[0m\n' "$*"; }
fail() { printf '\n\033[31m✗ %s\033[0m\n' "$*" >&2; exit 1; }

tmp="$(mktemp -d "${TMPDIR:-/tmp}/publish.XXXXXX")"
server=""
cleanup() {
  [ -n "$server" ] && kill "$server" 2>/dev/null || true
  git worktree remove --force "$tmp/main" 2>/dev/null || true
  rm -rf "$tmp"
}
trap cleanup EXIT

say "1/7 Preconditions"
[ -z "$(git status --porcelain)" ] || fail "Uncommitted changes. The site is built from the last commit: commit them first."
src="$(git rev-parse --abbrev-ref HEAD)@$(git rev-parse --short HEAD)"
git fetch -q origin main
behind="$(git rev-list --count main..origin/main)"
[ "$behind" = 0 ] || fail "Local main is $behind commit(s) behind origin/main. Update it first (git fetch, then fast-forward main)."
git branch -r --contains HEAD | grep -q . || echo "Note: $src is not on GitHub yet (git push) — the published files name it in version.txt."

say "2/7 Build ($src)"
env -u SITE_PREVIEW -u SHOW_PENDING node_modules/.bin/eleventy --quiet --output="$tmp/site"
touch "$tmp/site/.nojekyll"   # serve the files as they are, without Jekyll
printf '%s %s\n' "$src" "$(date -u +%Y-%m-%dT%H:%M:%SZ)" > "$tmp/site/version.txt"

say "3/7 Checks of the build"
SITE_DIR="$tmp/site" node tests/static/relocatable.mjs
SITE_DIR="$tmp/site" node tests/static/links.mjs
SITE_DIR="$tmp/site" node tests/static/legacy-urls.mjs
SITE_DIR="$tmp/site" node tests/static/seo.mjs
SITE_DIR="$tmp/site" STRICT_PENDING=1 node tests/static/pending.mjs
node tools/serve.mjs "$tmp/site" "$PORT" >/dev/null & server=$!
for _ in $(seq 50); do curl -fs -o /dev/null "http://127.0.0.1:$PORT/" && break; sleep 0.2; done
node tools/crawl.mjs "http://127.0.0.1:$PORT/"
{ kill "$server" && wait "$server"; } 2>/dev/null || true; server=""

say "4/7 Copy into the root of main"
git worktree add -q "$tmp/main" main
rsync -a --delete --exclude .DS_Store $(printf -- '--exclude /%s ' "${KEEP[@]}") "$tmp/site/" "$tmp/main/"
git -C "$tmp/main" add -A
git -C "$tmp/main" diff --cached --quiet -- CNAME || fail "CNAME would change — stopping, nothing published."
SITE_DIR="$tmp/main" node tests/static/legacy-urls.mjs
if [ -z "$(git -C "$tmp/main" diff --cached --name-only -- . ":!version.txt")" ]; then
  echo "Nothing changed: $ADDRESS already has this version."; exit 0
fi
git -C "$tmp/main" diff --cached --name-status | cut -c1 | sort | uniq -c | sed 's/ A$/ added/; s/ M$/ changed/; s/ D$/ removed/'

if [ -n "${DRY_RUN:-}" ]; then
  say "DRY_RUN: everything checked, nothing committed or pushed."
  exit 0
fi

say "5/7 Commit and push main"
git -C "$tmp/main" commit -q -m "Publish the site from $src" \
  -m "Built and checked locally with tools/publish.sh (no Actions)."
git -C "$tmp/main" push -q origin main
git -C "$tmp/main" log --oneline -1

say "6/7 Waiting for GitHub Pages to serve it"
want="$(cat "$tmp/site/version.txt")"
for i in $(seq 60); do
  got="$(curl -fsS "${ADDRESS}version.txt?t=$(date +%s)" 2>/dev/null || true)"
  [ "$got" = "$want" ] && break
  [ "$i" = 60 ] && fail "After 10 minutes ${ADDRESS}version.txt still shows \"$got\". Check GitHub → Settings → Pages, then run npm run check:site."
  sleep 10
done
echo "Live: $want"

say "7/7 Checks of the live site"
npm run --silent check:site
say "✓ Published: $ADDRESS"
