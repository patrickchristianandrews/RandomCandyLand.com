# Original M-VAVE FM-1 factory preset library — all 128 sounds

Pastel 0.6 includes an **ANIMAL KIT sequencer** as a real selectable DRUM preset. The **128 original M-VAVE FM-1 factory patches** are supplied separately as **four 32-voice DX7 SysEx banks** in `PastelFactory128.zip`.

These are **genuine recovered voices**, not newly approximated presets. Source: [KingParamount/fm1-factory-presets](https://github.com/KingParamount/fm1-factory-presets). Their provenance analysis identifies 126 byte-identical community DX7 patches, with additional origins documented in that project's credits. Do not claim these recordings and sounds were newly created for Pastel.

## Why the 128 voices are an extra bank download

Pastel/Melodee already contains extensive Prophet, FM6, CZ-1, SID and synthesized drum preset banks *and* about 29 KB of eight recorded animal calls with about 9 KB of animal sprites. The separate resource flash is essentially full (Pastel 0.4: 83,244 bytes out of ~86,016 bytes). Adding 16,384 bytes of original FM-1 DX7 patch bytes directly would cross the device's protected flash layout.

The correct safe solution is to make all 128 available as a **one-time import** into Melodee's shared user preset slots. These slots have room for 384 voices across the engines, **subject to whatever is already saved**. Importing does not replace the built-in factory patches. It is not safe to prefill the user's 384 slots without consent.

## How to add all 128 to your FM-1

1. Download `PastelFactory128.zip` from this folder (after the next build succeeds). Unzip it into the four files:
   - `FM-1_factory_bank1.syx`: piano, organ, lead, pad
   - `FM-1_factory_bank2.syx`: guitar, electric guitar, bass and synth bass
   - `FM-1_factory_bank3.syx`: brass, woodwind, string, voice
   - `FM-1_factory_bank4.syx`: percussion, special effects
2. **Back up your existing projects and sounds first.** An existing user preset slot will not be overwritten silently by this firmware update. However, manually importing into occupied slots can replace those slots if you confirm it.
3. Open the Melodee-compatible **web editor** in a browser with WebMIDI support (desktop Chrome/Edge is most reliable). Connect your USB-C **data cable** to the FM-1.
4. In the **User presets** panel, select the **FM6** preset collection if offered, and **Import .syx**. Select bank1 and confirm its 32 imported tones. Choose enough **empty** destinations to preserve existing sounds; use the editor's occupied-slot confirmations to avoid overwrites. Repeat for bank2, bank3 and bank4.
5. Disconnect safely. On the FM-1, turn **PRESETS** and choose FM6. The new voices appear as user FM6 presets after the standard built-ins. They are genuine DX7 voice data rendered by Melodee's FM6/Dexed-like engine. Sound may differ slightly from stock V15 due to engine and effects calibration.

**Important:** A regular firmware flash does not automatically import these user presets, because doing so could erase someone's existing library. The `PastelFactory128.zip` file is the full 128-voice source library, not a firmware update. Each voice is a 128-byte packed DX7 record; each bank is a 4,104-byte standard DX7 SysEx file. The four source file Git blob hashes are verified in the GitHub build before the ZIP is published.

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
