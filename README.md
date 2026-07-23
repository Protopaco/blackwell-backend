# Blackwell Time — Backend

Node/TypeScript API service that automates timesheet generation and payroll cost allocation for Blackwell Bookkeeping. Blackwell manages payroll for multiple nonprofit clients. Timesheets and config live in Google Sheets; this service handles generation, formatting, status tracking, pay period management, and payroll cost allocation.

---

## Quick Start

```bash
npm install
npm run watch             # development with hot reload + pretty logs
npm run dev               # same development server, matching the production start/dev script split
npm test                  # unit tests only — fast, no external calls (default/safe to run anytime)
npm run test:integration  # integration tests — hits the live Google Sheets API, on demand only
npm run build              # compile TypeScript to dist/
npm run start              # run the compiled app from dist/
npm run generate           # regenerate docs/openapi.json from the swagger annotations
```

**Environment variables** — copy `.env-example` to `.env`:

| Variable | Description |
|---|---|
| `GOOGLE_SERVICE_ACCOUNT_JSON` | Full service account JSON as a string |
| `GOOGLE_OAUTH_CLIENT_ID` | OAuth client ID (used to create files owned by the real user, not the service account) |
| `GOOGLE_OAUTH_CLIENT_SECRET` | OAuth client secret |
| `GOOGLE_OAUTH_REFRESH_TOKEN` | Offline refresh token — bootstrap it with `tsx src/utils/oauth/getRefreshToken.ts` |
| `CLIENT_CONFIG_FILE_ID` | Google Sheets file ID of the shared Client-Config spreadsheet |
| `FRONTEND_BASE_URL` | Frontend origin for CORS (production) |
| `APP_ENV` | Blackwell environment label, e.g. `local`, `demo`, or `production` |
| `HOST` | HTTP bind host. Render demo services should use `0.0.0.0` |
| `PORT` | HTTP port (default 3000) |

Render demo backend settings:

```bash
Build Command: npm install && npm run build
Start Command: npm run start

NODE_ENV=production
APP_ENV=demo
HOST=0.0.0.0
```

---

## Architecture

```
Google Sheets (data storage)  ↕  Blackwell Time API (this service)  ↕  Blackwell Time Dashboard (frontend, separate repo)
```

Three strict layers: `routes/` (parse HTTP, call one service) → `services/` (business logic) → `db/` (data access, calls `db/adapter/` only — the sole layer that touches the Google Sheets API directly). This boundary exists so a future database migration only touches `db/`; routes, services, and models shouldn't need to change.

**For the full technical reference** — folder structure, naming conventions, caching, error handling, testing setup, and the complete data-model schema — see [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md). Keep that document current; this README intentionally stays brief.

---

## Tech Stack

- **Runtime:** Node.js + TypeScript (ESM), Express 5
- **Hosting:** Railway
- **Data layer:** Google Sheets API (service account + OAuth) — designed to migrate to PostgreSQL later
- **Logging:** Pino + pino-http
- **Testing:** Vitest + Supertest
- **API docs:** swagger-jsdoc + swagger-ui-express, served at `/api/docs`

**Installed but not yet wired up** (deliberately deferred, not missing): Google OAuth login (Passport), Postgres/session storage. Project sequencing is backend → frontend → database → auth.

---

## Important notes

- **Google Sheets API quota is 60 requests/minute.** Integration tests hit the live API and can fail from quota exhaustion under load — that's expected flakiness, not necessarily a bug. Keep integration test runs deliberate, not automatic.
- **The service account needs Editor access** to the Client-Config spreadsheet and every client's Payroll-Config/Pay-Period-Registry/Payroll-Report files. Any newly created config file must be shared with the service account email.
- **Never commit service account credentials.** `GOOGLE_SERVICE_ACCOUNT_JSON` is an env var, not a file on disk — works the same locally and on Railway.
- API docs: Swagger UI at `/api/docs`, raw spec at `/openapi.json` or `docs/openapi.json` (regenerate with `npm run generate` after changing any route's swagger annotations).

---

## More docs

| Doc | Covers |
|---|---|
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | Full technical reference — the place to start for implementation work |
| [`docs/BUSINESS_RULES.md`](docs/BUSINESS_RULES.md) | Business logic decisions (timesheet structure, approval flow, allocation math) |
| [`docs/TODO.md`](docs/TODO.md) | Live punch list of open work |
| [`docs/UI.md`](docs/UI.md) | Frontend page/nav sketch |
| [`docs/openapi.json`](docs/openapi.json) | Generated API contract |
