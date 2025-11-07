#!bin/zsh
mkdir -p transparent2
for f in cropped2/*.png; do
  magick "$f" \
    \( +clone -colorspace gray -threshold 75% -negate \) \
    -alpha off -compose CopyOpacity -composite \
    "transparent2/$(basename "$f")"
done
