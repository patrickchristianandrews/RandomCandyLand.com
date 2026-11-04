# Pastel Liquid Edition v0.4 — FM-1 community hybrid

The build lives only in the `pastel-fm1` branch. The RandomCandyLand.com website on its normal branch was not changed.

## What is actually combined

| Source | Kept or integrated | What is not claimed |
| --- | --- | --- |
| Melodee 1.6.1 | Stable, pinned firmware foundation: sequencer, user sound storage, DX7-compatible FM6, Prophet-5, native CZ-1, SID, drums, chords, harmonies, audio/MIDI, device updater | The current build does not suddenly support every retired Melodee instrument ID |
| Felucca | Its shared lineage and parts of Melodee's modern keyboard/chord system | Not a byte-for-byte Felucca image |
| SLOOP | Original punch-FX features already present in Melodee, plus **12 newly voiced SID presets** interpreted from SLOOP's analog/lo-fi sound ideas | The incompatible SLOOP ANALOG and LOFI patch records are **not** simply copied into the SID engine; those would play incorrectly |
| ChoralRoot | ChoralRoot/Felucca-style chord inversions, scale-aware voicing, strum behavior already present in Melodee, plus **4 newly voiced SID chord-friendly sounds** | Its separate two-handed Orchid keybed operating system and ten-slot looper are **not** ported here |
| Pastel Liquid Edition | Pink/lavender palette, fluid waves, music-reactive bubbles, soft track droplets, Liquid Edition startup, third HOME page with animated animals | Not physical LED color changes or a literal video animation engine |

There are **16 new built-in community-inspired SID sounds** at the end of the SID preset list, numbered 33–48 (1-based). They are original parameter interpretations, not proprietary audio samples. The upstream engine-native **CZ-1**, **FM6** and **Prophet** built-in banks are retained to preserve working instrument compatibility; they are not the original M-VAVE stock V15 audio bank.

## New projects: a community mix

A new project starts with three sound roles pulled from the community-oriented palette: SLOOP-style 808, Melodee FM6 bass, and ChoralRoot-style chord pad, plus a drum kit. This does **not** overwrite your saved sounds or project templates; a user template can take precedence over the default project.

## ANIMAL JAM — play with the keys

1. Tap **HOME** to cycle **STAGE → CHORD WHEEL → ANIMAL JAM → STAGE**. The header has three page markers.
2. While ANIMAL JAM is displayed, press **any piano key**. Eight animals repeat from left to right across the 27-key keyboard. Key index modulo eight picks the species.
3. The selected character grows on the display and dances; the sound is played through the FM-1's own output (and the normal USB audio capture path when enabled). Overlapping calls use at most three voices.
4. Tap HOME again to leave the animal page. Buttons, MIDI functions and editing outside this special mode keep their original meaning.

| Animal | Sound concept |
| --- | --- |
| Cat | Actual short cat meow recording |
| Dog | Actual dog bark recording |
| Duck | Actual duck quack recording |
| Frog | Actual croaking frog recording |
| Bird | Actual crow call (caw) |
| Cow | Actual cow moo recording |
| Pig | Actual pig oink recording |
| Sheep | Actual sheep bleat recording |

All eight calls are **actual CC0 field recordings**, clipped to 0.35–0.95 seconds and encoded as 12 kHz mono IMA ADPCM to fit the fixed resource flash. They are not synthesized. The animals are rendered from **16 original colorful pixel-art frames** (eight animals × two dance poses), compressed as 4-bit nibble-RLE artwork. See [AUDIO_CREDITS.md](AUDIO_CREDITS.md) for sources and licenses.

## Install and safety

1. Download the real **Pastel.fwsc** binary from the [Pastel folder](https://github.com/patrickchristianandrews/RandomCandyLand.com/tree/pastel-fm1/pastel-fm1).
2. On Android FM-1 Swap: **SAVED → IMPORT → choose Pastel.fwsc → TRY**. In the virtual FM-1, select HOME until **ANIMAL JAM** appears, then test the keys.
3. If you choose FLASH, first back up your current device and check FM-1 Swap's supported bootloader compatibility. Use a USB-C **data cable**, a charged phone/device, and do not unplug while flashing.

The build is **not tested on a physical FM-1**. Updates are inherently risky and can require recovery. FM-1 Swap displays an ID from the firmware package (`FM-1_900`) which is different from the identity of a device connected to the app (for example `FM-1_909`).

## Reproducibility

- Upstream base: [Melodee v1.6.1](https://github.com/keremimo/melodee/tree/v1.6.1), pinned to commit `165d177a425944f3d30b0b669255a6ed0050c3a5`.
- Sound references: [SLOOP](https://github.com/isod89/sloop-fm1), [ChoralRoot](https://github.com/Quixotic7/ChoralRootFM1), [Felucca](https://github.com/hugelton/Felucca).
- [Source patch](patch.py), [real-animal ADPCM player](animal_audio.c), [source and CC0 credits](AUDIO_CREDITS.md), [recording packer](generate_animal_samples.py), [pixel-art packer](generate_animal_sprites.py), [animated screen](animal_view.c), and [host audio test](animal_test.c).
- Generated `Pastel.fwsc` is built, tested and published automatically on this branch by [GitHub Actions](../.github/workflows/pastel-fm1.yml).
- GPL-3.0-only terms and all upstream source notices remain applicable.

This is a compatible **hybrid of selected features**, not a single firmware containing all programs from every firmware project. Instrument IDs, project data, boot safety and update transport are deliberately not overwritten with conflicting formats.
