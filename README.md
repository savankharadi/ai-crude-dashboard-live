# AI Crude Dashboard Live

This repo contains a live-data dashboard for crude market monitoring with:
- real-time WTI feed via Yahoo Finance CL=F
- optional Groww token-powered market feed via a secure server route
- AI-style buy/sell signal engine
- event trigger panel
- shareable dashboard page
- Vercel-ready deployment

## Local run

```bash
npm install
npm run dev
```

Then open http://localhost:3000

## Required environment variables for real API usage

```bash
TOKEN_SECRET=your_secure_secret_here
GROWW_TOKEN=your_groww_token_if_available
GROWW_API_BASE_URL=https://your-groww-endpoint.example.com/market
GROWW_MARKET_ENDPOINT=https://your-groww-endpoint.example.com/market
```

Notes:
- Keep tokens out of Git. Use the app settings or Vercel environment variables.
- Groww API integrations depend on official access and endpoint availability. The app supports a token-backed route with graceful fallback when the endpoint is unavailable.
- For static GitHub Pages hosting, this app is not the ideal target because server-side API routes are required. For a true live app with real-time API support, deploy to Vercel.

## Deploy to Vercel

1. Import this repo into Vercel.
2. Set the environment variables above.
3. Deploy.
4. Use the generated Vercel URL as the live application URL.

## Free WTI data

The WTI tile uses Yahoo Finance CL=F for near real-time data and falls back to static demo data if the provider is unavailable.
