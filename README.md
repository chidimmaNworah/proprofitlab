# ProProfitLab

Lead-generation and tracking dashboard for two providers:

- AlgoLead
- DrTracker

The app includes:

- React frontend (forms + dashboard)
- API routes (provider integrations and auth)
- Redis-backed persistence via Upstash

## Tech Stack

- Frontend: React + Vite + React Router
- API: Node.js handlers in `api/`
- Local API runtime: Express wrapper in `scripts/api-dev-server.js`
- Persistence: Upstash Redis (`@upstash/redis`)
- Deployment: Vercel (static frontend + serverless API handlers)

## Project Structure

- `src/` — frontend pages/components
- `api/algolead/` — AlgoLead endpoints
- `api/drtracker/` — DrTracker endpoints
- `api/auth/` — dashboard auth endpoints
- `scripts/api-dev-server.js` — local API server for development
- `.env.example` — required environment variables

## API Endpoints (Current)

All endpoints are POST:

### AlgoLead

- `/api/algolead/register`
- `/api/algolead/leads`
- `/api/algolead/deposits`

### DrTracker

- `/api/drtracker/register`
- `/api/drtracker/leads`
- `/api/drtracker/deposits`

### Auth

- `/api/auth/login`
- `/api/auth/change`

## Redis Requirements

This repo is Redis-first and does not use local file persistence.

- Lead registration persistence uses Redis.
- Credential updates use Redis.
- Some routes now fail early with `503` if Redis is unavailable.

If Redis is down/unreachable, endpoints that require writes return:

- `Database is not available. Please contact developer.`

## Environment Variables

Copy `.env.example` to `.env` and fill values.

### Provider URLs

- `ALGOLEAD_API_URL`
- `DRTRACKER_API_URL`

### AlgoLead

- `ALGOLEAD_FUNNEL_ID`
- `ALGOLEAD_AUTH`
- `ALGOLEAD_PARTNER_ID`
- `ALGOLEAD_TRACKING_ID`
- `ALGOLEAD_TOKEN`
- `ALGOLEAD_SUBCAMPAIGN_ID`
- `ALGOLEAD_CUSTOM_SOURCE`

### DrTracker

- `DRTRACKER_API_KEY`
- `DRTRACKER_API_PASSWORD`
- `DRTRACKER_CAMPAIGN_ID`

### Redis (Upstash)

- `KV_REST_API_URL`
- `KV_REST_API_TOKEN`

### Dashboard Auth Fallback

- `DASH_USERNAME`
- `DASH_PASSWORD_HASH`
- `DASH_PASSWORD_SALT`
- `DASH_PASSWORD`

### Local API Port

- `PORT` (default `3001`)

## Local Development

Install dependencies:

```bash
npm install
```

Run frontend + local API together:

```bash
npm run dev
```

Run only API:

```bash
npm run dev:api
```

Run only frontend:

```bash
npm run dev:client
```

## Scripts

- `npm run dev` — starts API and client concurrently
- `npm run start` — alias for `npm run dev`
- `npm run dev:api` — starts local API runtime (`scripts/api-dev-server.js`)
- `npm run dev:client` — starts Vite dev server
- `npm run build` — production build
- `npm run preview` — preview built frontend
- `npm run lint` — run ESLint

## Local Routing Behavior

Vite proxies `/api` requests to the local API server on port `3001`.

That means frontend calls like `/api/algolead/register` are automatically routed to your local API runtime during development.

## Production Deployment (Vercel)

- Frontend is built with Vite (`dist` output)
- API routes are served from files in `api/`
- SPA rewrites are configured to route non-API paths to `index.html`

No custom Node server process is required in production.

## Notes on Auth Behavior

- `/api/auth/login` checks Redis credentials first.
- If Redis is unavailable, login can still fall back to env-based credentials.
- `/api/auth/change` requires Redis availability and fails if Redis is down.

## Troubleshooting

### `Database is not available`

Check:

- `KV_REST_API_URL` and `KV_REST_API_TOKEN`
- network access to Upstash
- Upstash service health

### Frontend can’t reach API in local dev

Check:

- `npm run dev:api` is running
- `PORT` is `3001` (or update Vite proxy accordingly)

### Provider API errors

Check:

- provider credentials in `.env`
- provider base URLs
- request payload shape from frontend

