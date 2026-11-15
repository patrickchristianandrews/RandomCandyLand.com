# Holiday Deal Madness 2026 — Android

This is the **native Android** client for Random Candy Land's Black Friday & Cyber Monday **2026** experience. This is NOT simply a full-screen WebView of the website.

## User experience

- Dedicated Android browsing tabs for **Hot / All / Upcoming / Saved**.
- Search products and filter by category; sort by recency, price, or publisher popularity signals.
- Source-attributed, time-labeled deals from `https://randomcandyland.com/black-friday/live-feed.json`.
- Separate official announced 2026 Black Friday / Cyber Monday event schedules and full web catalog links.
- Save favorite deals locally, share a deal, and open its original source in a browser.
- Offline cached feed with visible last-sync time; network failures don't invent a live price.
- Tidbit and Sugarfight make occasional optional, dismissible deal remarks. Their art is user-supplied.

## How to build in Android Studio

1. Open this folder in Android Studio with the **Android 16 / API 36** SDK installed.
2. Wait for Gradle sync. The project targets API level **36** as required for new Play submissions in 2026.
3. `Build > Build APK(s)` for installable test APK; `Build > Generate Signed Bundle / APK` for a **release Android App Bundle (.aab)** with an upload key kept private.
4. Store listing, data safety, privacy policy, screenshots and Play Console approval remain required.

## GitHub builds

The workflow `.github/workflows/android-2026.yml` builds a **debug APK** and an **unsigned release AAB** as artifacts for review. The unsigned AAB is NOT directly publishable; sign a release in Android Studio with your own secure upload key.

## Source integrity

A reported price is not a guarantee of inventory. The **Hot** tab is limited to recently reported offers with an observed numeric price and no future start. No Google Play account or release-signing credential is bundled.

## Copyright and branding

Copyright (c) 2026 Random Candy Land. Tidbit and Sugarfight artwork was provided by the project owner for this app.
