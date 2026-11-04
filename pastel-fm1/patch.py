#!/usr/bin/env python3
# SPDX-License-Identifier: GPL-3.0-only
"""Pastel FM-1 UI overlay for upstream Melodee v1.6.1.

This deliberately changes no DSP, bootloader, USB IDs, updater protocol or
storage formats. Source: https://github.com/keremimo/melodee/tree/v1.6.1
GPL-3.0-only; retained upstream notices and licenses are required.
"""
import pathlib
import shutil
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
      '#define MELODEE_VERSION "Pastel v0.2"')
# Preserve upstream palette name-order coverage while explicitly expecting Pastel.
exact(pathlib.Path("tests/theme_test.c"),
      '!strcmp(UI_PALETTES[0].name, "NIGHT")',
      '!strcmp(UI_PALETTES[0].name, "PASTEL")')
exact(pathlib.Path("tests/theme_test.c"),
      'assert((p == 1u || p == 6u) == ux.light)',
      'assert((p == 0u || p == 1u || p == 6u) == ux.light)')
# New independent liquid animation implementation. Kept outside the upstream
# source tree; copied only into the ephemeral build checkout.
liquid_src = pathlib.Path(__file__).with_name("liquid_effects.c")
liquid_dst = root / "firmware/src/pastel_liquid.c"
if liquid_dst.exists():
    raise RuntimeError("Refusing to overwrite a pre-existing liquid source")
shutil.copyfile(liquid_src, liquid_dst)

# Stage's existing 30-pixel refresh already runs at half UI frame rate.
# We draw beneath waveform and notes, leave touch/knob logic unchanged,
# and only add static bubbles to full-row redraws.
exact(pathlib.Path("firmware/src/ui_stage.c"),
      "static void stage_band(void)",
      '#include "pastel_liquid.c"\nstatic void stage_band(void)')
exact(pathlib.Path("firmware/src/ui_stage.c"),
      "cv_begin(240, ST_BAND_H, T_BG);",
      "cv_begin(240, ST_BAND_H, T_BG);\n    pastel_liquid_band(ST_BAND_H);")
exact(pathlib.Path("firmware/src/ui_stage.c"),
      "cv_bg = T_BG;\n        if (pic == SP_FILTER)",
      "cv_bg = T_BG;\n        pastel_liquid_shape(H_GRAPH);\n        if (pic == SP_FILTER)")
exact(pathlib.Path("firmware/src/ui_stage.c"),
      "stage_rec_paint(0, 0, BOX_W, h, 8, lv);         /* armed: the red border */",
      "stage_rec_paint(0, 0, BOX_W, h, 8, lv);         /* armed: the red border */\n            pastel_liquid_droplets(bg, tc, h);")

# Keep the name Pastel, with "Liquid Edition" as its custom identity.
exact(pathlib.Path("firmware/src/main.c"),
      'draw_text_box(0, 140, 240, TY_TX, "Starting up", T_MID, 1);',
      'draw_text_box(0, 140, 240, TY_TX, "LIQUID EDITION", T_MID, 1);')
exact(pathlib.Path("firmware/src/main.c"),
      'draw_text_box(0, 140, 240, TY_TX, "Multi-engine synth", T_MID, 1);',
      'draw_text_box(0, 140, 240, TY_TX, "LIQUID EDITION", T_MID, 1);')
exact(pathlib.Path("firmware/src/main.c"),
      'draw_text_box(0, 176, 240, TY_LB, MELODEE_VERSION, T_MID, 1);',
      'draw_text_box(0, 176, 240, TY_LB, MELODEE_VERSION, T_MID, 1);\n    pastel_liquid_splash();',
      expected=1)
# The second splash is inside a conditional; preserve its indentation.
exact(pathlib.Path("firmware/src/main.c"),
      '        draw_text_box(0, 176, 240, TY_LB, MELODEE_VERSION, T_MID, 1);',
      '        draw_text_box(0, 176, 240, TY_LB, MELODEE_VERSION, T_MID, 1);\n        pastel_liquid_splash();',
      expected=1)
exact(pathlib.Path("firmware/src/ui_menu.c"),
      'y = menu_text("Multi-engine synthesizer", y + 146, T_SEC, draw);',
      'y = menu_text("LIQUID EDITION - multi-engine synthesizer", y + 146, T_SEC, draw);')
print("Pastel patch applied. Liquid Edition: animation and soft ribbon/splash customization; DSP and update mechanisms unchanged.")
