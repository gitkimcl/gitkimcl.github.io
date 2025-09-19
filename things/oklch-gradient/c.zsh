#!bin/zsh
mkdir -p cropped2
for f in input2/*.png; do
  magick "$f" -trim +repage -shave 2x2 \
    "cropped2/$(basename "$f")"
done
