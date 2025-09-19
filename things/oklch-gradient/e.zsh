magick "transparent/0.png" \ 
    \( +clone -colorspace gray -threshold 50% -negate \) \
    -alpha off -compose CopyOpacity -composite \
    "transparent/0.png"

magick "transparent/0+.png" \
    \( +clone -colorspace gray -threshold 65% -negate \) \
    -alpha off -compose CopyOpacity -composite \
    "transparent/0+.png"

magick "transparent2/0.png" \ 
    \( +clone -colorspace gray -threshold 50% -negate \) \
    -alpha off -compose CopyOpacity -composite \
    "transparent2/0.png"

magick "transparent2/0+.png" \
    \( +clone -colorspace gray -threshold 65% -negate \) \
    -alpha off -compose CopyOpacity -composite \
    "transparent2/0+.png"