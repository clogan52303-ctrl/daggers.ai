# DAGGER.AI V1

This is a Vercel-ready starter app for DAGGER.AI.

## What it includes
- Single-page landing page and app UI
- Serverless API endpoint at `/api/analyze`
- OpenAI-powered JSON report output
- Dark red/black underground artist branding

## Deploy to Vercel
1. Create a GitHub repo and upload these files.
2. In Vercel, import the repo.
3. Add an environment variable:
   - `OPENAI_API_KEY` = your API key
4. Deploy.

## Local preview
1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```
2. In this folder, run:
   ```bash
   vercel dev
   ```
3. Open the local URL Vercel gives you.

## Notes
- This V1 does not scrape Spotify or SoundCloud directly.
- It infers from the user-provided artist data and links.
- Later, you can add profile fetching, auth, payments, or saved reports.
