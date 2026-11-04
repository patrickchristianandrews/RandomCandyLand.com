# Random AI — enable Instant AI (no visitor downloads)

Random AI lives at **https://randomcandyland.com/studio/**. The website remains deployed through GitHub Pages. The optional hosted backend is the Cloudflare Worker in this directory.

## What is already built

- **Instant AI** is a selectable hosted-chat mode. Visitors do not download a model, obtain an API key, or need WebGPU.
- **Private Local AI** uses downloadable WebLLM language models directly in compatible browsers. A persistent progress panel displays initialization, percentage, readiness and errors, including when loading from the top toolbar.
- Featured **task stacks** recommend coding, writing, reasoning, research, brainstorming, and image/video prompts. The current hosted Worker provides **text chat**, not generated photo or video files.
- The UI checks `GET /health` before saying Instant AI is ready. If the Worker is unavailable, it displays an accurate setup/connection message. Cloudflare free service is **limited**, not unlimited.

**Status: the hosting service must be deployed and linked by the website owner.** Committing the frontend does not automatically create an AI endpoint, and this repository deliberately contains no private provider keys.

## Method A: Connect from your laptop using Cloudflare's GitHub integration

1. Sign in to [Cloudflare Dashboard](https://dash.cloudflare.com/), choose **Workers & Pages** and create a Worker that imports the existing GitHub repository **`patrickchristianandrews/RandomCandyLand.com`**.
2. Select root directory **`studio-free-ai`** and use the deployment command **`npx wrangler deploy`**, with **`studio-free-ai/wrangler.jsonc`** as the Worker configuration. Verify that the **AI**, **PER_VISITOR**, and **SHARED_LIMIT** bindings are present. Do not replace your website's GitHub Pages hosting.
3. Deploy using **Workers Free** initially if possible, and verify the Worker exists and its AI binding is enabled. Record the **HTTPS `workers.dev` URL** shown after publishing.
4. In GitHub, edit **`public/studio/free-config.js`** to assign ONLY that public URL, for example:
   ```js
   window.CANDY_FREE_AI_ENDPOINT = 'https://candy-studio-free-ai.YOUR-SUBDOMAIN.workers.dev';
   ```
   This URL is public routing information, not a secret. **Do not insert tokens or API keys.**
5. After the GitHub Pages workflow succeeds, open [Random AI](https://randomcandyland.com/studio/), navigate to **Models & setup** and click **Verify Instant AI**. The status should say **Instant AI connected**.
6. Open **Chat & create**, choose **Instant AI — no download**, select Fast or Quality, then send a short test message. Test on another browser/device as well.

The health endpoint checks the request `Origin`, so opening the `/health` URL directly in a browser address bar may display **403**. The Studio sends an allowed cross-origin fetch from randomcandyland.com.

## Method B: Deploy from a laptop command prompt

If the Cloudflare dashboard does not support your GitHub Worker setup, install Node.js and use these commands in a clone of the repository:

```bash
cd studio-free-ai
npx wrangler login
npx wrangler deploy
```

Wrangler will request authorization in your browser. It uses `wrangler.jsonc` to define the Worker and its AI/rate-limit bindings. Copy the published Worker URL to the public config file as above, then commit the config change to GitHub. **Never paste Cloudflare account tokens into this chat or a frontend file.**

## What the visitor sees

- With an active Worker: **Instant AI connected**, with hosted text responses (no model download).
- With no Worker URL: **Instant AI not connected**, plus the correct setup explanation; no fake answers or invented progress.
- On a browser with WebGPU: **Private Local AI** can download a selected WebLLM model with a visible progress bar at the top. A completed download reports **Local model ready**.
- On a browser lacking WebGPU: the **Load** button explains the problem instead of appearing to do nothing. Chrome or Edge on a sufficiently capable laptop is usually the simplest starting point.

## Costs, limits and security

Cloudflare Workers AI has a limited free daily inference allocation; additional usage may require a paid plan. The Worker caps requests and message lengths, and its Cloudflare AI binding means no visitor-visible API key. The default Worker configuration uses two text models:
- `free-fast`: `@cf/meta/llama-3.2-3b-instruct`
- `free-quality`: `@cf/meta/llama-3.1-8b-instruct-fp8-fast`

Keep Cloudflare spending alerts and limits enabled. The current Worker does **not** implement owner-only usage analytics or a hard monthly dollar budget. Configure those before turning on unrestricted public paid usage. `Origin` filtering alone is not sufficient protection against malicious clients; rate limits, Cloudflare WAF and abuse monitoring are also important.

**Privacy:** Local AI inference stays on the visitor's device after the model assets are downloaded. Instant AI sends the chat messages to your Cloudflare Worker and its model service for processing. The website stores chat history in browser local storage; the Worker shown here does not persist that history. Do not market hosted inference as fully on-device.

## Relevant files

- `public/studio/index.html`: Instant/Local selector, hosted setup, download progress UI.
- `public/studio/studio.js`: secure optional hosted routing and WebLLM initialization progress.
- `public/studio/model-explorer.js`: full WebLLM-supported model list and stack recommendations.
- `public/studio/free-config.js`: **public Worker URL only**, initially empty.
- `studio-free-ai/worker.js`: Cloudflare AI inference, input validation and rate limits.
- `studio-free-ai/wrangler.jsonc`: Worker deployment configuration.

## Verification

GitHub Actions validates the website and browser controls. Its smoke tests do not download multi-gigabyte models or verify a Cloudflare service that has not yet been authorized. Actual model download performance depends on browser, GPU, memory, disk space, network, and the selected model.
