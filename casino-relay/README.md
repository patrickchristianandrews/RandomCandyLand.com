# Candy Land Casino · Cloudflare room relay

This is a dedicated, two-player WebSocket room server for the existing static
RandomCandyLand.com Casino. The casino retains the existing poker, high-card,
and dice game logic. The Cloudflare Worker simply forwards JSON game messages.

## Setup from Android/iPhone or desktop

1. Open https://dash.cloudflare.com and create/sign in to a **Cloudflare Free**
   account. You do NOT need to move the RandomCandyLand.com domain, purchase
   a domain, or change GitHub Pages.
2. Visit **Workers & Pages → Create application → Import a repository**.
   Authorize Cloudflare's GitHub integration, choosing the repository
   **patrickchristianandrews/RandomCandyLand.com**.
3. Configure the Worker as follows:
   - Project / Worker name: `candy-casino-relay`
   - Production branch: `main`
   - Root directory: `casino-relay`
   - Build command: leave blank
   - Deploy command: `npx wrangler deploy`
   - Worker subdomain: enable the automatically provided `workers.dev` URL
4. Choose **Save and Deploy**. The project includes `wrangler.jsonc` and
   uses one SQLite-backed Durable Object per room; this is supported on
   Workers Free, subject to its normal free-usage limits.
5. Open `https://candy-casino-relay.YOURSUBDOMAIN.workers.dev/health`.
   A successful deployment reports `{"ok":true,...}`.
6. Supply the public **workers.dev URL** to the developer/assistant to set
   `public/candy-casino/relay-config.js`:
   `window.CandyCasinoRelayURL='https://candy-casino-relay.YOURSUBDOMAIN.workers.dev';`
   This public URL is **not a secret**. Do **not** share your Cloudflare API token.
7. Rebuild and publish the GitHub Pages website (its normal GitHub Actions
   pipeline). After that, the Casino reports:
   `Multiplayer v6 · dedicated Cloudflare relay ACTIVE`.

### What to expect

Create Room displays `Room is OPEN` only after Cloudflare acknowledges the
host WebSocket. The guest joins through the same invite. WebSocket packets go
through Cloudflare rather than requiring a WebRTC direct connection between
mobile carriers or Wi-Fi networks.

If the original host closes its tab, an invited player can reclaim the same
room code. The first connected player becomes the room's host and manages the
game state. A room holds one host and one guest; there are no accounts, wagers,
real chips, server-side game history, or permanent saved game content.

The Worker restricts connection origins to RandomCandyLand.com, accepts only
the Casino's room-code pattern, caps inbound packet size, and restricts game
message kinds. Guests cannot send `state` packets to pose as the host.
However, this is a casual game: anyone with an invite can join and no
cryptographic authentication or cheat-proof host is provided.

## Test / diagnostics

- Public health check: `/health` (regular HTTPS GET).
- Room socket: `wss://.../room/rcl-casino-<20 hex characters>?role=host|guest`.
- Browser adapter: `public/candy-casino/relay-peer.js`.
- Public endpoint configuration: `public/candy-casino/relay-config.js`.
- Tests: `node scripts/test-casino-relay.mjs`.
- GitHub Pages remains the website host; the Worker is solely its room relay.

Deployment and a test between two real phones cannot be completed until a
Cloudflare Worker is authorized and its public URL configured.
