# Fibo Studio — deployment checklist

This application lives in `fibo-studio/` within the existing repository. Do not change the repository-root website.

## Vercel
- Import `patrickchristianandrews/RandomCandyLand.com` as a **new, separate Vercel project**.
- Set **Root Directory** to `fibo-studio` before deploying.
- Deploy the reviewed branch first as a preview; do not attach the existing site's production domain.
- Set these server-side environment variables in Vercel (never in GitHub):
  - `STUDIO_ACCESS_PASSWORD`: a strong unique password required for image generation
  - `OPENAI_API_KEY`: an API key with billing and project spending limits
- Redeploy after adding environment variables.

## Security and costs
- The API fails closed if `STUDIO_ACCESS_PASSWORD` is absent.
- A password gate alone is **not** production-grade abuse protection: add server-side rate limits, user accounts, quotas, monitoring and provider spending caps before a public launch.
- This branch still uses OpenAI's image API. It is **not** BRIA Fibo 2.0 yet.
- Reference-image upload is a placeholder and does not edit images.
- Verify a successful Vercel build and a password-protected generation request before publishing.

## BRIA Fibo 2.0 migration
- Confirm the desired Fibo 2.0 hosting provider, API access, pricing and license.
- Keep model credentials on the server and adapt `app/api/generate/route.ts` to the chosen provider's documented request/response contract.
- Test provider-supported sizes, latency, and moderation/usage controls.
- Do not claim Fibo 2.0 integration is complete until a live test succeeds.
