# RapidEat — Render.com 

> Single-file guide + ready-to-use config snippets for deploying the RapidEat Next.js app to Render. Includes `render.yaml`, `Dockerfile`, env var checklist, seeding options, and troubleshooting notes. Drop this file in your repo (e.g. `render-deploy.md`) and follow the steps.

---

## Summary

This single-file guide contains everything needed to deploy RapidEat to Render as a production web service. It provides two deployment approaches and includes sample configuration files you can paste directly into your repository:

1. **Docker build** (recommended): Full control and parity with local dev. Use the included `Dockerfile` and `render.yaml` service definition.
2. **Node build (auto-build on Render)**: Use Render's built-in build step (no Docker). Simpler but less reproducible across environments.

Also included:

* `render.yaml` for Render's Infrastructure-as-Code (web service + optional Cron job seed)
* A `Dockerfile` tuned for Next.js 16 (App Router) + Node 20 (recommended)
* `.renderignore` example
* Environment variables checklist
* Seed & migration strategies
* Health checks, startup commands, and production tips

---

## Before you start

1. Ensure your repository contains the full RapidEat project (root contains `package.json`, `app/`, `next.config.js` or any Next 16 config, `scripts/seed.mjs`, `data/restaurants.json` etc.).
2. Create a Render account and connect the Git repo (GitHub/GitLab/Bitbucket).
3. Provision a MongoDB instance (Atlas, MongoDB Atlas is recommended). Note the connection string.
4. Decide whether you want to use Render managed Postgres (not required) or just the web service + MongoDB Atlas.

---

## Recommended production stack on Render

* **Service type**: Web Service (Docker recommended)
* **Instance**: Starter or Standard (scale up CPU/memory for more users; Next.js SSR requires more memory)
* **Build Command** (if not using Docker): `npm ci && npm run build`
* **Start Command** (if not using Docker): `npm start`
* **Port**: Render exposes `$PORT` env var; app should listen on `process.env.PORT || 3000`.

---

## Option A — Docker (recommended)

### Dockerfile (paste into repo as `Dockerfile`)

```dockerfile
# Use Node 20 base image (recommended for MongoDB driver compatibility)
FROM node:20-alpine AS base
WORKDIR /app

# Install dependencies first for caching
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./
# choose npm by default
RUN npm ci --silent

# Copy project files
COPY . .

# Build Next.js app
RUN npm run build

# Production image
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy deps + build output
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/.next ./.next
COPY --from=base /app/public ./public
COPY --from=base /app/next.config.mjs ./next.config.mjs
COPY --from=base /app/package.json ./package.json

# If using a custom server, copy that too
# COPY server.js ./server.js

# Expose port (Render provides $PORT at runtime)
EXPOSE 3000

CMD ["node", "./node_modules/.bin/next", "start"]
```

**Notes**:

* This Dockerfile builds the Next.js app and starts with `next start`. If you use a custom Node/Express server, update the `CMD` accordingly.
* Ensure `next.config.mjs` or `next.config.js` is present and compatible with production.

---

## Option B — Render managed Node build (no Docker)

If you prefer, create a Web Service on Render with the following settings:

* **Environment**: `Node` (select Node 20)
* **Build Command**: `npm ci && npm run build`
* **Start Command**: `npm start`
* **Health Check Path**: `/api/health` (you can create a minimal route that returns 200)

This approach uses Render's build environment and runs `npm start` to serve the production Next app.

---

## render.yaml (example IaC for Render)

Create `render.yaml` in repo root — Render will detect it and create services automatically when you connect the repo.

```yaml
services:
  - type: web
    name: rapideat-web
    env: docker # change to "node" for non-docker
    region: oregon
    plan: starter
    repo: <REPO-URL>
    branch: main
    dockerfilePath: Dockerfile
    buildCommand: npm ci && npm run build
    startCommand: npm start
    envVars:
      - key: MONGODB_URI
        scope: env
      - key: MONGODB_DB
        scope: env
      - key: AUTH_SECRET
        scope: env
      - key: AUTH_SESSION_COOKIE
        scope: env
      - key: AUTH_SESSION_TTL_DAYS
        scope: env
    healthCheckPath: /api/health
    autoDeploy: true

cron:
  - name: rapideat-seed
    schedule: "@once"
    command: npm run seed
    env:
      - key: MONGODB_URI
        scope: env
      - key: MONGODB_DB
        scope: env
```

**Adjust** `repo: <REPO-URL>` and `region` as needed. The `cron` entry demonstrates an ad-hoc seed job you can run once to populate the DB.

---

## .renderignore (optional)

```
node_modules
.vscode
.env.local
.env.*
.DS_Store
.git
```

---

---

## Seeding the database

Two options:

1. **Run seed on Render via `render.yaml` cron**: the included `cron` block will run `npm run seed` once if you want to seed during deployment. Make sure the `seed` script in `package.json` points to `node scripts/seed.mjs` or similar.
2. **Run seed locally**: `npm run seed` with `MONGODB_URI` env var set to your Atlas connection string.

**Alternative**: Expose a protected server-side route `/api/internal/seed` and call it once manually (not recommended in public repos; prefer protected cron or manual CLI run).

---

## Health check endpoint

Create a lightweight endpoint at `/api/health` that returns `200 OK` and optionally sanity-checks MongoDB connection. Render will use this for health checks.

Example (Node/Next API):

```ts
// app/api/health/route.ts (Next 16)
import { NextResponse } from 'next/server'
export async function GET() {
  return NextResponse.json({ status: 'ok' })
}
```

You can optionally test DB connection in this endpoint but keep it fast.

---

## Port & process considerations

* Render provides a dynamic `$PORT` environment variable. Your server should listen on `process.env.PORT || 3000` (Next's `next start` uses the port passed by Render). If using a custom server, make sure to bind to `process.env.PORT`.

---

## CORS, Cookies & Domains

* Set `NEXT_PUBLIC_SITE_URL` to `https://rapideat.onrender.com` (or your custom domain).
* Session cookies should be `Secure; HttpOnly; SameSite=Lax`. Render uses HTTPS by default for managed domains.
* When setting cookie domain, prefer the root domain (example: `.yourdomain.com`) if using subdomains.

---

## Custom Domain & TLS

1. In Render dashboard → your service → Custom Domains → Add `rapideat.onrender.com` (or your own domain).
2. Add DNS CNAME/A records according to Render's instructions.
3. Render auto-provisions TLS certs via Let's Encrypt.

---

## Logging & Monitoring

* Logs: Render captures stdout/stderr. Use `console.info/warn/error` server-side to surface logs.
* Metrics: If you need deeper metrics, add Prometheus exporters or use Render's built-in metrics.

---

## Recommended `package.json` scripts

Make sure your `package.json` includes these scripts:

```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start -p $PORT",
  "seed": "node scripts/seed.mjs"
}
```

`next start -p $PORT` ensures the process honors Render's dynamic port.

---

## Example `scripts/seed.mjs`

Ensure your seed script reads `MONGODB_URI` from env and exits cleanly.

```js
// scripts/seed.mjs
import { MongoClient } from 'mongodb'
import restaurants from '../data/restaurants.json' assert { type: 'json' }

const uri = process.env.MONGODB_URI
if (!uri) throw new Error('MONGODB_URI not set')

const client = new MongoClient(uri)
await client.connect()
const db = client.db(process.env.MONGODB_DB || 'resto-app')
const col = db.collection(process.env.MONGODB_COLLECTION || 'restaurants')
await col.deleteMany({})
await col.insertMany(restaurants)
console.log('Seed complete')
await client.close()
```

---

## Troubleshooting checklist

* **Build fails**: Check Node version on Render matches local Node (`20` recommended). If using Docker, ensure build cache cleared.
* **Mongo connection fails**: Whitelist Render outbound IPs in Atlas (Render publishes regions and static IP ranges — check their docs) or use Atlas' VPC Peering / Private Endpoint.
* **Session issues**: Confirm `AUTH_SECRET` and cookie settings; verify production `NODE_ENV` behavior.
* **404/500 pages**: Check `next.config` and that `basePath` (if used) is configured correctly.

---

## Scaling & cost tips

* Start small (Starter plan) while testing. For SSR-heavy pages or large concurrency, scale to more CPU/RAM.
* Use CDN for images and static assets (Vercel/Cloudflare/CloudFront) for faster performance.
* Cache expensive API results (Redis or in-app memory cache) if request volume increases.

---

## Security & ops notes

* Rotate `AUTH_SECRET` periodically — implement session rotation where possible.
* Restrict any internal endpoints to internal-only or require a secret header.
* Consider adding a basic rate limiter for unauthenticated endpoints.

---

## Final: quick deploy checklist

1. Add `render.yaml` + `Dockerfile` to repo.
2. Push to `main` branch.
3. Connect repo to Render and enable auto-deploy (or create service manually and point to repo).
4. Configure environment variables in Render dashboard.
5. Add custom domain `rapideat.onrender.com` (or set CNAME) and ensure DNS points to Render.
6. Run seed job (via cron entry or `npm run seed` in Render's shell).
7. Open site — `https://rapideat.onrender.com`.

---

## Appendices

### Minimal health endpoint (for Next 16 app dir)

See Health check section.

### Quick `render.yaml` explanation

* `services`: list of Render services (web, workers, etc.)
* `env`: `docker` or `node`
* `envVars`: keys that Render will prompt you to fill in when creating/updating the service.
* `cron`: optional scheduled commands (good for seeding or cleanup tasks)

---

If you'd like, I can also:

* Generate a ready-to-commit `render.yaml` and `Dockerfile` customized to your repo (I will need the repo URL and confirm whether you prefer Docker or managed build).
* Produce a minimal health-check `route.ts` and seed job file to commit.

Good luck — your site should be reachable at `https://rapideat.onrender.com` once DNS and Render settings are complete.
