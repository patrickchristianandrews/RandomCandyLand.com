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
      '#define MELODEE_VERSION "Pastel v0.7"')
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
      '    draw_text_box(0, 176, 240, TY_LB, MELODEE_VERSION, T_MID, 1);   /* (#86: the version at power-on) */',
      '    draw_text_box(0, 176, 240, TY_LB, MELODEE_VERSION, T_MID, 1);   /* (#86: the version at power-on) */\n    pastel_liquid_splash();',
      expected=1)
# The second splash is inside a conditional; preserve its indentation.
exact(pathlib.Path("firmware/src/main.c"),
      '        draw_text_box(0, 176, 240, TY_LB, MELODEE_VERSION, T_MID, 1);',
      '        draw_text_box(0, 176, 240, TY_LB, MELODEE_VERSION, T_MID, 1);\n        pastel_liquid_splash();',
      expected=1)
exact(pathlib.Path("firmware/src/ui_menu.c"),
      'y = menu_text("Multi-engine synthesizer", y + 146, T_SEC, draw);',
      'y = menu_text("LIQUID EDITION - multi-engine synthesizer", y + 146, T_SEC, draw);')
# Pastel v0.3: an independently synthesized Animal Jam performance surface.
# We leave the original FM-1 update loader, engine IDs and preset storage layout
# unmodified. The recorded animal voices are separate from the original synth and never
# overwrite existing user preset banks.
for src_name, dst_name in (
    ("animal_audio.c", "pastel_animal_audio.c"),
    ("animal_view.c", "pastel_animal_view.c"),
):
    target = root / "firmware/src" / dst_name
    if target.exists():
        raise RuntimeError(f"Refusing to overwrite {target}")
    shutil.copyfile(pathlib.Path(__file__).with_name(src_name), target)

exact(pathlib.Path("firmware/src/seq.c"),
      '#define KB_SILENT 255u',
      '#include "pastel_animal_audio.c"\n#define KB_SILENT 255u')
exact(pathlib.Path("firmware/src/seq.c"),
      '            if (song.grid == 2u)                  /* NAME / pattern selection: keys belong to the UI */',
      '            if (pastel_animal_active) {           /* Animal Jam: keys call animals, not the song */\n'
      '                kb_note[k] = KB_SILENT;\n'
      '                pastel_animal_hit(k);\n'
      '                continue;\n'
      '            }\n'
      '            if (song.grid == 2u)                  /* NAME / pattern selection: keys belong to the UI */')

exact(pathlib.Path("firmware/src/audio.c"),
      '    mix_block(out, n);',
      '    mix_block(out, n);\n    pastel_animal_render(out, n);')

# Give the HOME key three pages: the sequencer, chord wheel and Animal Jam.
exact(pathlib.Path("firmware/src/ui_input.c"),
      '    dq_poll();                                          /* (destructive edits waiting for their loop end) */',
      '    pastel_animal_active = (uint8_t)(ui.home && ui.home_pg == 2u && !ui.menu && !ui.confirm && !pop.on && !ui.layer);\n'
      '    dq_poll();                                          /* (destructive edits waiting for their loop end) */')
exact(pathlib.Path("firmware/src/ui_input.c"),
      'ui.home_pg = (uint8_t)!ui.home_pg;              /* other page (ui_view.c) */',
      'ui.home_pg = (uint8_t)((ui.home_pg + 1u) % 3u); /* Stage, chord wheel, animals */')
exact(pathlib.Path("firmware/src/ui.c"),
      'uint8_t home_pg;             /* HOME\'s page: 0 Stage, 1 the chord view (ui_view.c); HOME tapped on HOME turns it */',
      'uint8_t home_pg;             /* HOME: 0 Stage, 1 chord view, 2 Animal Jam */')

exact(pathlib.Path("firmware/src/ui_draw.c"),
      '#include "ui_view.c"                                    /* HOME\'s second page: the chord, pictures of what plays */',
      '#include "ui_view.c"                                    /* HOME\'s second page: the chord, pictures of what plays */\n'
      '#include "pastel_animal_view.c"                         /* HOME\'s third page: dancing animal synthesizer */')
exact(pathlib.Path("firmware/src/ui_draw.c"),
      '        if (ui.home && ui.home_pg)                      /* HOME\'s second page (ui_view.c) */\n'
      '            view_draw();',
      '        if (ui.home && ui.home_pg == 2u)\n'
      '            pastel_animal_draw();\n'
      '        else if (ui.home && ui.home_pg == 1u)         /* HOME\'s second page (ui_view.c) */\n'
      '            view_draw();')
exact(pathlib.Path("firmware/src/ui_draw.c"),
      '    } else if (ui.home) {                               /* Stage: the engine (a kit: its name, "909 KIT") */',
      '    } else if (ui.home && ui.home_pg == 2u) {\n'
      '        str_cpy(b, "ANIMALS", 16);\n'
      '    } else if (ui.home) {                               /* Stage: the engine (a kit: its name, "909 KIT") */')
exact(pathlib.Path("firmware/src/ui_draw.c"),
      'x + 6 + 28 <= 236 - cw',
      'x + 6 + 48 <= 236 - cw')
exact(pathlib.Path("firmware/src/ui_draw.c"),
      'for (i = 0, x += 6; i < 2u; i++) {',
      'for (i = 0, x += 6; i < 3u; i++) {')

# New projects open on community-inspired SLOOP, Melodee FM6 and ChoralRoot
# styles, not the original M-VAVE factory bank. Saved projects/templates remain
# user-owned and are not wiped or silently overwritten.
exact(pathlib.Path("firmware/src/engines.c"),
      'static const uint8_t TRK_DEF[NPART][2] = {{ENGI_PROPHET, 1}, {ENGI_FM6, 10}, {ENGI_CZ, 52}, {ENGI_DRUM, 0}};',
      'static const uint8_t TRK_DEF[NPART][2] = {{3u, 32u}, {ENGI_FM6, 10u}, {3u, 44u}, {ENGI_DRUM, 0u}};')

# Sixteen accessible curated patch approximations of celebrated community
# synth sound designs. They use Melodee's still-supported SID oscillator and
# envelope model; no stock M-VAVE sample ROM or proprietary voices.
exact(pathlib.Path("firmware/src/eng_sid.c"),
      '};\n#undef SIDP\n\nstatic const engine_t ENG_SID = {',
      '''    /* Community-inspired Pastel sounds (SLOOP and ChoralRoot).
     * SLOOP's ANALOG and LOFI patches are NOT wire-compatible with Melodee
     * SID. These are newly voiced SID equivalents; they are not byte copies.
     * No original M-VAVE factory audio or preset ROM is included.
     */
    SIDP("SLP 808 BOOM", 1, 0, 0, 64, 127,  0, 7,  8,   0, 95,   0, 28,  0, 1, 0,0,0,0),
    SIDP("SLP 303 ACID", 0, 1, 0, 58,  35, 13, 1, 62,   0, 55,  45, 20, 58, 1, 0,0,0,0),
    SIDP("SLP REESE",    0, 1, 5, 64,  48,  9, 0, 40,   0, 70, 115, 34, 10, 1, 0,0,0,0),
    SIDP("SLP WOBBLE",   0, 2, 4, 45,  45, 12, 1, 66,   0, 65, 124, 36, 55, 1, 0,0,0,0),
    SIDP("SLP FUNK",     1, 2, 1, 38,  65,  7, 0, 35,   0, 60,  75, 23, 25, 1, 0,0,0,0),
    SIDP("SLP PLUGG",    1, 0, 0, 64, 120,  0, 7,  5,   0, 84,  60, 20,  0, 1, 0,0,0,0),
    SIDP("SLP GLIDE",    1, 2, 4, 38,  75,  4, 0, 20,   8, 67, 105, 40,  0, 1, 0,0,0,0),
    SIDP("SLP SAW",      1, 1, 5, 64, 115,  8, 0, 18,   4, 72, 116, 44, 20, 1, 0,0,0,0),
    SIDP("SLP WARM PAD", 1, 4, 4, 64,  57,  8, 0,  5,  92, 88, 110, 96,  0, 0, 0,0,0,0),
    SIDP("SLP ATMOS",    0, 4, 7, 50,  72,  6, 4,  0,  99, 95, 105, 99,  0, 0, 0,0,0,0),
    SIDP("SLP PLUCK",    0, 0, 0, 50,  65,  3, 7,  8,   0, 92,  12, 41, 38, 0, 0,0,0,0),
    SIDP("SLP PANPIPE",  1, 0, 0, 64, 120,  0, 7,  0,  10, 90,  91, 45,  0, 1, 0,0,0,0),
    SIDP("CR CHORDPAD",  1, 4, 4, 64,  55,  4, 0,  0,  96, 92, 119, 99,  0, 0, 0,0,0,0),
    SIDP("CR BLOOM",     1, 0, 7, 64, 115,  2, 7,  0,  66, 94,  96, 91,  0, 0, 0,0,0,0),
    SIDP("CR HARP",      1, 0, 2, 64, 110,  0, 7,  0,   0, 89,  15, 72,  0, 0, 0,0,0,0),
    SIDP("CR DREAM",     0, 2, 1, 46,  75,  3, 4, 10,  84, 93, 111, 99,  0, 0, 0,0,0,0),
};
#undef SIDP

static const engine_t ENG_SID = {''')

# SID's category index has one category letter per preset. SLOOP new preset
# categories: 7 basses, one lead, 2 pads, pluck, wind; CR: pad, bell,
# pluck, pad. Retain the original 32 category letters unchanged.
exact(pathlib.Path("firmware/src/browse.c"),
      '[3] = "OLBBBBBBLLLLLLLLPSPPGGKKUUERFFFF",',
      '[3] = "OLBBBBBBLLLLLLLLPSPPGGKKUUERFFFF" "BBBBBBBLPPUUPGPP",')

# Exercise the real Animal Jam third HOME page in the existing full host
# screen renderer, validate its text/no overlap and save 240x240 previews.
exact(pathlib.Path("tests/ui_render.c"),
      '    song_punch_sweep(out);',
      '''    for (uint32_t a = 0; a < PASTEL_ANIMALS; a++) {
        char name[32];
        snprintf(name, sizeof name, "animal_%u", a);
        cur_name = name;
        setup(S_HOME);
        pal(0);
        ui.home_pg = 2u;
        pastel_animal_selected = (uint8_t)a;
        pastel_animal_last_ms = fm1_ms;
        draw(-1);
        lint();
        write_ppm(out, "PASTEL", name);
    }
    cur_name = "animal_mono";
    setup(S_HOME); pal(UI_GRAY_INDEX);
    ui.home_pg = 2u; pastel_animal_selected = 0u;
    draw(-1); lint(); mono_check();
    song_punch_sweep(out);''')

shutil.copyfile(pathlib.Path(__file__).with_name("animal_test.c"),
                root / "tests/pastel_animal_test.c")
# Pastel v0.7: 128 ORIGINAL M-VAVE FM-1 DX7 voices in read-only program flash.
# Preserve original FM6 indices 0..24, including 24 = INIT VOICE. The
# factory voices append at indices 25..152, rather than pre-filling user slots.
# The ~16 KB voice ROM must NOT go into the almost-full .mres region.
exact(pathlib.Path("firmware/src/eng_fm6.c"),
      '#include "eng_fm6_rom.h"         /* FM6_ROM[FM6_NROM]: F9.. */',
      '#include "eng_fm6_rom.h"         /* FM6_ROM[FM6_NROM]: F9.. */\n'
      '#include "pastel_factory_voices.h"       /* appended original FM-1 factory bank; XIP, not .mres */')
exact(pathlib.Path("firmware/src/eng_fm6.c"),
      '''        uint8_t pk[FM6_PACKED], v[FP_SIZE + 1u];
        if (t->preset < FM6_NFAC)
            fm6_factory(t->preset, pk);
        fm6_unpack(t->preset < FM6_NFAC ? pk : FM6_INIT, v);   /* (past F24: INIT VOICE) */
        fm6_put_patch(tr, v, 1);''',
      '''        uint8_t pk[FM6_PACKED], v[FP_SIZE + 1u];
        const uint8_t *voice = FM6_INIT;
        if (t->preset < FM6_NFAC) {
            fm6_factory(t->preset, pk);
            voice = pk;
        } else if (t->preset > FM6_NFAC &&
                   t->preset < FM6_NFAC + 1u + PASTEL_FACTORY_COUNT) {
            voice = PASTEL_FACTORY_VOICES[t->preset - FM6_NFAC - 1u];
        }
        fm6_unpack(voice, v);
        fm6_put_patch(tr, v, 1);''')
exact(pathlib.Path("firmware/src/eng_fm6.c"),
      '};\n#undef FM6_PR\n_Static_assert(FM6_NROM == 16u,',
      '#include "pastel_factory_names.inc"\n};\n#undef FM6_PR\n_Static_assert(FM6_NROM == 16u,')
exact(pathlib.Path("firmware/src/eng_fm6.c"),
      '_Static_assert(NELEM(FM6_PRESETS) == FM6_NFAC + 1u, "FM6: F1..F24, then INIT VOICE");',
      '_Static_assert(NELEM(FM6_PRESETS) == FM6_NFAC + 1u + PASTEL_FACTORY_COUNT, "FM6: original 24 + INIT + 128 stock voices");\n'
      '_Static_assert(FM6_NFAC + 1u + PASTEL_FACTORY_COUNT <= 255u, "FM6 preset index must fit a byte");')
exact(pathlib.Path("firmware/src/browse.c"),
      'static const char *const PRESET_CAT[NENGINES] = {',
      '#include "pastel_factory_categories.h"\nstatic const char *const PRESET_CAT[NENGINES] = {')
exact(pathlib.Path("firmware/src/browse.c"),
      '[12] = "KEBRPEGUKRBEEKGSPLUEWEBEO",',
      '[12] = "KEBRPEGUKRBEEKGSPLUEWEBEO" PASTEL_FACTORY_CATEGORIES,')
# Pastel v0.8: Give the original factory sounds a fast, dedicated path.
# From Stage, SAVE now opens FM1 FACTORY (128) immediately on the normal
# PRESETS browser. Turn the existing PRESETS knob to hear sounds; tap SAVE
# again for USER and again for PROJECT. No new storage, engine IDs or bank
# formats are created. All previous LIST filters remain usable on KNOB 1.
#
# Add the new browse mode AFTER the existing persisted category ids so no
# previously stored favorite, category or list value is renumbered.
exact(pathlib.Path("firmware/src/browse.c"),
      '#define LM_N (LM_CAT + NELEM(CAT_ORDER))',
      '#define LM_FM1 (LM_CAT + NELEM(CAT_ORDER))\\n'
      '#define LM_N (LM_FM1 + 1u)')
exact(pathlib.Path("firmware/src/browse.c"),
      'list_lcat = (uint8_t)(m >= LM_CAT && m < LM_N ? CAT_ORDER[m - LM_CAT] : 0u);',
      'list_lcat = (uint8_t)(m >= LM_CAT && m < LM_FM1 ? CAT_ORDER[m - LM_CAT] : 0u);')
exact(pathlib.Path("firmware/src/browse.c"),
      'm >= LM_CAT && m < LM_N ? entry_cat(src, k) == CAT_ORDER[m - LM_CAT] : 0;',
      'm >= LM_CAT && m < LM_FM1 ? entry_cat(src, k) == CAT_ORDER[m - LM_CAT] : 0;')
exact(pathlib.Path("firmware/src/browse.c"),
      '    if (m == LM_RECENT) {\\n        for (i = 0; i < recent_n; i++) {',
      '''    if (m == LM_FM1) {
        /* Exactly the 128 built-in, read-only factory voices; no user slots.
         * Constant-time indexing, no traversal of the other engines.
         * Keep the upstream FM6 indices 0..24 unchanged. */
        uint32_t first = FM6_NFAC + 1u;
        *total = PASTEL_FACTORY_COUNT;
        if (n < PASTEL_FACTORY_COUNT) *as = ENGI_FM6, *ak = first + n;
        return ws == ENGI_FM6 && wk >= first &&
               wk < first + PASTEL_FACTORY_COUNT ? wk - first : PASTEL_FACTORY_COUNT;
    }
    if (m == LM_RECENT) {
        for (i = 0; i < recent_n; i++) {''')
exact(pathlib.Path("firmware/src/ui_browser.c"),
      'return m == LM_ALL ? "All" : m == LM_FAV ? "Faves" : m == LM_RECENT ? "Recent" :',
      'return m == LM_FM1 ? "FM1 FACTORY" : m == LM_ALL ? "All" : m == LM_FAV ? "Faves" : m == LM_RECENT ? "Recent" :')
exact(pathlib.Path("firmware/src/ui_browser.c"),
      'cv_text_on(12, ty_y(y + 42, lf), lf, ENGINES[eng_idx(e)]->name, out ? T_MID : hc, bg);',
      'cv_text_on(12, ty_y(y + 42, lf), lf, m == LM_FM1 ? "ORIGINAL FM-1" : ENGINES[eng_idx(e)]->name, out ? T_MID : hc, bg);')
# Preserve the standard SAVE -> USER -> PROJECT pages (SAVE again from the
# factory browser). MIDI-only tracks cannot load built-in synth sounds.
exact(pathlib.Path("firmware/src/ui.c"),
      'if (PAGES[i].graph == GR_USER) break;',
      'if (PAGES[i].graph == (ui.home && !trk_midi_slot(song.sel) ? GR_BROWSE : GR_USER)) break;')
exact(pathlib.Path("firmware/src/ui_input.c"),
      '    } else if (save == BT_TAP && !ui.confirm)\\n        open_family(FAM_SAVE);',
      '''    } else if (save == BT_TAP && !ui.confirm) {
        if (ui.home && !trk_midi_slot(song.sel))
            list_set(LM_FM1); /* instant, dedicated 128-sound factory browser */
        open_family(FAM_SAVE);
    }''')
# Host renderer must assert exact first/last factory index and exercise the
# actual firmware sound-selection path, not just render a fictional catalog.
exact(pathlib.Path("tests/ui_render.c"),
      '    song_punch_sweep(out);',
      '''    /* Pastel: first SAVE on Stage opens the actual 128-voice browser.
     * Exercise the selection path and render its real LCD pixels. */
    {
        uint32_t src, k, total;
        cur_name = "FM1 factory 128";
        setup(S_PRESETS); pal(0);
        list_set(LM_FM1);
        go_page(GR_BROWSE);
        assert(list_mode() == LM_FM1);
        list_scan(LM_FM1, 0xFFFFFFFFu, 0u, 0u, &src, &k, &total);
        assert(total == 128u && src == ENGI_FM6 && k == FM6_NFAC + 1u);
        list_scan(LM_FM1, 0xFFFFFFFFu, 0u, 127u, &src, &k, &total);
        assert(total == 128u && src == ENGI_FM6 && k == FM6_NFAC + 128u);
        draw(-1); lint(); write_ppm(out, "PASTEL", "factory_128_browser");
        browse_turn(EN_PRESET, 1);
        assert(TSEL->eng_req == ENGI_FM6 &&
               TSEL->preset == FM6_NFAC + 1u);
        draw(-1); lint(); write_ppm(out, "PASTEL", "factory_128_loaded");
    }
    song_punch_sweep(out);''')
print("Pastel v0.8 usability: SAVE from Stage -> FM1 FACTORY 128; PRESETS knob auditions; SAVE again -> USER and PROJECT. Factory indices preserved.")

# Pastel v0.7: upstream main-app build promotes -Os to -O2 for LLVM IR.
# This causes XIP overflow when the 128 built-in factory voices are present.
# Restore -Os to the main app IR pass, as the sound/ISR helpers were already
# developed for upstream -Os size targets. Do not move flash partitions or
# reduce the sample, animal, user-preset or project data.
exact(pathlib.Path("tools/build.py"),
      'irflags = [("-O2" if f == "-Os" else f) for f in flags if not f.startswith(("-I", "-D", "-W"))]',
      'irflags = [("-Os" if f == "-Os" else f) for f in flags if not f.startswith(("-I", "-D", "-W"))]')
print("Pastel v0.7: size-optimize compiled main application without changing the flash memory map.")
print("Pastel v0.7: all 128 original M-VAVE factory voices are selectable inside FM6 PRESETS, no separate import needed.")

print("Pastel v0.3 hybrid: Melodee/Felucca/ChoralRoot harmonies,"
      " SLOOP/ChoralRoot-inspired SID bank and real recorded Animal Jam sounds and original artwork.")
print("Pastel patch applied. Liquid Edition: animation and soft ribbon/splash customization; user synth engines and updater unchanged.")

