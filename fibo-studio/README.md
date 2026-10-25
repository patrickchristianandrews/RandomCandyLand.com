# Fibo Studio

A Next.js AI image creation studio located in the `fibo-studio/` subfolder of the RandomCandyLand.com repository. The existing website files in the repository root are left untouched.

## Features

- Prompt-based image generation using OpenAI's image API
- Art direction presets and square, portrait, and landscape canvas sizes
- In-session gallery and image saving
- Responsive interface for mobile and desktop
- Server-side API key handling

## Run locally

1. Install Node.js 20.9 or newer.
2. Open a terminal in this folder and run `npm install`.
3. Copy `.env.example` to `.env.local` and add your own `OPENAI_API_KEY`.
4. Run `npm run dev` and open http://localhost:3000.

## Deploy to Vercel

1. Import the existing GitHub repository into Vercel, or create a new Vercel project pointing at this repository.
2. In the Vercel project settings, set **Root Directory** to `fibo-studio`.
3. Add `OPENAI_API_KEY` in Environment Variables. Do not put a real API key in a committed file.
4. Deploy.

## Important notes

- Image generation requires a valid OpenAI API key and API access/billing. API usage may cost money.
- The gallery is session-only; images are not stored in a database.
- The reference-image picker is currently a UI placeholder; image editing/upload processing is not implemented yet.
- Before public launch, add authentication, request rate limits, spending controls, and any privacy/terms pages appropriate to your use.
