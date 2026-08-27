# UAE Job Intelligence

A production-oriented rebuild of the Claude Artifact prototype. The browser is now a client only: search and AI calls run through Vercel Next.js Route Handlers, and API keys never ship to the browser.

## Architecture

- Next.js App Router on Vercel
- `/api/search`: Vercel serverless route → Exa Search API → Claude extraction/matching
- `/api/cover-letter`: Vercel serverless route → Claude
- Exa is the retrieval/search layer; Claude is the reasoning, extraction, deduplication and candidate-fit layer.
- CV and saved jobs use localStorage in this MVP. Replace with Supabase once authentication is added.

## Environment variables

Copy `.env.example` to `.env.local`:

```text
EXA_API_KEY=...
ANTHROPIC_API_KEY=...
ANTHROPIC_MODEL=claude-sonnet-4-6
```

Do not prefix server secrets with `NEXT_PUBLIC_`.

## Run

```bash
npm install
npm run dev
```

## Deploy

Import the repository into Vercel and add the three environment variables to the project. Deploy. No API key is required in the browser.

## Why Exa + Claude

The app should not make an LLM itself responsible for being the search engine. Exa retrieves live web pages and content; Claude interprets those pages. This separation makes source URLs, evidence, deduplication and future source-specific controls easier to manage.

For the next production phase, add authentication + Supabase, a job database/cache, source-specific search queries, freshness verification, employer enrichment, application URL verification and an application tracker.
