#!/usr/bin/env bash
# Publishes the test version of the site to https://muchakova.github.io
# through the public repository muchakova/muchakova.github.io (GitHub Pages from its `main` branch).
# No DNS is needed: GitHub serves that repository on its own address.
#  • only the built site goes there, never the sources;
#  • the test version is not indexed (noindex, robots.txt) and has no visitor statistics;
#  • every run replaces the previous version (one commit, no history).
# Usage:  npm run preview:publish
set -euo pipefail

REPO="${PREVIEW_REPO:-https://github.com/muchakova/muchakova.github.io.git}"
ADDRESS="https://muchakova.github.io"
cd "$(dirname "$0")/.."

npm run build:preview
rm -f _site/CNAME                # served on GitHub's own address, not on muchakova.com
touch _site/.nojekyll            # publish the files as they are

tmp="$(mktemp -d "${TMPDIR:-/tmp}/site-preview.XXXXXX")"
cp -R _site/. "$tmp"
git -C "$tmp" init -q -b main
git -C "$tmp" add -A
git -C "$tmp" -c user.name="$(git config user.name)" -c user.email="$(git config user.email)" \
  commit -q -m "Test version from $(git rev-parse --short HEAD) ($(date -u +%Y-%m-%d))"
git -C "$tmp" push -q -f "$REPO" main
rm -rf "$tmp"

npm run build   # back to the normal build in _site
echo "Published: $ADDRESS"
