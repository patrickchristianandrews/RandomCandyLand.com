#!/usr/bin/env python3
# SPDX-License-Identifier: GPL-3.0-only
"""Pastel 0.6: wire actual animal samples into Melodee's real drum sequencer.

Run AFTER patch.py on pinned Melodee v1.6.1; all changes are exact-match,
fail-closed source patches. Preserve project structures and original engines.
"""
import pathlib
import sys

root=pathlib.Path(sys.argv[1]).resolve()
def exact(path,old,new):
    p=root/path
    s=p.read_text()
    n=s.count(old)
    if n!=1:raise RuntimeError(f"{path}: expected one match, found {n}: {old[:85]!r}")
    p.write_text(s.replace(old,new))
    print(f"Animal sequencer: {path}")

# Load the audio player in engines.c so host test renders and device firmware
# both expose the same eight real recorded calls before DRUM and UI sources.
exact("firmware/src/seq.c",
      '#include "pastel_animal_audio.c"\n#define KB_SILENT 255u',
      '#define KB_SILENT 255u')
exact("firmware/src/engines.c",
      '#include "dsp.c"\n#include "audio_batch.h"',
      '#include "dsp.c"\n#include "audio_batch.h"\n#include "pastel_animal_audio.c"')
# No bypass / audition-only keyboard! Ordinary note-on now reaches REC and
# the real step grid, including live MIDI and saved project patterns.
exact("firmware/src/seq.c",
      '            if (pastel_animal_active) {           /* Animal Jam: keys call animals, not the song */\n'
      '                kb_note[k] = KB_SILENT;\n'
      '                pastel_animal_hit(k);\n'
      '                continue;\n'
      '            }\n',
      '')

# Eight GM drum lanes -> eight recorded animals, no new sequencer format.
# The 808/909/SID/CR78/FM kits and their stored identifiers remain intact.
exact("firmware/src/eng_drum.c",
      'enum { DK_808 = 4, DK_909 = 5, DK_SID = 6, DK_CR78 = 7, DK_FM = 8 };',
      'enum { DK_808 = 4, DK_909 = 5, DK_SID = 6, DK_CR78 = 7, DK_FM = 8, DK_ANIMAL = 9 };')
exact("firmware/src/eng_drum.c",
      'static int drum_is909(const track_t *t)',
      'static int drum_isanimal(const track_t *t) { return t->p[P_E0] == DK_ANIMAL; }\n'
      'static int drum_is909(const track_t *t)')
exact("firmware/src/eng_drum.c",
      'return t->p[P_E0] >= DK_CR78; }',
      'return t->p[P_E0] >= DK_CR78 && !drum_isanimal(t); }')
exact("firmware/src/eng_drum.c",
      'return t->p[P_E0] >= DK_SID; }',
      'return t->p[P_E0] >= DK_SID && !drum_isanimal(t); }')
exact("firmware/src/eng_drum.c",
      'static uint32_t drum_bytes(const track_t *t) { return drum_is909(t)',
      'static uint32_t drum_bytes(const track_t *t) { return drum_isanimal(t) ? 0u : drum_is909(t)')
exact("firmware/src/eng_drum.c",
      'static const char *const N_DRUM_KIT[] = {"808", "808", "808", "808", "808", "909", "SID", "CR78", "FM"};',
      'static const char *const N_DRUM_KIT[] = {"808", "808", "808", "808", "808", "909", "SID", "CR78", "FM", "ANIMAL"};')
exact("firmware/src/eng_drum.c",
      'static const uint8_t DRUM_SOUND_NOTE[16]={',
      'static const uint8_t PASTEL_ANIMAL_NOTES[8]={36,38,39,42,46,45,37,56};\n'
      'static const uint8_t DRUM_SOUND_NOTE[16]={')
exact("firmware/src/eng_drum.c",
      'static uint32_t drum_sound_count(const track_t *t){return drum_is909(t)?D9_NUM:16u;}',
      'static uint32_t drum_sound_count(const track_t *t){return drum_isanimal(t)?8u:drum_is909(t)?D9_NUM:16u;}')
exact("firmware/src/eng_drum.c",
      'static uint32_t drum_sound_note(const track_t *t,uint32_t sound){return !drum_is909(t)',
      'static uint32_t drum_sound_note(const track_t *t,uint32_t sound){if(drum_isanimal(t))return PASTEL_ANIMAL_NOTES[sound&7u];return !drum_is909(t)')
exact("firmware/src/eng_drum.c",
      'static uint32_t drum_mpc_note(const track_t *t, uint32_t pad)\n{',
      'static uint32_t drum_mpc_note(const track_t *t, uint32_t pad)\n{\n    if(drum_isanimal(t))return PASTEL_ANIMAL_NOTES[pad&7u];')
exact("firmware/src/eng_drum.c",
      'static uint32_t drum_sound_of(const track_t *t,uint32_t note)\n{',
      'static uint32_t drum_sound_of(const track_t *t,uint32_t note)\n{\n    if(drum_isanimal(t))return drum_lane(note);')
exact("firmware/src/eng_drum.c",
      'static uint32_t drum_sound_step(const track_t *t,uint32_t sound,int32_t delta)\n{',
      'static uint32_t drum_sound_step(const track_t *t,uint32_t sound,int32_t delta)\n{\n    if(drum_isanimal(t))return (uint32_t)clamp((int32_t)sound+delta,0,7);')
exact("firmware/src/eng_drum.c",
      'static const char *drum_sound_name(const track_t *t,uint32_t sound){return',
      'static const char *drum_sound_name(const track_t *t,uint32_t sound){if(drum_isanimal(t))return pastel_animal_names[sound&7u];return')
exact("firmware/src/eng_drum.c",
      'static const char *drum_lane_name(const track_t *t, uint32_t l)\n{',
      'static const char *drum_lane_name(const track_t *t, uint32_t l)\n{\n    if(drum_isanimal(t))return pastel_animal_names[l&7u];')
exact("firmware/src/eng_drum.c",
      'static const char *drum_lane_abbr(const track_t *t, uint32_t l)\n{',
      'static const char *drum_lane_abbr(const track_t *t, uint32_t l)\n{\n    if(drum_isanimal(t))return pastel_animal_abbr[l&7u];')
exact("firmware/src/eng_drum.c",
      'static int32_t drum_keys(const track_t *t, uint32_t k)\n{',
      'static int32_t drum_keys(const track_t *t, uint32_t k)\n{\n    if(drum_isanimal(t))return PASTEL_ANIMAL_NOTES[k&7u];')
exact("firmware/src/eng_drum.c",
      '    {"FM KIT", {DK_FM, 64, 64, 64, 64, 100, 0, 0}, {0, 100, 127, 100}, 0, 0},',
      '    {"FM KIT", {DK_FM, 64, 64, 64, 64, 100, 0, 0}, {0, 100, 127, 100}, 0, 0},\n'
      '    {"ANIMAL KIT", {DK_ANIMAL, 64, 64, 64, 64, 100, 0, 0}, {0, 100, 127, 100}, 0, 0},')
exact("firmware/src/eng_drum.c",
      '{"KIT", F_ENUM, DK_808, DK_FM, DK_808, N_DRUM_KIT, 0}',
      '{"KIT", F_ENUM, DK_808, DK_ANIMAL, DK_808, N_DRUM_KIT, 0}')
exact("firmware/src/browse.c",
      '[10] = "DDDDDD",',
      '[10] = "DDDDDDD",')
# Both live MIDI/keys and recorded grid steps go through trk_note_on.
# Trigger a recorded sample before normal drum voice allocation. Voice-off
# remains harmless. The Stage's existing lane activity indicator still flashes.
exact("firmware/src/voice.c",
      'static void trk_note_on(track_t *t, uint32_t note, uint32_t vel)\n{\n    if (midi_track_only(t)) {',
      'static void trk_note_on(track_t *t, uint32_t note, uint32_t vel)\n'
      '{\n    if (t->eng_req == ENGI_DRUM && drum_isanimal(t)) {\n'
      '        if (vel) {\n'
      '            uint32_t lane=drum_lane(note);\n'
      '            pastel_animal_hit_lane(lane);\n'
      '            drum_flash[(uint32_t)(t-trk)%NTRK] |= (uint8_t)(1u<<lane);\n'
      '        }\n'
      '        return;\n'
      '    }\n'
      '    if (midi_track_only(t)) {')
# Entering HOME > ANIMAL SEQ deliberately chooses the dedicated kit. This
# loads a sound only; the existing pattern/notes remain untouched.
exact("firmware/src/ui_input.c",
      'ui.home_pg = (uint8_t)((ui.home_pg + 1u) % 3u); /* Stage, chord wheel, animals */',
      'ui.home_pg = (uint8_t)((ui.home_pg + 1u) % 3u); /* Stage, chord wheel, animal sequencer */\n'
      '        if(ui.home_pg == 2u && !trk_midi_slot(song.sel))\n'
      '            engine_load_of(TSEL, ENGI_DRUM, 6u);')
exact("firmware/src/ui_draw.c",
      'str_cpy(b, "ANIMALS", 16);',
      'str_cpy(b, "ANIMAL SEQ", 16);')
# New-project fourth part is the ANIMAL KIT; user templates and existing
# saved songs override initial defaults just as before.
exact("firmware/src/engines.c",
      'static const uint8_t TRK_DEF[NPART][2] = {{3u, 32u}, {ENGI_FM6, 10u}, {3u, 44u}, {ENGI_DRUM, 0u}};',
      'static const uint8_t TRK_DEF[NPART][2] = {{3u, 32u}, {ENGI_FM6, 10u}, {3u, 44u}, {ENGI_DRUM, 6u}};')
print("Pastel 0.6 ANIMAL KIT: 8 real recorded drum-grid lanes, live recording, step playback, MIDI and songs.")
