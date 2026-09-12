#!/usr/bin/env bash
#
# Encodes the generated placeholder art and curated raster photos into the
# formats ImageSlot serves, sized to what the page actually displays rather
# than to the source resolution.
#
#   product shot   : 16:9, max rendered width ~1180px (the --shell max-width)
#   field photos   : 4:5, rendered in repeat(auto-fit, minmax(220px,1fr)), so
#                    ~290px at the widest — 640px covers 2x displays
#   carakerja photos : portrait card ~300-380px wide — 700px covers retina
#   fitur photos     : bento card ~300-500px wide — 900px covers retina
#   audiens photos   : persona card ~300-450px wide — 800px covers retina
#   penutup photo    : full-bleed section background up to ~1400-1600px wide
#                      on desktop — 1800px covers retina
#
# The carakerja/fitur/audiens/penutup sources are curated raster JPGs living
# in scripts/art/photos/ (not hand-authored SVGs), so they skip rasterize()
# entirely and go straight into encode().
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

# Tool resolution: the "real" dev machine has ImageMagick 7 (`magick`) and
# librsvg2-bin's `rsvg-convert` CLI. Some environments (this sandbox included)
# only ship ImageMagick 6 (`convert`, no `magick` shim) and no standalone
# `rsvg-convert`. ImageMagick 6's `convert` can rasterise SVG itself (its
# built-in MSVG coder), so it's used as the fallback for both roles rather
# than failing outright. Behaviour is identical wherever the originally
# assumed tools exist — this only widens what the script tolerates.
if command -v magick >/dev/null 2>&1; then
  IM=magick
elif command -v convert >/dev/null 2>&1; then
  IM=convert
else
  echo "error: need ImageMagick (magick or convert) on PATH" >&2
  exit 1
fi

if ! "$IM" -list format 2>/dev/null | grep -qiE '^\s*AVIF'; then
  echo "note: no AVIF delegate in ImageMagick — emitting WebP + JPEG only."
fi

# Rasterise an SVG at roughly 2x its intended display size before encoding.
# Prefers the dedicated rsvg-convert CLI; falls back to ImageMagick's own SVG
# delegate (a high -density plus an exact -resize keeps it sharp) when that
# CLI isn't installed. ImageMagick's built-in MSVG coder silently drops
# <linearGradient>/<radialGradient>/<clipPath> (they rasterise as solid black
# or empty regions instead of failing) — verified against this repo's own
# webgis.svg, whose map area BURNED OUT to a flat block after landing through
# this fallback the first time. So refuse the fallback for any SVG that uses
# those features rather than silently emitting a corrupted image.
rasterize() {
  local svg=$1 out=$2 w=$3 h=$4
  if command -v rsvg-convert >/dev/null 2>&1; then
    rsvg-convert -w "$w" -h "$h" "$svg" -o "$out"
  else
    if grep -qE '<(linearGradient|radialGradient|clipPath)[ >]' "$svg"; then
      echo "error: $svg uses gradients/clipPaths, which ImageMagick's SVG fallback renders incorrectly (verified: they rasterise as flat/solid regions instead of failing loudly)." >&2
      echo "        install librsvg2-bin (rsvg-convert) to encode this file — do not let the fallback silently produce a corrupted image." >&2
      exit 1
    fi
    "$IM" -background none -density 300 "$svg" -resize "${w}x${h}!" "$out"
  fi
}

# Product shot is vector, so rasterise at ~2x display width before encoding.
rasterize "$ART/webgis.svg" "$RASTER/webgis.png" 2360 1328

encode() {
  local src=$1 base=$2 w=$3 wq=$4 jq=$5
  "$IM" "$src" -resize "${w}x" -strip -quality "$wq" -define webp:method=6 "$OUT/$base.webp"
  # Progressive JPEG fallback so it paints top-down on slow links.
  "$IM" "$src" -resize "${w}x" -strip -quality "$jq" -interlace Plane \
    -sampling-factor 4:2:0 "$OUT/$base.jpg"
}

# The product shot is a UI mockup: thin 1px rules and small text, so it needs a
# higher WebP quality than the soft photographic field images to avoid ringing.
encode "$RASTER/webgis.png" "webgis" 1600 82 82

# CaraKerja step photos — real photographic renders (replaced the earlier
# hand-authored SVG illustrations), portrait phone-render images displayed in
# a card roughly 300-380px wide.
for n in 01 02 03; do
  encode "$ART/photos/carakerja-$n.jpg" "carakerja-$n" 700 76 78
done

# Fitur item photos — displayed in a bento card roughly 300-500px wide.
for name in multimoda ai-agent plain-language multistop firstlastmile sustainability; do
  encode "$ART/photos/fitur-$name.jpg" "fitur-$name" 900 76 78
done

# Audiens persona photos — displayed in a card roughly 300-450px wide.
for name in mahasiswa wisatawan pekerja pemerintah umkm; do
  encode "$ART/photos/audiens-$name.jpg" "audiens-$name" 800 76 78
done

# Penutup closing background — full-bleed section background, can render up
# to ~1400-1600px wide on desktop, so it gets a larger display width and a
# bit more headroom than the repeated grid images above.
encode "$ART/photos/penutup.jpg" "penutup" 1800 74 76

shopt -s nullglob
for f in "$RASTER"/field-*.png; do
  idx=$(basename "$f" .png | cut -d- -f2)
  encode "$f" "field-$idx" 640 74 78
done
shopt -u nullglob

echo
echo "--- encoded sizes ---"
ls -lS "$OUT" | awk 'NR>1 {printf "%8.1f KB  %s\n", $5/1024, $9}'
echo "total: $(du -sh "$OUT" | cut -f1)"
