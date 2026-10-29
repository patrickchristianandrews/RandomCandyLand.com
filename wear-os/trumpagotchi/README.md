# Trumpagotchi — Pixel Watch (Wear OS)

A standalone, offline native Wear OS version of the FM-1-inspired Trumpagotchi pet from Random Candy Land.

- Includes Feed, Praise, Clean, Rest, Watch News, Cheer Him On, and a five-key playable pentatonic mini keyboard (C, D, E, G, A) with a full-tune button.
- Animated 240×240-style pixel-art LCD, four live needs, day/night, bedtime, cartoon messes, and mood-dependent behavior.
- Original pentatonic melody with bongo accompaniment when happy. Audio runs without network access.
- Autosaves locally and does **not** decay while the app is closed.
- No account, network permissions, or phone companion required.
- A native Android app: the FM-1 firmware itself is not installed or emulated.

**Source:** GPL-3.0-only adaptation from https://github.com/adamcharleswilsonmusic-code/Trumpagotchi (v1.0.0), combined with original Android UI/audio code.

## Install

Download `Trumpagotchi-PixelWatch-debug.apk` from the repository's `watch-apks` directory after the GitHub workflow finishes, or from its GitHub Actions workflow artifacts. Transfer and sideload it to a Pixel Watch using Wear Installer 2 (on the phone), or use ADB wireless debugging. The APK is signed with a debug key, intended for personal testing, not the Play Store.

## Build

In `wear-os/trumpagotchi` use Gradle 8.9 and Android SDK 35:

```sh
gradle :app:assembleDebug
```

Output: `app/build/outputs/apk/debug/app-debug.apk`.

The source folder is separate from the existing site, which is not modified by the watch build.
