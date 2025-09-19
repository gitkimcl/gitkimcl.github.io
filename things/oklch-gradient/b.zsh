#!bin/zsh
mkdir -p transparent
for f in cropped/*.png; do
  magick "$f" \
    \( +clone -colorspace gray -threshold 85% -negate \) \
    -alpha off -compose CopyOpacity -composite \
    "transparent/$(basename "$f")"
done
