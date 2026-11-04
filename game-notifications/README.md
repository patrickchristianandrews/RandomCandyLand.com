# Random Candy Land · Game Notifications

**Goal:** Genuine opt-in Web Push reminders on Android and iPhone for **ongoing, unfinished games** even when the Random Candy Land home-screen app is closed. This is an additional homepage feature; no games are replaced.

## What's in the website now

- Homepage notification center: **6 selectable game subscriptions** — Moodropolis, The Corridors, The Docket, TRACE OSINT, FM-1 Trumpagotchi, Trumpagotchi OG
- Detects whether a game is **not started**, **in progress**, or **completed** using its existing local save (not by uploading private save files)
- Frequency choices: **daily**, **Mon/Thu**, or **Saturday**; time choices: 9 AM, 1 PM, or 6 PM *in the subscribed phone's timezone*
- **Maximum one scheduled game alert per device per selected day**, and never late at night
- On-device ability to **Enable**, **Send real test push**, and **Turn off**
- An updated `/sw.js` handles encrypted remote Web Push, displays a visible notification, and opens the selected game's page on tap
- The separate, opt-in notification backend in `game-notifications/worker.js` stores an anonymous push subscription, timezone, game IDs, and unfinished/finished state. **It does not read or upload saved game progress, user notes, case answers, location, personal identity, or chat content.**

The website includes **`public/notifications/push-config.js`** with an intentionally empty public Worker URL. **Background notifications are not active until the steps below are completed.** The Cloudflare AI worker, if already running, is separate and is not changed by these files.

## Activate on your existing Cloudflare account

Cloudflare's dashboard or Wrangler CLI can create the push Worker. If you can run a command in a terminal, this is the most repeatable path:

1. Open a terminal in your clone of the RandomCandyLand.com repository. Run `npx wrangler login` if necessary. You do not need to move the website off GitHub Pages.
2. Generate your own **VAPID signing keys locally**:
   `node game-notifications/generate-vapid.mjs`
   Copy the PUBLIC and PRIVATE values somewhere secure. **Never commit the private key to GitHub and never paste it into ChatGPT.**
3. Create a **Workers KV namespace** in your Cloudflare account: `npx wrangler kv namespace create SUBSCRIPTIONS --config game-notifications/wrangler.jsonc`. Cloudflare prints a unique namespace `id`.
4. Replace `REPLACE_WITH_CLOUDFLARE_KV_NAMESPACE_ID` in `game-notifications/wrangler.jsonc` with your KV namespace ID. This ID is *not secret*. The binding name must remain `SUBSCRIPTIONS`. The Worker schedule is `0 * * * *` (runs hourly and checks the time zone of each subscribed phone).
5. From the repository root, set the **two secrets**, entering the value only into Cloudflare's secret prompt when requested:
   `npx wrangler secret put VAPID_PUBLIC_KEY --config game-notifications/wrangler.jsonc`
   `npx wrangler secret put VAPID_PRIVATE_KEY --config game-notifications/wrangler.jsonc`

   Cloudflare may require the Worker to be deployed first before adding secrets. If so, deploy with `npx wrangler deploy --config game-notifications/wrangler.jsonc`, add the secrets, then deploy once more.
6. Deploy the notification Worker:
   `npx wrangler deploy --config game-notifications/wrangler.jsonc`
7. Cloudflare reports a public URL such as `https://random-candy-game-push.YOUR-SUBDOMAIN.workers.dev`. Edit **only the public URL** in `public/notifications/push-config.js`:
   `window.RCL_PUSH_ENDPOINT = 'https://random-candy-game-push.YOUR-SUBDOMAIN.workers.dev';`
   Commit that small public configuration update so GitHub Pages publishes it. **No API keys or VAPID private keys go in the website's public files.**
8. Open **Random Candy Land from the installed home-screen icon**, scroll to **Keep the story going**, choose games and a schedule, tap **Enable phone reminders**, accept the native notification permission, then tap **Send test push** to confirm real end-to-end delivery. You can test encryption offline via `node scripts/test-game-push.mjs`.

### iPhone

iOS/iPadOS 16.4 or later: open `https://randomcandyland.com/` in Safari, tap **Share → Add to Home Screen**, then **open the new icon** and tap Enable. A normal iPhone browser tab cannot subscribe to iOS Web Push; the home-screen web app can. [Apple Web Push documentation](https://developer.apple.com/documentation/usernotifications/sending-web-push-notifications-in-web-apps-and-browsers).

### Android

In Chrome: open the homepage, choose **⋮ → Install app**, launch the installed icon, then Enable. Google/Android notification settings must allow the app to display notifications.

### Delivery behavior and safeguards

- Reminders are **not activated by installing** the app. They require an explicit click, an allowed platform, and a successful server subscription.
- Once enabled, the Worker sends a push for one selected **unfinished** game at most once on the chosen day, using the app's local schedule preferences; no aggressive streak-loss or pressure language.
- A player who completed a game will not continue to receive reminders for it after the new status syncs while they visit the website. Server progress is a simple status; no story decisions or personal notes are stored or transmitted.
- At most **one game per scheduled day**. Supported times (9 AM, 1 PM, 6 PM) intentionally avoid late-night alerts. Timezone is recorded from the browser's local setting. If the device changes zones while away, its preferences update the next time it opens the website.
- This initial small-community Worker processes up to **300 subscribers per hourly trigger** and sends up to **30 pushes per hour**; larger deployments need batched queues or a different database. KV and Worker quotas apply and free-tier limits can change.
- The endpoint is limited to recognized Apple, Mozilla, and Google push-service hosts to reduce server-side request forgery. It authenticates updates/unsubscribes with a random per-device token and checks the site Origin. This is not a substitute for full bot protection; add Cloudflare rate limits/WAF for large-scale public use.
- Push subscription endpoints are pseudonymous communication identifiers, so handle them as private operational data. Cloudflare KV records expire after one year without renewal.
- A test push is throttled to one every five minutes per subscription.
- Unsubscribe removes the stored subscription and unregisters the device from PushManager. Turning off reminders does not delete any game save.
- A web app cannot secretly schedule local notifications to fire after it is closed. True push requires a server and OS permission. The Cloudflare AI chat Worker is **not** automatically the notification service.

## Source and validation

- `public/sw.js`: real push handler and safe game deep links
- `public/notifications/center.js`: phone PWA permission, preference UI, progress detection, subscription syncing
- `public/notifications/push-config.js`: public URL only (initially blank)
- `game-notifications/worker.js`: scheduled Cloudflare Worker, encrypted RFC8291 payload, VAPID signing, KV storage
- `game-notifications/wrangler.jsonc`: KV binding + hourly cron
- `game-notifications/generate-vapid.mjs`: local one-time signing keys
- `scripts/test-game-push.mjs`: cryptographic roundtrip and subscribe/test/unsubscribe integration checks
- `src/pages/RandomCandyLandHome.tsx`: additional boxed setting section, original navigation and games preserved
