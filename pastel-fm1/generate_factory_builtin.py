#!/usr/bin/env python3
# SPDX-License-Identifier: GPL-3.0-only
"""Embed all 128 original FM-1 DX7 voices as built-in, read-only FM6 sounds.

The original 4 x 32-voice banks are supplied by KingParamount/fm1-factory-presets.
Their Git blob IDs are checked before use. This generator does not import into
or change any user's mutable preset slots, does not modify the flash data-region
layout, and leaves preset index 24 (INIT VOICE) unchanged.
"""
from pathlib import Path
import hashlib
import sys

EXPECTED = (
    "ccbe58b1e1c1a425d599f50994e2ecc6a739d841",
    "1948a797654002ca3a1a8f18d460252408f8ac57",
    "97b0a553090a5db7e3579d6e32294a35c6d22513",
    "043937bfc2b262795646100edffda619ac888fe3",
)

def git_blob(data):
    return hashlib.sha1(b"blob " + str(len(data)).encode() + b"\0" + data).hexdigest()

def label(data, n):
    name = "".join(chr(x) if 32 <= x < 127 else " " for x in data[118:128]).strip()
    return name or f"FM1 {n:03d}"

def category(name):
    s = name.upper()
    def has(*tokens):
        return any(word in s for word in tokens)
    if has("PIANO", "EP", "E.P", "CLAV", "HARPSI", "RHODES", "TINE", "KEY"):
        return "K"
    if has("ORGAN", "DRAWBAR", "CHURCH", "ACCORD"):
        return "G"
    if has("BASS", "SUB", "REES"):
        return "B"
    if has("PAD", "CHOIR", "VOICE", "VOX", "AHH", "AAH", "ATMOS"):
        return "P"
    if has("LEAD", "SOLO", "SYNC"):
        return "L"
    if has("BRASS", "HORN", "TRUMP", "TROMB"):
        return "R"
    if has("STRING", "CELLO", "VIOLIN", "VIOLA"):
        return "S"
    if has("GUITAR", "HARP", "PLUCK", "KOTO", "SITAR"):
        return "U"
    if has("FLUTE", "SAX", "REED", "OBOE", "CLAR", "WIND"):
        return "W"
    if has("BELL", "CHIME", "MARIMBA", "XYLO", "VIB", "MALLET"):
        return "E"
    if has("DRUM", "PERC", "SNARE", "TOM", "KICK", "CONGA"):
        return "D"
    if has("FX", "NOISE", "SFX", "LASER", "RING"):
        return "F"
    return "O"

def main():
    if len(sys.argv) != 3:
        raise SystemExit("usage: generate_factory_builtin.py <bank_directory> <firmware_src_directory>")
    banks, dest = map(Path, sys.argv[1:])
    records = []
    for index, expected in enumerate(EXPECTED, 1):
        p = banks / f"FM-1_factory_bank{index}.syx"
        data = p.read_bytes()
        if git_blob(data) != expected:
            raise SystemExit(f"{p}: original factory bank fingerprint mismatch")
        if len(data) != 4104 or data[:2] != bytes((0xf0, 0x43)) or data[3:6] != bytes((0x09, 0x20, 0x00)) or data[-1] != 0xf7:
            raise SystemExit(f"{p}: expected a standard Yamaha 32-voice bulk SysEx bank")
        payload = data[6:4102]
        if len(payload) != 4096 or (sum(payload) + data[4102]) % 128:
            raise SystemExit(f"{p}: invalid Yamaha bank checksum")
        for offset in range(0, 4096, 128):
            voice = payload[offset:offset+128]
            if len(voice) != 128 or any(x >= 128 for x in voice):
                raise SystemExit(f"{p}: invalid packed 7-bit DX7 voice")
            records.append(voice)
    assert len(records) == 128

    dest.mkdir(parents=True, exist_ok=True)
    lines = [
        "/* Generated from verified original M-VAVE FM-1 DX7 banks.",
        " * This array intentionally resides in XIP program .rodata, NOT in .mres",
        " * (the audio/animal resource flash is nearly full). Never write into user slots.",
        " * Original preset indices 0..24 remain unchanged. */",
        "#pragma once",
        "#define PASTEL_FACTORY_COUNT 128u",
        "static const uint8_t PASTEL_FACTORY_VOICES[PASTEL_FACTORY_COUNT][128] = {",
    ]
    for rec in records:
        lines.append("    {" + ", ".join(f"0x{x:02x}" for x in rec) + "},")
    lines.append("};")
    (dest / "pastel_factory_voices.h").write_text("\n".join(lines) + "\n", encoding="ascii")

    names = []
    cats = []
    for n, voice in enumerate(records, 1):
        name = label(voice, n)
        cats.append(category(name))
        escaped = name.replace("\\", "\\\\").replace('"', '\\"')
        names.append(f'    FM6_PR("{escaped}", 0), /* M-VAVE FM-1 #{n:03d} */')
    (dest / "pastel_factory_names.inc").write_text("\n".join(names) + "\n", encoding="ascii")
    (dest / "pastel_factory_categories.h").write_text(
        "/* 128 categories correspond to the exact order of built-in FM-1 DX7 voices. */\n"
        '#define PASTEL_FACTORY_CATEGORIES "' + "".join(cats) + '"\n', encoding="ascii")
    assert len(cats) == len(names) == 128
    print("Pastel: embedded 128 authenticated FM-1 DX7 factory voices into read-only firmware code")
    print("Existing FM6 presets 0-24 preserved, new presets 25-152; mutable user slots untouched")

if __name__ == "__main__":
    main()
