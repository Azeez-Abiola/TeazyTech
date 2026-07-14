#!/usr/bin/env bash
# Converts iPhone HEIC/HEIF and camera RAW files to browser-friendly JPEGs.
# Prefers heif-convert / ImageMagick — macOS sips often produces broken ~3KB files for HEIC.

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
GALLERY_DIR="${1:-$ROOT/frontend/public/images/Gallery}"
MIN_VALID_BYTES=50000

convert_file() {
  local src="$1"
  local base="${src%.*}"
  local dest="${base}.jpg"
  local ext="${src##*.}"
  ext="$(printf '%s' "$ext" | tr '[:upper:]' '[:lower:]')"

  if [[ -f "$dest" && "$dest" -nt "$src" ]]; then
    local size
    size=$(wc -c < "$dest" | tr -d ' ')
    if [[ "$size" -ge "$MIN_VALID_BYTES" ]]; then
      echo "Skip (valid JPG exists): $(basename "$dest")"
      return 0
    fi
    echo "Replacing invalid JPG ($(basename "$dest"), ${size} bytes)"
  fi

  rm -f "$dest"

  if [[ "$ext" == "heic" || "$ext" == "heif" ]]; then
    if command -v heif-convert >/dev/null 2>&1; then
      heif-convert "$src" "$dest" >/dev/null
    elif command -v magick >/dev/null 2>&1; then
      magick "$src" -quality 92 "$dest"
    elif command -v sips >/dev/null 2>&1; then
      sips -s format jpeg "$src" --out "$dest" >/dev/null
    else
      echo "Install libheif (heif-convert) or ImageMagick to convert HEIC files." >&2
      exit 1
    fi
  elif [[ "$ext" == "arw" ]]; then
    if command -v sips >/dev/null 2>&1; then
      sips -s format jpeg "$src" --out "$dest" >/dev/null 2>&1 || true
    fi
    if [[ ! -f "$dest" ]] && command -v magick >/dev/null 2>&1; then
      magick "$src" -quality 92 "$dest" 2>/dev/null || true
    fi
    if [[ ! -f "$dest" ]]; then
      echo "FAILED: $(basename "$src") — install darktable or convert RAW to JPG manually." >&2
      return 1
    fi
  else
    echo "Unsupported type: $src" >&2
    return 1
  fi

  local out_size
  out_size=$(wc -c < "$dest" | tr -d ' ')
  if [[ "$out_size" -lt "$MIN_VALID_BYTES" ]]; then
    echo "FAILED: $(basename "$src") -> output too small (${out_size} bytes). Source may be corrupt." >&2
    rm -f "$dest"
    return 1
  fi

  echo "Converted: $(basename "$src") -> $(basename "$dest") (${out_size} bytes)"
}

shopt -s nullglob nocaseglob
failed=0
for src in "$GALLERY_DIR"/*.heic "$GALLERY_DIR"/*.heif "$GALLERY_DIR"/*.arw; do
  [[ -f "$src" ]] || continue
  convert_file "$src" || failed=$((failed + 1))
done

if [[ "$failed" -gt 0 ]]; then
  echo "${failed} file(s) failed conversion." >&2
  exit 1
fi

echo "Done. Use the .jpg paths in galleryData.js and other sections."
