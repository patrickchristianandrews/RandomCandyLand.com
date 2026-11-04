# Pastel FM-1 — v0.4 · Liquid Edition / Real Animal Jam

**Status:** custom pastel-themed Melodee 1.6.1 derivative, now with Liquid Edition animation, an interactive Animal Jam screen, and SLOOP/ChoralRoot-inspired presets. Source overlay and GitHub build workflow. NOT hardware tested.

The firmware retains a full-featured multi-engine instrument rather than trying to concatenate incompatible firmware binaries:
- Melodee active engines: FM6/DX7-style, Prophet virtual analog, native CZ-1, SID chiptune, synthesized drums, plus MIDI. Additional retired legacy engines are not enabled by default.
- Four local synth parts + four MIDI-only tracks, 64 song sections, 16 patterns per local track, and 32 project slots.
- SLOOP-derived live punch effects (27 types), shared effects routing, note automation, quantized recording, chord harmonies and strums.
- USB stereo audio or four-track capture, USB-host MIDI (hardware support varies), TRS MIDI input and Bluetooth MIDI.
- New default **Pastel** 240 x 240 LCD theme: blush pink background, rose/lavender cards, deep-plum legible labels, four coordinated instrument colors.
- **Liquid Edition:** flowing pastel ribbons on the Stage audio strip, music-reactive fluid displacement, drifting bubbles, watery underlay beneath knob visuals, soft droplets in track cards, and animated-style splash graphics with **LIQUID EDITION** beneath PASTEL. Lightweight integer math and no additional audio processing.
- **ANIMAL JAM**, a third HOME screen: eight animated pastel animals dance in two original pixel-art poses and trigger short real CC0 field recordings when any of the 27 physical keys is pressed. HOME cycles **Stage → Chord Wheel → Animal Jam**.
- **16 new community-inspired SID presets**: 12 SLOOP-style bass/lead/pad/pluck sounds and 4 ChoralRoot-style chord-friendly sounds, recreated for the supported SID engine rather than copying incompatible patch data.
- New projects default to SLOOP-style 808, Melodee FM6 bass, ChoralRoot-style pad, and a synthesized drum kit. Existing saved projects and templates are not erased.
- Boot screen and on-device About name: Pastel — Liquid Edition.

**This is NOT** a complete port of every community instrument or the separate ChoralRoot two-handed keybed/looper, and it does **not** change the fixed-color hardware LEDs. The liquid effect is screen-rendered, not a change to the firmware's audio engine or physical hardware. "Pastel" reuses Melodee's audio, MIDI, arranger and resilience code. No proprietary or paid firmware has been copied.

## Firmware binary
After the GitHub build succeeds, the workflow publishes `pastel-fm1/Pastel.fwsc` to this **pastel-fm1** branch. Use only that actual *.fwsc* file (not this Python source or a ZIP of source) for flashing. The workflow also provides a "packages" build artifact with a SHA-256 checksum.

## Install using an Android phone
1. Install **FM-1 Swap** from its official GitHub releases: find it in https://github.com/cicloid/awesome-fm-1 under "Firmware update and recovery". Its Android APK installs community `.fwsc` via USB MIDI.
2. Download `Pastel.fwsc` to your phone, then use a reliable USB-C **data** cable to connect the FM-1 directly to your phone (Android USB OTG / USB host).
3. In **FM-1 Swap → SAVED → IMPORT**, select `Pastel.fwsc`, then **TRY** to preview it on your phone. Press HOME twice in the virtual FM-1 to check ANIMAL JAM. Back up presets/projects and only use **FLASH** if device compatibility and recovery risks are understood and power/cable are stable.
4. Do not unplug, switch apps or let the phone sleep during transfer. First boot may take longer. Confirm the LCD splash says "PASTEL".

A plain USB cable does not enable Bluetooth firmware updates; this is **USB** flashing. The file must not be copied to the synth as if it were a storage drive.

## Recovery and compatibility
The FM-1 uses single-bank flash. Custom firmware can brick it. BACK UP first. Some newer factory V16 devices should be transitioned using a compatible recovery/installer path; don't assume a V15-only patcher accepts V16. Read the [Melodee README](https://github.com/keremimo/melodee), the [boot safety guide](https://github.com/keremimo/melodee/blob/v1.6.1/docs/BOOT-SAFETY.md), and the [community recovery guide](https://github.com/cicloid/awesome-fm-1#firmware-update-and-recovery) before installing. To return to stock use the verified M-VAVE release, not a renamed file.

## Reproducible source and licenses
Upstream source: https://github.com/keremimo/melodee , tag `v1.6.1`, commit `165d177a425944f3d30b0b669255a6ed0050c3a5`.
Apply `pastel-fm1/patch.py` to an exact source checkout. GPL-3.0-only and upstream third-party notices apply. The GitHub workflow makes the file with JieLi's toolchain and SDK (which it downloads separately), and runs upstream host/UI tests. A passing build does not prove real-hardware safety.

Not associated with M-VAVE, Melodee, Hügelton Instruments, or their authors. Retain original source attribution.

## Community hybrid details and keyboard map
For the exact sound list, source attribution, included features and limits, see **[HYBRID.md](HYBRID.md)** and [FEATURES.md](FEATURES.md). Animal Jam uses **eight real CC0 recorded animal calls**, not imitation tones; the samples are stored in the FM-1's dedicated resource flash as 12 kHz IMA ADPCM. The colorful artwork is 16 custom pixel-art frames and is displayed in compact bands. See [AUDIO_CREDITS.md](AUDIO_CREDITS.md).

**Real animal-audio build:** the 29.4 KB CC0 IMA ADPCM pack occupies spare validated resource flash; 16 animal art frames are nibble-RLE compressed (8.7 KB). The last automated build passed LCD, audio and updater checks. Source code was not tested on physical FM-1 hardware.
