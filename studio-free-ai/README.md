# Candy Studio — an additional Random Candy Land feature

**Random Candy Land remains the homepage at /**. Candy Studio lives in a separate static route at `/studio/` and is one item in the homepage's **Explore & Discover** category, not a new homepage or replacement for the other games.

## What's available without account setup

- 24 searchable prompt-driven writing, marketing, learning and business helpers.
- Abstract procedural art generator with PNG export.
- Browser-based photo resizing and plain-background color removal (not a complex-scene segmentation model).
- Browser text-to-speech, with voice choices where supported.
- Browser speech-to-text where a compatible speech recognition service exists (browser providers may process your voice).
- Local chat via user-downloaded WebGPU models on compatible browsers, plus local conversation storage and export.
- Optional external model-provider chat using a **visitor's own** API credentials, kept in tab memory only.
- **Shared no-login chat** from Cloudflare's Workers AI free allocation **after** the site owner deploys and connects the Worker.

No visitor pays or signs up to access browser tools. Cloudflare's limited free inference allowance is shared by all users; no website can truthfully guarantee unlimited compute for everyone forever.

## Enable FREE community chat (site owner only)

This is **not yet enabled** in `public/studio/free-config.js`. It intentionally remains empty so the website never claims a cloud model is online when it isn't.

1. Sign in at <https://dash.cloudflare.com/> using your existing Cloudflare account. You **do not need to move the domain or change the website hosting**.
2. Navigate to **Workers & Pages → Create application → Import a repository**. Choose **`patrickchristianandrews/RandomCandyLand.com`**, main branch. If GitHub isn't linked, authorize this repository.
3. Set worker name **`candy-studio-free-ai`**, root directory **`studio-free-ai`**, and deploy command **`npx wrangler deploy`** (no additional website build). Cloudflare Workers AI must be available on the account. Confirm Worker bindings **`AI`**, **`PER_VISITOR`**, and **`SHARED_LIMIT`** are present in its deployment configuration.
4. Keep **Cloudflare Workers Free**, so exhausted inference yields a quota error rather than silently billing your account. There is a shared neuron budget and model cost differs by model; this is free-with-limits, not unlimited.
5. Open `https://candy-studio-free-ai.YOUR-SUBDOMAIN.workers.dev/health` **from the site**. The endpoint requires the official site origin, so a direct browser address-bar visit may return a 403; this is intentional. A JavaScript request from the hosted Studio will be permitted.
6. Set the **public URL only**, **without any token**, in `public/studio/free-config.js`:

   `window.CANDY_FREE_AI_ENDPOINT = 'https://candy-studio-free-ai.YOUR-SUBDOMAIN.workers.dev';`

7. Publish the site using its existing GitHub Pages workflow. On `/studio/#settings`, **Community chat** should report the service online, and the ordinary chat tab will use it by default.

**Never put any Cloudflare API token, model provider key, secret, or payment credential in a public file.** This worker uses an account-level AI binding, not a visitor-visible key. It restricts message length, calls per IP, and total calls per region. The site does not save visitors' chat content on the Cloudflare worker, but the model provider receives each submitted chat message and applies its policies. Origin checks alone do not prevent deliberate abuse, so Cloudflare WAF/rate limits and cost monitoring are recommended as traffic grows.

## Expected limitations

- The worker is **not** deployed by committing these files alone. Cloudflare account authorization is required.
- Model quality and image capability are **not** identical to the linked commercial service. Workers AI currently powers chat only; abstract art and photo tools run entirely in the browser.
- When its free inference budget runs out or its Worker is unavailable, the Studio tells users to use local models or offline browser tools.
- Local models require WebGPU and can download hundreds of MB.
- Some voice transcription browsers send audio to their speech service; it is not necessarily offline.
- Stored conversations are browser-local and can be lost if site data is cleared.
- The new site section is independently installable from `/studio/`, alongside the existing Random Candy Land apps.

## Source locations

- `public/studio/index.html` / `studio.css` / `studio.js`: standalone accessible UI and working browser tools.
- `public/studio/free-config.js`: safe public worker address configuration.
- `public/app-manifests/candy-studio.webmanifest`: installable sub-app.
- `studio-free-ai/worker.js` / `wrangler.jsonc`: rate-limited open-model backend.
- `src/pages/RandomCandyLandHome.tsx`: **one additional** menu tile and installation option, leaving the site structure intact.

## Verification

The site is built by the existing GitHub Actions workflow and validated by its full website tests. API quota, actual device performance, browsers' voice behavior, and Cloudflare connectivity must also be tested on a live account.
