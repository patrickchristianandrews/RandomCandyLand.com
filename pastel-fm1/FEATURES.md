# Pastel FM-1 — feature selection and provenance

**Pastel v0.4 — Liquid Edition Hybrid / Real Animal Jam** is a focused, source-available custom firmware built from [Melodee 1.6.1](https://github.com/keremimo/melodee/tree/v1.6.1), in turn derived from [Felucca](https://github.com/hugelton/Felucca) with acknowledged, GPL-compatible [SLOOP](https://github.com/isod89/sloop-fm1) elements. It is not a binary splice of different incompatible systems.

## Selected features already implemented in Pastel's upstream core

| Area | Included implementation | Reason |
|---|---|---|
| Multi-engine instrument | Melodee active engines: FM6, Prophet-style virtual analog, native CZ-1, SID chip voices, synthesized drums; separately selectable legacy engines depend on compile flags | More musical flexibility than a single-engine FM patch editor |
| Full arrangement | Four internal tracks, four MIDI-only tracks, 16 patterns per internal track, 64 song sections | Actual song creation on the device |
| Live improvisation | 27 SLOOP-derived punch effects, synchronized performance, note echo/tail, effects rack | Responsive live controls without having to switch firmware |
| Recording | On-device recording, quantization, note-length and velocity editing, per-block sound selection, 32 projects | Groovebox and composition workflows |
| Musical assistance | AUTO/AUTO2 chords, strum/stroke, scale/root functions, MIDI learned controls | Fast melody and harmony creation |
| External connectivity | Bluetooth MIDI, TRS MIDI input, USB MIDI host support and USB stereo/stem capture | Phone and computer workflows |
| Safety and performance | Preserved upstream update protocol, boot safeguards, dual-core recovery, host tests | Cosmetic changes should not compromise the bootloader |
| Appearance | Pastel-branded boot screen, Pastel palette, Liquid Edition branding and ripple/bubble overlays on Stage | A flowing identity that celebrates the nickname Liquid without overwhelming the musician |
| Community sounds | 12 SLOOP-inspired and 4 ChoralRoot-inspired SID voices added after existing presets (16 total); community roles default for new projects | Compatible reinterpretations of their popular analog/lo-fi and chord-pad sounds |
| Animal Jam | A third HOME screen featuring eight dancing pastel animals with two original pixel-art poses and **real CC0 animal calls stored in resource flash** and keyboard mapping | Cute creative performance without replacing normal instrument notes on other screens |

## Why particular features were not copied

- The separate X0X firmware has its own 303/808/909 architecture. Porting its instruments into the current Melodee sound scheduler is a significant, separately testable DSP integration, not a firmware file merge.
- Baud Girl FM-1+VA and paid Groove OS do not provide unrestricted source licensing. Their code is not copied.
- M-VAVE official firmware V16's new capabilities should not be assumed to be available in Melodee (for example, its exact eight audio-part architecture): different storage layouts, engine APIs and DSP performance budgets apply.
- Other dedicated ambient, chord, and tracker firmwares were compared as design references; replicating all of their navigation would crowd the FM-1's 240×240 display.

These exclusions are intentional. Shipping unreviewed code from every project on hardware with limited RAM/flash increases crashes and data-loss risk.

## Sources

- Community project directory: https://github.com/cicloid/awesome-fm-1
- Independent comparison: https://dreyandersson.com/blog/m-vave-fm-1-custom-firmware/
- Selected code base: https://github.com/keremimo/melodee
- Existing SLOOP integration credits: https://github.com/keremimo/melodee/blob/v1.6.1/LICENSING.md
- Android phone updater: https://github.com/HyruleanHero1988/FM-1-Swap

**Limitations:** a successful compiler and test suite do not substitute for physical FM-1 testing. The main UI retains upstream Melodee's mature control architecture, and its stock M-VAVE V15 firmware sounds are not used. The hybrid adds a third HOME screen, recorded animal audio and compressed sprite artwork for Animal Jam and a selected community-inspired SID bank. Existing CZ-1, Prophet and FM6 engine-native built-in presets remain for compatibility. Physical LEDs and button hardware colors are unchanged. See [HYBRID.md](HYBRID.md) for exact provenance and limitations.

### Audio and visual improvements in v0.4
- Eight genuine CC0 recordings (cat, dog, duck, frog, crow, cow, pig and sheep), 12 kHz mono 4-bit IMA ADPCM; the file's resource payload is packaged with the firmware and works offline.
- Sixteen hand-directed custom chibi pixel-art frames, two dancing poses per animal; pastel coloring, bubble/ripple backgrounds and music-reactive motion.
- [Source credits](AUDIO_CREDITS.md). No stock M-VAVE sounds are used for the animal voices. Physical-hardware listening/animation testing remains outstanding.
