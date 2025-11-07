#!bin/zsh
mkdir -p cropped
for f in input/*.png; do
  magick "$f" -trim +repage -shave 2x2 \
    "cropped/$(basename "$f")"
done
