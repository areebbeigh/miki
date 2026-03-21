#!/usr/bin/env bash
# Chrome Web Store listing: up to 5 screenshots at 1280×800 or 640×400, JPEG or 24-bit PNG, no alpha.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="$ROOT/docs/screenshots"
DST="${STORE_SCREENSHOTS_OUT:-$ROOT/docs/store-screenshots}"
W="${STORE_W:-1280}"
H="${STORE_H:-800}"
mkdir -p "$DST"

# Fit inside frame (downscale if needed; small images keep native size), pad with white, RGB output.
FILTER="scale=${W}:${H}:force_original_aspect_ratio=decrease,pad=${W}:${H}:(ow-iw)/2:(oh-ih)/2:color=white,format=rgb24"

ffmpeg_one() {
  local infile="$1"
  local outfile="$2"
  ffmpeg -hide_banner -loglevel error -y -i "$infile" -vf "$FILTER" -frames:v 1 "$outfile"
}

# Max 5 — pick a representative set for the listing.
declare -a PAIRS=(
  "bastion-normal-mode.png|01-article-bastion-normal.png"
  "bastion-focus-reading-mode.png|02-article-focus-reading.png"
  "wikipedia-code-geass-production.png|03-wikipedia-production.png"
  "ui-library-highlights.png|04-library-highlights.png"
  "ui-options-full.png|05-options.png"
)

for pair in "${PAIRS[@]}"; do
  IFS='|' read -r src_name dest_name <<<"$pair"
  echo "→ $dest_name"
  ffmpeg_one "$SRC/$src_name" "$DST/$dest_name"
done

echo "Done. Output: $DST/ (1280×800 RGB PNG)"
