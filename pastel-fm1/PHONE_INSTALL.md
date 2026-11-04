# Pastel FM-1 — Android phone installation

**Pastel.fwsc is the firmware file. Do not unzip or rename it.** An M-VAVE FM-1 uses USB-MIDI firmware transfer, not drag-and-drop file sync or Bluetooth.

1. Open the [Pastel branch folder](https://github.com/patrickchristianandrews/RandomCandyLand.com/tree/pastel-fm1/pastel-fm1) and choose **Pastel.fwsc**, then **Download raw file** to the Android phone. If the file does not yet exist, the firmware builder has not finished and there is nothing safe to flash.
2. On your Android phone install **FM-1 Swap**, version 0.6.2 or newer, from the author's [official release page](https://github.com/HyruleanHero1988/FM-1-Swap/releases/tag/v0.6.2) or [instructions](https://hyruleanhero1988.github.io/FM-1-Swap/).
3. Fully charge the FM-1. Connect the FM-1 to the phone with a proven **USB-C data cable** with Android host/OTG support. Accept the USB MIDI device prompt.
4. Open **FM-1 Swap → SAVED → IMPORT**, choose **Pastel.fwsc** from Downloads. Confirm it appears in SAVED as the custom firmware.
5. First tap **TRY** to preview the firmware on the phone's virtual FM-1. Then tap **FLASH**, read the backup and warning prompts, and confirm the correct device identity.
6. Keep both devices powered and the cable untouched until the firmware write and restart are completely finished. Screen should show **PASTEL** on a successful boot.

**Risk:** a custom firmware flash can make the FM-1 unbootable. A backup from your current firmware is essential if you want to keep presets/projects. From a current Melodee installation, migrating to a stock firmware or an unrelated custom OS may erase incompatible project formats. Know your existing firmware and have a computer-based recovery plan before flashing. A successful CI build / emulator test is not real-hardware validation. In particular, first-time bootloader installation has more risk.

The custom firmware source is derived from [Melodee 1.6.1](https://github.com/keremimo/melodee/tree/v1.6.1) under GPL-3.0-only. Other firmware authors' brand names do not imply endorsement.
