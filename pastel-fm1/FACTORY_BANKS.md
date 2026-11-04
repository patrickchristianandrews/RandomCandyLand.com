# Original M-VAVE FM-1 factory preset library — all 128 built into Pastel v0.7

Pastel v0.7 keeps the **ANIMAL KIT sequencer** and adds the **128 original M-VAVE FM-1 factory patches** directly as built-in FM6 sounds. The four-bank DX7 SysEx ZIP is optional.

These are **genuine recovered voices**, not newly approximated presets. Source: [KingParamount/fm1-factory-presets](https://github.com/KingParamount/fm1-factory-presets). Their provenance analysis identifies 126 byte-identical community DX7 patches, with additional origins documented in that project's credits. Do not claim these recordings and sounds were newly created for Pastel.

## Built into Pastel's FM6 browser (v0.7)

All 128 original M-VAVE DX7 voices are now built into firmware **as read-only FM6 factory presets**, not silently imported into occupied user slots. This approach keeps the first 24 original FM6 sounds and their existing **INIT VOICE** index 24 untouched. New factory sounds occupy indices **25–152** and can be chosen on the device through **PRESETS → FM6** (or the main categorized browser), assuming the new firmware has been successfully built, installed and checked.

The original factory voice bank occupies 16,384 bytes (128 voices × 128 bytes), plus preset names. Because the resource flash is nearly full with animal calls, sprite art and upstream audio, the new voices must live in **XIP program .rodata**, not in .mres. The firmware builder enforces app flash limits; if it fails to fit, do not flash an outdated binary marked v0.7.

The complete original four-bank `PastelFactory128.zip` remains available for backup, compatibility, and manual import into a different FM6-enabled firmware. **No ZIP import is required on Pastel v0.7**. A firmware update never writes into the existing 384 shared user sound slots.

## If you want to use the separate banks elsewhere

The optional ZIP contains four DX7-compatible SysEx banks:

- `FM-1_factory_bank1.syx`: piano, organ, lead, pad
- `FM-1_factory_bank2.syx`: guitar, electric guitar, bass, synth bass
- `FM-1_factory_bank3.syx`: brass, woodwind, string, voice
- `FM-1_factory_bank4.syx`: percussion, special effects

Back up first before importing them into **user** slots on another firmware. The built-in v0.7 sounds cannot overwrite user slots, but a manual import into occupied slots may replace them if confirmed. They are original packed DX7 VMEM records rendered by the FM6/Dexed-derived engine, which may sound somewhat different from stock V15.

### Animal Sequencer: ANIMAL KIT

1. In Pastel 0.6, select **DRUM → ANIMAL KIT** (seventh factory drum preset) on any synth track. Alternatively tap HOME twice from Stage to reach **ANIMAL SEQ**: it selects the animal kit for the active synth track without erasing the pattern.
2. **Play** any piano key: the eight animal recordings repeat across the keys. The animal graphics respond to the recorded sample that plays.
3. Select **SEQ → STEP** on that DRUM track. The standard drum grid now gives you eight named animal lanes — **Cat, Dog, Duck, Frog, Bird, Cow, Pig, Sheep** — and 64 steps per pattern. Tap steps to add/remove a real animal sound, with accents. Press **PLAY** to hear the sequence.
4. Press **REC**, play the animal keys live, and stop recording to capture the rhythm. Saved patterns, projects, MIDI notes, undo, swing and song sections use the existing Melodee sequencer; *no new incompatible song format*.
5. When ANIMAL SEQ is active, the animal graphic changes on recorded STEP playback as well as on key presses. Existing other drum sounds remain selectable.

**Audio requirements:** The animal recordings are in the firmware's separate `.mres` resource region. If FM-1 Swap's *TRY* emulator cannot supply the resource sound file or audio output, the emulator may show the screen without playing the recordings. On physical hardware, a complete resource install is required; **Finish setup** in the compatible installer if asked. A firmware image having passed host tests does not guarantee real hardware audio.

## Original firmware and safety

- M-VAVE stock V15 and Pastel are different firmware projects; use the correct backup and recovery guide for your actual bootloader before flashing.
- `FM-1_900` in a firmware package can differ from the connected device's identifier such as `FM-1_909`. Verify compatibility before using FLASH.
- Keep your old v0.4 firmware backup until v0.6 has been previewed and checked. Neither tool has been tested on real FM-1 hardware by this assistant.
