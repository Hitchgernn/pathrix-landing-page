#!/usr/bin/env bash
#
# Packs the Tugu Jogja source model into the single .glb the diorama loads.
#
# The Sketchfab export is a loose glTF: 765KB of uncompressed float buffers plus
# a 1024x1024 PNG baseColor, ~2MB before the browser sees any of it. That is
# roughly seven times the whole page's cold transfer weight, so it does not ship
# as-is.
#
# The monument renders about 200px tall in the hero at 1440x900, so a 512px
# texture is already more than the screen can resolve. Geometry is meshopt-
# compressed rather than Draco: three's MeshoptDecoder is a plain ES module that
# bundles into the existing lazy three chunk, while Draco needs a separate wasm
# fetch at runtime.
#
# Simplification is deliberately NOT run. At hero scale the visible risk is
# faceting on the spire and the drum band, which reads worse than texel loss --
# so if the output grows past budget, drop the texture to 256 before reaching
# for `gltf-transform simplify`.
#
# Licence: CC-BY-NC-ND-4.0. See scripts/art/tugu-jogja/license.txt, which is
# copied next to the .glb so it ships with the asset. Attribution is also
# rendered in the page footer -- see AGENTS.md.
#
# Run from the repo root: bash scripts/encode-model.sh
set -euo pipefail
cd "$(dirname "$0")/.."

SRC=scripts/art/tugu-jogja/scene.gltf
OUT=public/hero/tugu-jogja.glb
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT

GLTF="npx --yes @gltf-transform/cli@4"

mkdir -p "$(dirname "$OUT")"

# Chained rather than `optimize` so each step is legible and can be skipped on
# its own if a future export trips one of them up.
$GLTF dedup  "$SRC"          "$TMP/a.glb"
$GLTF prune  "$TMP/a.glb"    "$TMP/b.glb"
$GLTF resize "$TMP/b.glb"    "$TMP/c.glb" --width 512 --height 512
$GLTF webp   "$TMP/c.glb"    "$TMP/d.glb" --quality 82
$GLTF meshopt "$TMP/d.glb"   "$OUT" --level high

cp scripts/art/tugu-jogja/license.txt public/hero/tugu-jogja.license.txt

echo
echo "--- model size ---"
printf "%8.1f KB  raw    %s\n" "$(stat -c%s "$OUT" | awk '{print $1/1024}')" "$OUT"
printf "%8.1f KB  gzip   (what the host actually sends)\n" \
  "$(gzip -9 -c "$OUT" | wc -c | awk '{print $1/1024}')"
