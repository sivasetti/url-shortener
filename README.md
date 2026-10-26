# URL Shortener — Rate-Limited, with Click Analytics

A URL shortener API built for correctness under load: collision-free short codes,
per-client rate limiting that can't be raced, and click analytics that never slow
down a redirect.

**Stack:** Node.js · Express · PostgreSQL · Redis · BullMQ · Docker · k6

**Live:** https://url-shortener-71jf.onrender.com

---

## What it does

- **Shorten** — `POST` a long URL, get a short code (e.g. `https://sho.rt/d0s`)
- **Redirect** — visiting a short link issues a fast `302` to the original URL
- **Analytics** — every click is recorded as a raw event; per-link totals and
  per-day breakdowns are available from a stats endpoint
- **Rate limiting** — 100 requests/minute per client, enforced by a Redis
  **token bucket** executed as an atomic **Lua script**, so concurrent requests
  cannot slip past the limit

## Why it's built this way

| Decision | Choice | Why |
|---|---|---|
| Short codes | Base62 of the row ID | IDs never repeat, so codes are collision-free *by construction* — no retry loops, no random collisions. Trade-off: codes are enumerable (accepted, documented). |
| Redirect status | `302`, not `301` | Browsers cache `301`s permanently and stop asking the server — which would silently kill click analytics. `302` keeps every click observable. |
| Rate limiting | Token bucket in Redis, via Lua | Fixed windows allow a 2× burst at the boundary (100 at :59 + 100 at :00). A token bucket refills smoothly. The check-and-decrement runs as one Lua script inside Redis, so it is **atomic** — no race between concurrent requests. |
| Click writes | BullMQ queue + separate worker | The redirect path only enqueues a job (a sub-millisecond Redis write). A worker persists clicks to PostgreSQL asynchronously, so analytics load never adds latency to redirects — and clicks are buffered, not lost, if the worker is down. |
| Analytics storage | Raw click events + a counter | Every click is a row (`clicks` table), so stats can be sliced by day, referrer, anything. The `click_count` column gives O(1) totals. Raw events can be re-aggregated; a lone counter cannot be un-aggregated. |
| Code structure | Layered monolith (routes → services → repositories) | HTTP, business logic, and SQL each live in exactly one layer, so every change — and every bug — has exactly one home. Dependencies point down only; no layer reaches around the one below it. |

## Architecture

```
                ┌────────────┐   Lua token bucket    ┌─────────┐
   POST /api/shorten ────────►  rate limiter  ├────►│  Redis  │
                └────────────┘                     └────┬────┘
                                                      │ click jobs (BullMQ)
   GET /:code ──► SELECT long_url (indexed)           ▼
        │         from PostgreSQL               ┌──────────┐   INSERT click,
        └── 302 ──► visitor                     │  worker  │   UPDATE counter
                                                └──────────┘        │
   GET /api/urls/:code/stats ──► totals + per-day aggregates  ◄─────┘
                                                            PostgreSQL
```

## API

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Liveness + DB check |
| `POST` | `/api/shorten` | Body: `{ "longUrl": "https://…" }` → `201 { shortCode, shortUrl }`. Rate-limited (100/min per IP). `400` on invalid or non-http(s) URLs. |
| `GET` | `/:code` | `302` redirect to the long URL; enqueues a click event. `404` for unknown codes. |
| `GET` | `/api/urls/:code/stats` | `{ shortCode, longUrl, createdAt, totalClicks, clicksByDay[] }` |

All SQL is parameterized (`$1` placeholders) — no string interpolation of user
input anywhere, so SQL injection is structurally impossible.

## Data model

```sql
urls   (id BIGSERIAL PK, short_code VARCHAR(10) UNIQUE, long_url TEXT,
        created_at TIMESTAMPTZ, click_count BIGINT)
clicks (id BIGSERIAL PK, short_code VARCHAR(10), clicked_at TIMESTAMPTZ,
        referrer TEXT)
-- indexes: UNIQUE on urls(short_code); (short_code, clicked_at) on clicks
```

## Run it

Prerequisites: Node 20+, Docker Desktop (engine running).

```bash
docker compose up -d        # PostgreSQL 16 + Redis 7
npm install
npm run setup               # create tables (idempotent)
npm start                   # API on :3000        (terminal 1)
npm run worker              # click worker        (terminal 2)
npm run seed                # optional: insert 100,000 test links
```

## Benchmarks

Load-tested with **k6** against the redirect endpoint — the hot path.
Dataset: 100,029 rows. Environment: a single laptop (Windows, Docker Desktop /
WSL2) with k6, the API, PostgreSQL, Redis and the worker **all co-located** —
expect roughly an order of magnitude better latency on a real server.

| Metric | Result (50 VUs, 30 s sustained) |
|---|---|
| Throughput | **844 req/sec** |
| Requests | 25,350 — **0 failed**, 100% returned `302` |
| Latency p50 / p90 / p95 | 50.9 ms / 85.4 ms / **106.7 ms** |
| SQL lookup (`EXPLAIN ANALYZE`, in progress) | <!-- STEP 26: fill after layer-isolation run --> |

The p95 target is < 50 ms. Diagnosis so far: the indexed SQL lookup itself is
~1 ms; the overhead sits around it (worker write contention on the same
database, a 20-connection pool for 50 concurrent clients, and two cross-VM
round trips per request). Tuning is proceeding one variable at a time —
worker on/off A/B first, then pool size, then `127.0.0.1` vs `localhost` —
re-measuring after each change. Final tuned numbers will replace the row
above.

Reproduce: `k6 run k6/redirect-load.js` (thresholds: `p(95)<50`, checks for
`302`; `redirects: 0` so only this server is measured, not the target site).

## Project structure

```
src/
  index.js                  Entry point — builds the app, mounts the routes
  routes/
    urls.js                 POST /api/shorten · GET /api/urls/:code/stats
    redirect.js             GET /:code
  services/
    urlService.js           shortenUrl · getUrlStats · resolveUrl
    clickService.js         recordClick (counter increment + raw event)
  repositories/
    urlRepository.js        All SQL for the urls table
    clickRepository.js      All SQL for the clicks table
  middleware/
    ratelimit.js            Token-bucket rate limiter (Redis + Lua)
  queues/
    clickQueue.js           BullMQ queue definition ('clicks')
  workers/
    clickWorker.js          Consumes click jobs, calls clickService
  lib/
    db.js                   PostgreSQL connection pool (single shared instance)
    redis.js                Redis client (single shared instance)
    base62.js               Base62 encode/decode for short codes
db/
  schema.sql                Table definitions
scripts/
  setup.js                  Creates the tables from db/schema.sql (idempotent)
  seed.js                   Batched 100k-row seeder (with sequence re-sync)
docker-compose.yml          PostgreSQL + Redis services
k6/                         Load-test scripts
```

Layers call down only: routes → services → repositories → infrastructure
(`lib`, `queues`). Routes never contain SQL; services never see `req`/`res`;
repositories return plain data (or `null` — the route decides the `404`).

## Roadmap

- [ ] Finish p95 tuning pass (pool sizing, worker isolation)
- [ ] `shorten` load test + rate-limit correctness test under concurrency
- [ ] Redis cache for hot links on the redirect path
- [ ] Custom aliases and link expiry
- [ ] Minimal frontend (shorten form + stats view)
