# Pastel v0.5 — LIQUID LIVE performance lab

A new **fourth HOME screen** makes Pastel feel like one playable, visual instrument rather than a collection of independently branded firmware programs. It is built on the same real Melodee/Felucca synthesis DSP and project data paths already in Pastel 0.4.

## How to get there on an FM-1 or in the full FM-1 Swap TRY preview

Tap **HOME** while on HOME to cycle:

**1. STAGE → 2. CHORD WHEEL → 3. ANIMAL JAM → 4. LIQUID LIVE → 1. STAGE**

On **LIQUID LIVE** the physical piano keys still play the selected real synth engine. This is deliberately different from Animal Jam, which redirects key presses to recorded animal calls. Music playing from the sequencer also drives Liquid Live's visualizer.

## Performance controls

| FM-1 control | What it does |
| --- | --- |
| **PRESET encoder** | Browse 24 hand-picked built-in sound programs from real Prophet, FM6, CZ-1, SID and synthesized drum engines. Changing the selected track's sound uses the existing undo-aware upstream engine loader; it does not silently erase saved user projects or replace engine identifiers. |
| **ALGORITHM encoder** | Pick a track as in the normal firmware. |
| **KNOB 1** | Select one of four animated visual modes. |
| **KNOB 2** | Edit the selected track's **real scale-aware CHORD mode** (OFF, diatonic, sevenths, fixed chords, AUTO, etc.), from the ChoralRoot/Melodee harmonic engine. This affects the notes you hear and can be captured by the existing motion system. |
| **KNOB 3** | Change the animation's flow / speed. |
| **KNOB 4** | Rotate the color-family selection. |
| **SELECT encoder** | Change the visual mode as a fast alternative to KNOB 1. |
| **Piano keys** | Continue to play the live synth and trigger reactive movement. |
| **PLAY** | Continue to control the sequencer normally. |

You can return to **PRESETS** for the entire native library, instead of only the hand-picked gallery. Saved projects and custom sound banks continue to use their existing file formats. Imported presets from unrelated firmware projects still need conversion — this display does not make incompatible sound engines automatically interchangeable.

## Four visual modes

- **LIQUID:** three shifting fluid layers and floating bubbles respond to playback levels.
- **PRISM:** rotating diamond geometry, criss-cross rays and changing dimensions pulse with the music.
- **ORBIT:** harmonic rings and little orbiting lights surround the live waveform.
- **STARFIELD:** patterned stars and shockwave rings form a music-reactive light show.

Each mode reads **real rendered audio history**, not a simulated music signal. Four display bands respect the 64-row maximum canvas in FM-1 hardware; no 240×240 framebuffer is allocated. LCD data throughput, power draw and CPU loading still require checking on a physical FM-1.

## What comes from each community project

- **Melodee / Felucca:** the actual Prophet-5 analog model, six-operator DX7-compatible FM6 engine, native Casio CZ-1, SID chiptune and drum synthesis, plus the existing multi-track sequencer, recorder, effects, real audio output and MIDI. This means instrument selection really changes the notes you play, rather than just renaming a patch.
- **SLOOP:** the existing live punch-FX lineage plus Pastel's separately voiced 12 SLOOP-inspired compatible SID tones.
- **ChoralRoot:** its existing upstream harmony/strum lineage and four compatible Pastel SID patch designs; the new **live chord knob** makes this functionality easy to reach.
- **FoMni / X0X:** inspiration for a playable, immediate performance layout and acid/drum emphasis; **their standalone firmware engines and separate interfaces have NOT been copied**.
- **Pastel:** original liquid visual effects, pixel-art Animal Jam, recorded animal calls, the curated native sound gallery, and the new four-scene interactive visualizer.

**Do not mistake this for a literal merger of all community firmware binaries.** The hardware has finite flash and memory, distinct engine IDs, different licenses, and incompatible project formats. Copying the firmware files together would make a broken and risky FM-1 image.

## Installation and release safety

The CI workflow compiles the actual firmware, runs audio/theme and full screen-render tests, and publishes `Pastel.fwsc` only on successful completion. The firmware is not verified on a physical FM-1.

In the [FM-1 Swap app](https://github.com/HyruleanHero1988/FM-1-Swap), use **SAVED → IMPORT → TRY** first to open the *full virtual FM-1*. Confirm the fourth HOME page works and its encoder controls respond before considering physical flashing. You must back up custom projects and have a recovery plan first.

Source: `pastel-fm1/live_lab.c`, `pastel-fm1/patch.py`, and upstream [Melodee v1.6.1](https://github.com/keremimo/melodee/tree/v1.6.1). GPL-3.0-only source and upstream third-party licenses apply.
