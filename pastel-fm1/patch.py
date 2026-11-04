#!/usr/bin/env python3
# SPDX-License-Identifier: GPL-3.0-only
"""Pastel FM-1 UI overlay for upstream Melodee v1.6.1.

This deliberately changes no DSP, bootloader, USB IDs, updater protocol or
storage formats. Source: https://github.com/keremimo/melodee/tree/v1.6.1
GPL-3.0-only; retained upstream notices and licenses are required.
"""
import pathlib
import sys

root=pathlib.Path(sys.argv[1]).resolve() if len(sys.argv)>1 else pathlib.Path(".").resolve()

def exact(path, old, new, expected=1):
    file=root/path
    source=file.read_text(encoding="utf-8")
    count=source.count(old)
    if count != expected:
        raise RuntimeError(f"{path}: expected {expected} matching fragments; found {count}. Do not patch another upstream version.")
    file.write_text(source.replace(old, new), encoding="utf-8")
    print(f"Patched {path}: {count} change(s)")

# This is a high-contrast cotton-candy palette: pastel screen backgrounds,
# soft lavender cards, rose/periwinkle/sage/apricot instruments, and readable
# deep-plum text and control labels. The existing source's WCAG-like automated
# checks still run, as do the upstream UI render tests.
exact(pathlib.Path("tools/gen_ui_palettes.py"),
'''("NIGHT",    (23, 20, 31),    (36, 32, 46),    (243, 238, 248), (255, 255, 255),
     ((255, 122, 92), (255, 193, 69), (70, 217, 176), (157, 140, 255))),''',
'''("PASTEL",   (255, 241, 246), (247, 224, 236), (44, 24, 48),    (30, 14, 34),
     ((150, 20, 102), (32, 64, 178), (0, 88, 90), (138, 54, 0))),''')
exact(pathlib.Path("tools/gen_ui_palettes.py"),
      'assert PALETTES[0][0] == "NIGHT"', 'assert PALETTES[0][0] == "PASTEL"')
exact(pathlib.Path("tools/gen_ui_palettes.py"),
      'LINE_PCT = {"NIGHT": 10}', 'LINE_PCT = {"PASTEL": 18}')
exact(pathlib.Path("firmware/src/main.c"), '"MELODEE", T_THEME', '"PASTEL", T_THEME', expected=2)
exact(pathlib.Path("firmware/src/ui_menu.c"), '"Melodee", T_THEME', '"Pastel", T_THEME')
exact(pathlib.Path("firmware/src/melodee.c"),
      '#define MELODEE_VERSION "v1.6.1"',
      '#define MELODEE_VERSION "Pastel v0.1"')
print("Pastel patch applied. Core synth, effects, MIDI and recovery paths remain upstream Melodee 1.6.1.")
