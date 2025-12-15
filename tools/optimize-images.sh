#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

if command -v magick >/dev/null 2>&1; then
  IM_CMD=magick
elif command -v convert >/dev/null 2>&1; then
  IM_CMD=convert
else
  echo "ImageMagick (magick/convert) not found. Install ImageMagick or use Node/Sharp."
  exit 1
fi

SIZES=("thumb:600:80" "medium:1200:85" "full:1920:90")

# Process raster images, excluding originals folder
find images -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" -o -iname "*.tiff" -o -iname "*.webp" -o -iname "*.heic" \) ! -path "*/originals/*" | while IFS= read -r f; do
  dir=$(dirname "$f")
  base=$(basename "$f")
  base_no_ext="${base%.*}"
  sanitized="${base_no_ext// /-}"

  # Get image width to avoid upscaling
  original_width=$($IM_CMD identify -format "%w" "$f" 2>/dev/null || echo "0")

  for s in "${SIZES[@]}"; do
    name="${s%%:*}"
    width_and_rest="${s#*:}"
    width="${width_and_rest%%:*}"
    quality="${s##*:}"

    # If original width is 0 or smaller than target, use original width (no upscaling)
    if [ "$original_width" -ne 0 ]; then
      use_width="$width"
      if [ "$original_width" -lt "$width" ]; then
        use_width="$original_width"
      fi
    else
      use_width="$width"
    fi

    out_webp="$dir/${sanitized}-${name}.webp"
    out_jpg="$dir/${sanitized}-${name}.jpg"

    $IM_CMD "$f" -resize "${use_width}x" -quality "$quality" "$out_webp"
    $IM_CMD "$f" -resize "${use_width}x" -quality "$quality" "$out_jpg"

    echo "Wrote: $out_webp and $out_jpg"
  done

done

echo 'Optimization complete'
