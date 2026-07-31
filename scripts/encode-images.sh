#!/usr/bin/env bash
#
# Encodes the generated placeholder art into the formats ImageSlot serves, sized
# to what the page actually displays rather than to the source resolution.
#
#   product shot : 16:9, max rendered width ~1180px (the --shell max-width)
#   field photos : 4:5, rendered in repeat(auto-fit, minmax(220px,1fr)), so
#                  ~290px at the widest — 640px covers 2x displays
#
# AVIF is deliberately NOT produced: the ImageMagick build available here has no
# AVIF delegate and silently writes a PNG with an .avif extension, which is worse
# than useless (browsers pick the <source> by MIME type, download it, fail to
# decode, then fall back — so the page pays twice). WebP already gets these under
# 10KB. If a real encoder (avifenc / libavif / sharp) is added later, emit AVIF
# here and add the matching <source> back to ImageSlot.tsx.
#
# Run from the repo root: bash scripts/encode-images.sh
set -euo pipefail
cd "$(dirname "$0")/.."

ART=scripts/art
RASTER=$ART/raster
OUT=public/img
mkdir -p "$OUT" "$RASTER"

if ! magick -list format 2>/dev/null | grep -qiE '^\s*AVIF'; then
  echo "note: no AVIF delegate in ImageMagick — emitting WebP + JPEG only."
fi

# Product shot is vector, so rasterise at ~2x display width before encoding.
rsvg-convert -w 2360 -h 1328 "$ART/webgis.svg" -o "$RASTER/webgis.png"

encode() {
  local src=$1 base=$2 w=$3 wq=$4 jq=$5
  magick "$src" -resize "${w}x" -strip -quality "$wq" -define webp:method=6 "$OUT/$base.webp"
  # Progressive JPEG fallback so it paints top-down on slow links.
  magick "$src" -resize "${w}x" -strip -quality "$jq" -interlace Plane \
    -sampling-factor 4:2:0 "$OUT/$base.jpg"
}

# The product shot is a UI mockup: thin 1px rules and small text, so it needs a
# higher WebP quality than the soft photographic field images to avoid ringing.
encode "$RASTER/webgis.png" "webgis" 1600 82 82

for f in "$RASTER"/field-*.png; do
  idx=$(basename "$f" .png | cut -d- -f2)
  encode "$f" "field-$idx" 640 74 78
done

echo
echo "--- encoded sizes ---"
ls -lS "$OUT" | awk 'NR>1 {printf "%8.1f KB  %s\n", $5/1024, $9}'
echo "total: $(du -sh "$OUT" | cut -f1)"
