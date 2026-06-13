# HTTP Interaction Logger

A simple, production-ready HTTP interaction logger built with Next.js (App Router) and
deployed on Vercel as Serverless Functions. It captures **every** HTTP request sent to any
path (including the root), stores the full interaction in Upstash Redis, and exposes a clean
dashboard for inspecting traffic.

## Features

- Captures requests to **any path**, including `/`, via a catch-all route.
- Logs **timestamp, client IP, method, URL, query parameters, headers, and request body**.
- Every captured request returns `HTTP 200` with the body `OK`.
- `GET /api/logs` returns all captured interactions as JSON.
- `DELETE /api/logs` clears all stored interactions.
- A live dashboard at `/dashboard` for viewing interactions (auto-refreshes every 3s).
- Backed by **Upstash Redis** (Vercel-compatible) — no in-memory storage.

## Project Structure

| File | Purpose |
| --- | --- |
| `app/[[...slug]]/route.ts` | Catch-all logger. Captures requests to any path and returns `OK`. |
| `app/api/logs/route.ts` | `GET` returns all logs as JSON; `DELETE` clears all logs. |
| `app/dashboard/page.tsx` | The dashboard page. |
| `components/log-viewer.tsx` | Client component that fetches and lists interactions. |
| `components/log-entry.tsx` | Expandable detail view for a single interaction. |
| `lib/redis.ts` | Upstash Redis client and shared types/constants. |
| `vercel.json` | Vercel framework + function configuration. |
| `package.json` | Dependencies and scripts. |

## How Routing Works

Next.js resolves more specific routes before the catch-all:

1. `/dashboard` → the dashboard page.
2. `/api/logs` → the logs management API.
3. **Everything else** (e.g. `/`, `/webhook/x`, `/api/v2/users/42`) → the catch-all logger.

This means you can point any webhook or client at your deployment's root or any sub-path and
the request will be captured.

## Local Development

```bash
pnpm install
pnpm dev
```

The app expects the following environment variables (provided automatically by the Upstash
Redis integration on Vercel):

- `KV_REST_API_URL`
- `KV_REST_API_TOKEN`

For local development, add them to a `.env.local` file:

```bash
KV_REST_API_URL=your-upstash-rest-url
KV_REST_API_TOKEN=your-upstash-rest-token
```

## Deploying to Vercel

### Option A — Deploy from the Vercel Dashboard

1. Push this project to a GitHub/GitLab/Bitbucket repository.
2. Go to [vercel.com/new](https://vercel.com/new) and import the repository.
3. Vercel auto-detects Next.js — no build configuration changes are needed.
4. Add the **Upstash for Redis** integration:
   - In your project, open **Storage** (or **Integrations**) and connect **Upstash Redis**.
   - This automatically sets `KV_REST_API_URL` and `KV_REST_API_TOKEN` for all environments.
5. Click **Deploy**.

### Option B — Deploy with the Vercel CLI

```bash
npm i -g vercel

# From the project root:
vercel            # creates/links the project and deploys a preview
vercel --prod     # deploys to production
```

Make sure the Upstash Redis integration is connected (or set `KV_REST_API_URL` and
`KV_REST_API_TOKEN` manually via `vercel env add`).

## Usage

After deploying, your base URL will look like `https://your-app.vercel.app`.

```bash
# Send a request to any path — it will be captured and return "OK"
curl https://your-app.vercel.app/
curl -X POST https://your-app.vercel.app/webhook/payment \
  -H "Content-Type: application/json" \
  -d '{"amount":100,"currency":"usd"}'

# Retrieve all captured interactions as JSON
curl https://your-app.vercel.app/api/logs

# Clear all captured interactions
curl -X DELETE https://your-app.vercel.app/api/logs
```

View the dashboard at:

```
https://your-app.vercel.app/dashboard
```

## Notes

- Up to the most recent **1000** interactions are retained (oldest are trimmed). Adjust
  `MAX_LOGS` in `lib/redis.ts` to change this.
- The dashboard polls `/api/logs` every 3 seconds while "Live" is enabled.
