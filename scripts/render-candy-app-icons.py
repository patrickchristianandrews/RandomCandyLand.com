#!/usr/bin/env python3
"""Build full-bleed launch icons from the original candy-castle picture.

The image is enlarged into the circular Android launcher mask. No solid-color
padding, blank border, or unrelated mascot artwork is introduced.
"""
from pathlib import Path
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
source = ROOT / "public" / "random-candy-land-art.webp"
art = Image.open(source).convert("RGB")
w, h = art.size
crop_side = round(min(w, h) * 0.84)
left = (w - crop_side) // 2
top = (h - crop_side) // 2
fullbleed = art.crop((left, top, left + crop_side, top + crop_side))
for name, size in [
    ("favicon.png", 64),
    ("apple-touch-icon.png", 180),
    ("icon-192.png", 192),
    ("icon-512.png", 512),
]:
    icon = ImageOps.fit(fullbleed, (size, size), method=Image.Resampling.LANCZOS)
    icon.save(ROOT / "public" / name, "PNG", optimize=True)
    print(f"Rendered full-bleed {size}x{size} candy picture: {name}")
