#!/usr/bin/env python3
"""Rebuild Candy Land launcher icons without white/transparent perimeter rings.

Use the original full logo, never a substituted illustration. The art's round
edges have transparency; alpha-composite on a colorful Candy Land background
before making square PNG icons so iOS/Android cannot show a white halo.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageOps

ROOT = Path(__file__).resolve().parents[1]
source = ROOT / "public" / "random-candy-land-art.webp"
art = Image.open(source).convert("RGBA")
w, h = art.size
side = round(min(w, h) * 0.84)
left, top = (w - side) // 2, (h - side) // 2
focused = art.crop((left, top, left + side, top + side))
for name, size in [
    ("favicon.png", 64),
    ("apple-touch-icon.png", 180),
    ("icon-192.png", 192),
    ("icon-512.png", 512),
]:
    # Fully opaque jewel-tone canvas replaces every transparent edge pixel.
    # The colorful original artwork is still the entire visible foreground.
    canvas = Image.new("RGBA", (size, size), (79, 22, 127, 255))
    paint = ImageDraw.Draw(canvas)
    for y in range(size):
        mix = y / max(1, size - 1)
        paint.line((0, y, size, y), fill=(
            int(71 + mix * 55), int(22 + mix * 8), int(128 + mix * 37), 255
        ))
    logo = ImageOps.fit(focused, (size, size), method=Image.Resampling.LANCZOS)
    canvas.alpha_composite(logo)
    # RGB ensures no alpha/white padding survives in a home-screen icon.
    canvas.convert("RGB").save(ROOT / "public" / name, "PNG", optimize=True)
    print(f"Rebuilt {name} from the original full-bleed logo: no white perimeter")
