# Pastel FM-1 — Liquid Edition v0.8 — Instant Factory 128 + Animal Sequencer · Android phone installation

**Pastel.fwsc is the firmware file. Do not unzip or rename it.** An M-VAVE FM-1 uses USB-MIDI firmware transfer, not drag-and-drop file sync or Bluetooth.

1. Open the [Pastel branch folder](https://github.com/patrickchristianandrews/RandomCandyLand.com/tree/pastel-fm1/pastel-fm1) and choose **Pastel.fwsc**, then **Download raw file** to the Android phone. If the file does not yet exist, the firmware builder has not finished and there is nothing safe to flash.
2. On your Android phone install **FM-1 Swap**, version 0.6.2 or newer, from the author's [official release page](https://github.com/HyruleanHero1988/FM-1-Swap/releases/tag/v0.6.2) or [instructions](https://hyruleanhero1988.github.io/FM-1-Swap/).
3. Fully charge the FM-1. Connect the FM-1 to the phone with a proven **USB-C data cable** with Android host/OTG support. Accept the USB MIDI device prompt.
4. Open **FM-1 Swap → SAVED → IMPORT**, choose **Pastel.fwsc** from Downloads. Confirm it appears in SAVED as the custom firmware.
5. First tap **TRY** to preview the firmware on the phone's virtual FM-1. On the virtual FM-1, press **HOME** twice to reach **ANIMAL JAM**; press the piano keys to see the eight dancing animals and hear their real recorded calls. Then, if satisfied and compatible, tap **FLASH**, read the backup and warning prompts, and confirm the correct device identity.
6. Keep both devices powered and the cable untouched until the firmware write and restart are completely finished. Screen should show **PASTEL**, **LIQUID EDITION**, and the **ANIMAL JAM** third HOME screen (HOME cycles Stage → Chord Wheel → Animal Jam), plus moving pastel wave graphics on a successful boot.

**Risk:** a custom firmware flash can make the FM-1 unbootable. A backup from your current firmware is essential if you want to keep presets/projects. From a current Melodee installation, migrating to a stock firmware or an unrelated custom OS may erase incompatible project formats. Know your existing firmware and have a computer-based recovery plan before flashing. A successful CI build / emulator test is not real-hardware validation. In particular, first-time bootloader installation has more risk.

The custom firmware source is derived from [Melodee 1.6.1](https://github.com/keremimo/melodee/tree/v1.6.1) under GPL-3.0-only. Other firmware authors' brand names do not imply endorsement.

For the exact limits of the SLOOP/ChoralRoot feature hybrid, see [HYBRID.md](HYBRID.md).

**v0.4 check:** The firmware download should be approximately **698 KB**, not the old ~669 KB v0.3. Remove the older imported copy from FM-1 Swap if you can't tell which is which, and IMPORT the freshly downloaded file. The updated firmware says **Pastel v0.4** in its menu. Always TRY before FLASH; device hardware is untested.

**v0.7:** After a verified successful new build and firmware installation, choose **PRESETS → FM6** on the device to play the original 128 M-VAVE FM-1 factory voices directly. No ZIP or SysEx import is needed. Original FM6 indices 0–24 and user sounds are preserved; 128 new sounds begin at index 25. The firmware is not hardware-validated; always TRY and back up before FLASH. The updater's firmware version should say Pastel v0.7; do not install an older download expecting built-in presets.

**Instant original presets (v0.8):** On the Stage screen, press **SAVE** once to open **FM1 FACTORY**. Turn the physical **PRESETS** encoder to preview the 128 original voices directly, shown as 1/128 through 128/128. Press **OCT+** to keep the sound and return home. Press **SAVE again** from this browser to open USER preset storage; subsequent presses reach PROJECT. These are built into the firmware: no separate SysEx import or external app setup is needed. This only works after downloading and installing a *verified published v0.8* binary. Other engines remain in LIST → ALL.
