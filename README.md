# AI Crude Dashboard Live

A live-ready Next.js dashboard for crude futures and options analysis with:
- free WTI data tile
- AI signal engine
- event trigger panel
- Groww access-token settings
- shareable dashboard snapshot page

## Local startup

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Environment variables

```bash
FRED_API_KEY=your_key_here
TOKEN_SECRET=your_secure_secret_here
```

## Deployment note
For full server-side API support, deploy to Vercel instead of GitHub Pages. GitHub Pages is static-only and cannot run Next.js API routes.
