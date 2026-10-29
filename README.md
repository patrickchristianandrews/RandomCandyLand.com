# Random Candy Land — Source of Truth

Production website: https://randomcandyland.com  
Repository: https://github.com/patrickchristianandrews/RandomCandyLand.com

This is the **current source repository**, not a bundle of historic deployments. Edit source files and let CI build the production site. Do not restore retired homepage snapshots, old ZIP exports, or duplicate compiled assets.

## Start here

| Need | Canonical file or folder |
|---|---|
| Vite/React homepage HTML entry | `index.html` — **one** source HTML entry, not a generated compiled page |
| Current colorful homepage + attraction cards | `src/pages/RandomCandyLandHome.tsx` |
| Current styling, dripping goo and animated planet | `src/index.css`, `src/components/CandyGoo.tsx` |
| React app routing | `src/App.tsx` |
| Original larger talking Pocket Pet | `src/pages/TrumpGotchaPage.tsx` and related `src/components`, `src/hooks`, `src/utils`, `src/types` |
| Pixel-art Trumpagotchi Tiny Pet | `public/trumpagotchi-fm1/index.html`, `game.js`, `fm1-pixel-screen.js`, `melody.js`, `game.css` |
| Standalone attractions | `public/goo-rush/`, `public/candy-simon/`, `public/candy-match/`, `public/music-visualizer/` |
| Curiosity Atlas and psychology lab | `public/after-dark/` including `psychology-lab/` |
| Shared public sound files | `public/audio/trump/` — do not recreate root `audio/` |
| Site image, logos, icon master files | `public/random-candy-land-art.webp`, `public/icon*`, `public/apple-touch-icon.png` |
| Mobile install script, service worker and manifests | `public/install-app.js`, `public/sw.js`, `public/manifest.json`, `public/app-manifests/` |
| Standalone **native Pixel Watch** Android project | `wear-os/trumpagotchi/` |
| Optional Node server/API | `server.ts`, `src/server/` |
| Build / production validation | `scripts/build-standalone.mjs`, `scripts/check-public-pages.mjs`, `scripts/smoke-after-dark.mjs` |
| Static site deployment | `.github/workflows/deploy.yml` |
| Wear OS APK build | `.github/workflows/build-trumpagotchi-watch.yml` |

## Active site routes

- `/` — current Random Candy Land homepage; includes the Nonsense Generator and attraction catalog.
- `/trump/` — original larger talking Pocket Pet with extra mini-games, accessed from the homepage.
- `/trumpagotchi-fm1/` — standalone pixel-art Tiny Pet; Feed, Praise, Clean, Rest, Watch News (walk to chair and watch TV), Cheer, Play Him a Melody.
- `/goo-rush/`, `/candy-simon/`, `/candy-match/`, `/music-visualizer/` — separate games/tools.
- `/after-dark/`, `/after-dark/psychology-lab/` — education and private self-reflection tools.
- `/fm1-emu/` — **intentional backwards-compatible redirect** to the tiny pet. Leave it in place unless redirect tests and external links are migrated.

## Development and deployment

Requires Node.js 22+, Bun (for the CI's locked dependencies), and Python + Pillow for icon rendering during deployment.

```bash
bun install --frozen-lockfile
bun run lint
bun run build
node scripts/check-public-pages.mjs
```

The build writes `dist/` from **root `index.html`** and the entire `public/` tree. It then inlines the React assets into the produced homepage, `dist/trump/index.html`, and `dist/404.html`. Do **not** commit these built files or a second root HTML snapshot. The development server uses `server.ts` and Vite middleware. `vercel.json` is retained as an alternative deployment configuration.

### Live production

The canonical deployer is `.github/workflows/deploy.yml`. It rebuilds, validates, performs Chrome smoke tests and publishes `dist/` to GitHub Pages. The repository currently also triggers a legacy GitHub-provided **"pages build and deployment"** job due to branch-source Pages settings. The custom workflow waits for the legacy job so the latest built site publishes last; avoid enabling another competing deployer. To simplify later, configure **Settings → Pages → Build and deployment → GitHub Actions** and confirm the existing custom workflow deploys successfully, then remove the legacy wait from `deploy.yml`.

Both root `CNAME` (required by the legacy branch-source GitHub Pages publisher) and `public/CNAME` (copied into Vite's dist for the canonical GitHub Actions publisher) intentionally contain `randomcandyland.com`. Keep them identical until Pages Settings are switched completely to GitHub Actions.

### Android / iPhone installs

The site and each standalone attraction offer their own **Add to Home Screen** web app install via `public/install-app.js` and scoped web manifests under `public/app-manifests/`. Install by visiting the intended attraction and tapping **Install**; on Android Chrome can show the native install prompt, while on iPhone Safari offers **Share → Add to Home Screen**. These are **PWAs, not signed iOS IPA files or store-distributed Android APKs**. The service worker provides network-first caching with limited offline fallback, not guaranteed offline availability for every feature. User records and personal voice packs are stored locally by their respective app code.

### Pixel Watch

`wear-os/trumpagotchi/` is a completely separate offline **native Wear OS** project. It has the cartoon pixel screen and a five-key pentatonic piano (C D E G A), with a full tune button. Changes to the phone website do not automatically update the watch app; keep both explicitly in sync if desired.

To build locally, use JDK 17, Gradle 8.9 and Android SDK 35:

```bash
cd wear-os/trumpagotchi
gradle :app:assembleDebug
```

To download a prebuilt, test-signed APK without a computer, open **GitHub Actions → Build Trumpagotchi Pixel Watch APK → latest successful run → Artifacts → Trumpagotchi-PixelWatch-APK**. The artifact ZIP contains `app-debug.apk`. Sideload it using Wear Installer 2 or Android Debug Bridge over Wi-Fi. GitHub Actions artifacts are time-limited; **no permanent binary is committed to the source repository**.

## Guardrails for another developer or model

- **Preserve all active pages and assets**. Do not reintroduce the old luxury-resort homepage or retired pop-culture crown-battle/second pet prototypes.
- **One canonical source**: root `index.html`, `src/` for React, `public/` for static sites/assets, `wear-os/` for watch app; GitHub Actions publishes generated `dist/`.
- **No duplicate exports**: removed stale root `assets/`, root `audio/`, compiled HTML snapshots, `.aistudio` scratch artifacts, and three large published ZIP archives.
- Keep the original GPL-3.0-only attribution and source notices for the adapted Tiny Pet and watch game. Original project: https://github.com/adamcharleswilsonmusic-code/Trumpagotchi v1.0.0. The source and license remain available in `public/trumpagotchi-fm1/`.
- Do not expose secrets, publish unrestricted paid model endpoints, or commit personal keys. `.env.example` provides a template.
- Verify GitHub Actions after edits and check actual live behavior; do not interpret a successful commit as a successful deployment.
