# Architecture Reference

Accurate, current reference for this codebase's structure and conventions — written from the actual code, not from the original design sketch. If this document ever disagrees with `docs/BlackwellTime.md` on an implementation detail (function names, model shapes, enum values, routes), **trust this one**. `BlackwellTime.md`'s early sections were written before most of the implementation and have drifted significantly; its conceptual sections (timesheet generation philosophy, manifest concept, scope boundary) are still accurate, but anything naming a specific function, field, or enum value should be verified against this doc or the code instead.

Keep this updated as the codebase evolves — that's the whole point of it existing.

---

## Layering and the DB-isolation boundary

```
routes/v1/<resource>/*.ts   — parse request, call one service, return response. No business logic, no db/ imports.
        ↓
services/<domain>/*.ts      — business logic. Calls db/<domain>/ functions. Never touches HTTP or googleapis directly.
        ↓
db/<domain>/*.ts            — domain-specific reads/writes/mappers. Calls db/adapter/ functions. Never touches googleapis directly.
        ↓
db/adapter/*.ts             — the ONLY files allowed to import 'googleapis' or call getSheetsClient()/getAuthClient()/getDriveClient()/getOAuthDriveClient(). ~20 files, one Sheets/Drive operation per file.
```

**Why this matters**: the whole point of this boundary is that a future migration to a real database only touches `db/adapter/` (discarded entirely) and `db/<domain>/*.ts` (rewritten to call SQL/an ORM instead, same function signatures). `services/`, `routes/`, and `models/` shouldn't need to change at all.

This was audited on 2026-07-08 and held up almost perfectly — one violation was found and fixed (`readPayrollConfig.ts` was constructing its own `google.auth.GoogleAuth` client inline instead of reusing `getSheetsClient()`, because it needed a `batchGet` call that didn't have an adapter function yet — fixed by adding `db/adapter/readTabs.ts`). Preserve this discipline: if a new domain-layer file finds itself importing `googleapis` directly, that's a sign a new adapter function is needed, not an excuse to reach past the boundary.

---

## Folder structure

```
src/
  app.ts                    — Express setup, middleware, route registration
  config/
    constants.ts            — tab names, cache TTLs, header column arrays. No magic strings/numbers elsewhere.
  db/
    adapter/                — raw Google Sheets/Drive API mechanics (see boundary above)
    client/, employee/, activity/, fundingSource/, holiday/, supervisor/,
    payPeriod/, payrollConfig/, payrollReport/, settings/, manifest/
                             — domain-specific read*/write*/append*/map* functions
  models/                   — one interface (or controlled-vocab const) per file
  services/                 — business logic, organized by domain folder
  routes/v1/<resource>/     — one file per endpoint, wired together via each resource's index.ts, then into app.ts
  middleware/
    mapErrorResponse.ts     — global error handler, last middleware in app.ts
    ensureAuthenticated.ts  — built but wired into ZERO routes (auth is deferred, see "Deferred / out of scope" below)
  utils/
    cache.ts                — createCache<T>(ttlMs) generic in-memory TTL cache
    caches/                 — one file per cache instance (see "Caching" below)
    swagger/
      schema/                — one OpenAPI schema per file, spread into schema/index.ts
      swaggerSpec.ts, exportSwagger.ts
    oauth/getRefreshToken.ts — standalone interactive CLI script to bootstrap GOOGLE_OAUTH_REFRESH_TOKEN, never imported by the app
    logger.ts, errors.ts, dateUtils.ts, timesheetTheme.ts
tests/
  unit/       — pure functions + mocked-I/O tests, no live API calls, runs parallel. `npm test` (default).
  integration/ — hits the live Google Sheets API end-to-end, sequential (60 req/min quota), plus helpers/ (TEST_CLIENT_ID fixture, getTestPayPeriod()) and setup.ts (env loading). `npm run test:integration`, on-demand only.
```

Imports: everything in `src/` uses `#`-prefixed subpath imports (`#services/...`, `#models/...`, `#db/...`, `#utils/...`, `#config/...`, `#app.js`) as defined in `package.json`'s `imports` field — never relative paths crossing more than one directory. This was audited clean, zero drift found. Tests use the same `#`-aliases for anything reaching into `src/`; only same-directory sibling imports within `tests/` stay relative (e.g. `tests/integration/helpers/`).

---

## Naming conventions

| Verb                                                               | Layer                         | Meaning                                                                                                                                                                                                              |
| ------------------------------------------------------------------ | ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `map<Entity>`                                                      | `db/<domain>/`                | Raw sheet row (`Record<string, unknown>`) → typed domain model. First time data becomes a real type. e.g. `mapEmployee`, `mapClient`, `mapPayPeriod`.                                                                |
| `read<Thing>` / `write<Thing>` / `append<Thing>` / `delete<Thing>` | `db/adapter/`, `db/<domain>/` | Data-access verbs, reflect the operation against the data source.                                                                                                                                                    |
| `build<Thing>`                                                     | `services/<domain>/`          | Typed data → a different/computed output shape, regardless of computation complexity (trivial reshape or real aggregation both qualify). e.g. `buildAllocationRows`, `buildPayrollReportResponse`, `buildHoursRows`. |
| `sort<Thing>`                                                      | `services/<domain>/`          | Reorder a list without changing its shape. e.g. `sortPayrollReportTabs`, `sortTimesheetTabs`, `sortActivities`.                                                                                                      |
| `get<Thing>`                                                       | `services/<domain>/`          | Retrieves data, may apply business logic, may throw `NotFoundError`. e.g. `getClientById`, `getPayPeriodById`, `getClientAndPayPeriod`.                                                                              |
| `create<Thing>` / `update<Thing>`                                  | `services/<domain>/`          | Creates/updates with business rules (ID assignment, state-transition enforcement).                                                                                                                                   |
| `get`/`post`/`put`/`patch`/`delete` + resource                     | `routes/v1/`                  | Named by HTTP method + resource, one file each.                                                                                                                                                                      |

This 5-verb split (`map`/`build`/`sort`/`get`/`create`+`update`) was deliberately revisited on 2026-07-08 and confirmed to hold up — don't introduce a 6th verb (`to*`/`from*`/`resolve*` were all considered and rejected) without a similarly deliberate reason; the existing split already has a crisp, mechanical rule for each category.

**`Client + PayPeriod` resolution**: every payroll-report/pay-period service needs `clientId → client → payPeriodRegistryFileId → payPeriod`, because pay periods live in a per-client Google Sheets file — there's no way to resolve a bare `payPeriodId` without first knowing which client's registry to look in (no real fix short of a DB migration; a reverse-index cache was considered and rejected — it has a cold-start problem, since the first lookup for any given ID still needs `clientId`). This is centralized in `services/payPeriod/getClientAndPayPeriod.ts` (returns `{ client, payPeriod }`, for the few callers that need client fields afterward — `generateAllocationReport.ts`, `generatePayrollReport.ts`, `generateTimesheets.ts`) with `services/payPeriod/getPayPeriodById.ts` as a one-line wrapper around it (for callers that only need the pay period). Don't re-implement this chain inline — call one of these two.

---

## Error handling

- Services throw `NotFoundError` or `UnprocessableError` (`#utils/errors.js`) for expected failure cases.
- `middleware/mapErrorResponse.ts` (registered last in `app.ts`) maps them centrally: `NotFoundError` → 404, `UnprocessableError` → 422, unhandled → 500.
- Express 5's native async error propagation means route handlers never need `try`/`catch` — an awaited rejection in a route handler is automatically forwarded to the error middleware. Audited clean: zero manual `try`/`catch` in any route file.
- `mapErrorResponse.ts` also has `pg.DatabaseError` handling (unique constraint, FK violation, etc.) — this is pre-built for the Postgres/auth work that hasn't started yet (`pg` is never instantiated anywhere in the app today). It's intentionally-early, not dead code to clean up.
- **Don't swallow errors broadly.** A past pattern of bare `catch { return [] }` in several `db/payrollReport/read*.ts` functions (intended to mean "tab not created yet") was masking real failures (quota, auth, network) as empty results — fixed 2026-07-08 by checking `tabExists()` explicitly before reading, rather than interpreting caught exceptions. If a read might legitimately find nothing (a report section not generated yet), check for that condition explicitly; don't rely on catching whatever exception the API happens to throw.

---

## Caching

`utils/cache.ts` exports `createCache<T>(ttlMs)` — a generic in-memory `Map`-backed TTL cache (`get`/`set`/`delete`/`clear`). One instance per cached resource lives in its own file under `utils/caches/`, created with `CACHE_TTL_MEDIUM_MS` (5 min) from `config/constants.ts`. Current instances: `clientsCache`, `payPeriodsCache`, `payrollConfigCache`, `additionalExpensesCache`, `employeeExpensesCache`, `allocationReportCache`, `currentHoursCache`.

**Pattern**: the `db/<domain>/read*.ts` function checks its cache first, populates it on a miss. Whichever `db/<domain>/write*.ts` (or generation service) invalidates that data calls `<cache>.delete(key)` right after a successful write — always a single, trivial call, never conditional logic. `clientsCache` is invalidated from `services/client/createClient.ts` and `services/client/updateClient.ts`, the only two write paths to the `Clients` tab.

**Known limitation**: this cache is per-process/in-memory — not shared across multiple server instances. Not an issue today (single instance), worth knowing if this ever scales horizontally.

**Testing the invalidation wiring**: since every invalidation site is the same trivial `<cache>.delete(key)` shape, it's unit-tested by mocking the underlying `db/adapter/` calls with `vi.mock()` and asserting the cache transitions from populated to `null` across the write call — no live API needed. See `tests/unit/db/write*Tab.test.ts` for the pattern. `currentHoursCache`'s invalidation (inside `generatePayrollReport.ts`) was deliberately left without an equivalent unit test — that function has ~10 dependencies that would all need mocking to reach one assertion, disproportionate for the value; it's covered by an existing (occasionally flaky, accepted) integration test instead.

---

## Testing

Vitest 4, using `test.projects` in `vitest.config.ts`:

- **`unit`** (`tests/unit/**/*.test.ts`) — pure functions, mocked I/O, no live API calls, runs in parallel. This is `npm test` — safe to run on every save, should always be fast and quota-free.
- **`integration`** (`tests/integration/**/*.test.ts`) — hits the live Google Sheets API through the real Express app via `supertest`, sequential (`fileParallelism: false`, shared 60 req/min quota), needs `tests/integration/setup.ts` (loads `.env`) and the `TEST_CLIENT_ID` fixture in `tests/integration/helpers/testClient.ts`. This is `npm run test:integration` — on-demand only, known to be flaky from quota exhaustion (not a sign of a real bug — see `docs/TODO.md`'s Testing section for the accepted tradeoffs).

**Mocking convention** (for unit-testing a function that calls `db/adapter/` under the hood, e.g. cache-invalidation wiring): `vi.mock('#db/adapter/writeValues.js', () => ({ default: vi.fn().mockResolvedValue(undefined) }))` for each dependency, then assert on the actual observable behavior (cache state, return value) rather than on mock call arguments. If a shared fixture needs to be referenced inside a `vi.mock()` factory, use `vi.hoisted()` — factories are hoisted above top-level `const` declarations, so a bare shared `const` will throw `Cannot access '...' before initialization`.

**Time-dependent code**: use `vi.useFakeTimers()` + `vi.setSystemTime()` rather than refactoring a function to accept an injectable clock — this fully covers TTL/timestamp logic (`cache.ts`, `buildArchiveTimestamp.ts`) without touching the source. When constructing a fake `Date` for local-time assertions (`getMonth()`/`getHours()` etc., not UTC), use the `new Date(year, month, day, hours, minutes)` constructor form, not an ISO string — an ISO string is UTC and will shift depending on the test runner's timezone.

---

## Data model — the four Google Sheets file types

**Client-Config** (one file, shared across all clients — file ID in `CLIENT_CONFIG_FILE_ID` env var)

- `Clients` tab: `ClientId`, `ClientName`, `ClientCode`, `Status` (`Active`/`Inactive`), `EmployeePayrollFolderId`, `PayrollConfigFolderId`, `PayrollReportFolderId`, `PayrollConfigFileId`, `PayPeriodRegistryFileId`. There is deliberately no client-level timesheet folder field — see `TimesheetFolders` under Payroll-Config below.
- Client creation (`services/client/createClient.ts`) provisions real Drive/Sheets infrastructure, not just a row. `EmployeePayrollFolderId` is the sole folder anchor — there's no separate "root client folder" concept; if a fresh Employee Payroll folder needs to be created, a root-folder link is accepted transiently just to know where, and is never persisted. `PayrollConfigFolderId` and `PayrollReportFolderId` are created as subfolders of it by default, or accepted as existing links. Two Sheets files live inside the Payroll Config folder, named `"{ClientCode} Payroll Config"` and `"{ClientCode} Pay Period Registry"` — both created via `createOAuthWorkbook` (OAuth/client-owned, matching `generatePayrollReport.ts`'s precedent for files inside a client's folder tree), not the service-account-owned `createWorkbook`. Every folder/file input is either an existing link (verified via `services/client/resolveFolder.ts` + `db/adapter/folderExists.ts`) or a create-new signal (checked for a name collision first via `db/adapter/driveChildExists.ts`) — never a silent "if doesn't exist, create." Nothing is ever deleted programmatically; any anomaly halts that step and surfaces a specific error rather than rolling back whatever the request already created.
- The freshly-created Payroll Config file needs all 7 tabs (`Employees`, `Supervisors`, `FundingSources`, `Activities`, `Settings`, `Holidays`, `TimesheetFolders`) created via `createTabIfNotExists` even though 6 stay empty — `readPayrollConfig.ts`'s batched `readTabs` call throws if any tab is missing entirely (not just empty). Only `Settings` needs a seeded data row (values collected as part of the create request, no app-side defaults), since `readPayrollConfig` throws if it's empty. The PayPeriodRegistry file needs no tabs at creation — `createPayPeriod.ts` already lazily creates each year-tab on first use.
- Update (`services/client/updateClient.ts`) only allows `status`/`clientName`/`clientCode` to change, merging into the existing record — every other field is set once at creation. There's no delete endpoint; deactivation via `status` covers the entire "removal" need.

**Payroll-Config** (one per client, file ID = `Client.payrollConfigFileId`) — read in one batched call by `readPayrollConfig.ts` via `db/adapter/readTabs.ts`

- `Employees`: `EmployeeId`, `FirstName`, `LastName`, `Position`, `HourlyPayRate1`, `HourlyPayRate2`, `HolidayPayRate`, `Email`, `Status` (`Active`/`Inactive`), `TimesheetFileId`. Hourly/holiday pay rates ARE used in calculations (allocation proportion weighting via `buildAllocationRows.ts`) — not display-only. `TimesheetFileLink` (app-level field and sheet column) was removed 2026-07-12 — fully derivable from `TimesheetFileId`, not worth storing. `Employee.flatPayRate1`/`flatPayRate2` were removed 2026-07-13 (confirmed dead — no live sheet column ever existed for them); the dollar amount for flat-rate work lives on `Activity.flatRateAmount` instead, wired into `buildAllocationRows.ts`'s `resolveDollarRate` as of 2026-07-13 (`row.Hours` holds the *quantity* of flat-rate units for these activities, not a duration — same `quantity * dollarRate` shape as hourly).
- `Supervisors`: `SupervisorId`, `FirstName`, `LastName`, `Email`. No hard assignment to employees — any supervisor can approve any employee's timesheet.
- `FundingSources`: `FundingSourceId`, `FundingSourceName`, `FundingSourceCode` (optional, QuickBooks mapping)
- `Activities`: `ActivityId`, `ActivityName`, `TrackSeparately` (bool), `PayrollCategory` (`Regular`/`ETO`/`PTO`/`STO`), `FundingSource1Name`/`Percentage` through `FundingSource3Name`/`Percentage` (hardcoded max 3, known limitation), `PayRate` (`HourlyPayRate1`/`HourlyPayRate2`/`FlatPayRate1`/`FlatPayRate2`)
- `Settings`: `TimesheetTemplate` (maps to `Settings.timeInputMethod` in code — deliberate rename, common confusion point), `PayPeriodInterval` (`Weekly`/`Bi-Weekly`/`Monthly`), `PayPeriodStartDate`
- `Holidays`: `HolidayId`, `HolidayName`, `HolidayDate`
- `TimesheetFolders`: `TimesheetFolderId` (app-generated UUID, not the Drive folder ID itself — kept separate for consistency with every other entity's ID convention, even though the Drive folder ID is already unique), `TimesheetFolderName`, `DriveFolderId`, `Status` (`Active`/`Inactive`, no delete — same reasoning as `Client`: unlike `Supervisors`/`FundingSources`/`Activities`/`Holidays`, which are effectively snapshotted into each pay period's payroll report at generation time, `Employee`/`TimesheetFolder` persist and get referenced indefinitely with no compensating snapshot, so hard-deleting either would destroy an audit trail with no real benefit). Replaces the earlier single `Client.timesheetsFolderId` design (2026-07-13) — real clients can have several timesheet locations, so this is a proper one-to-many PayrollConfig entity instead of a single client-level field; `createEmployee.ts` requires a `timesheetFolderId` (validated against this list, must be `Active`) whenever `timesheetFileId` isn't supplied directly.

**Pay-Period-Registry** (one per client, file ID = `Client.payPeriodRegistryFileId`) — one tab per calendar year (e.g. `"2026"`)

- Columns: `PayPeriodId`, `PayPeriodName` (e.g. `"06/01 - 06/14"`), `Status` (`Pending`→`Open`→`Processed`→`Closed`, forward-only, no enforcement), `StartDate`, `EndDate`, `CreatedDate`, `PayrollReportFileId` (empty string until first report generation)

**Employee Timesheet** (one per employee, file ID = `Employee.timesheetFileId`, created on first timesheet generation)

- One tab per pay period, named by `PayPeriodName`. Ordered newest-first via `sortTimesheetTabs.ts` (sorts by the real `PayPeriod.startDate`, not by parsing the tab name).
- One `_manifest` tab (`MANIFEST_TAB` constant), pinned to the far right — internal bookkeeping (JSON blob per pay period describing exact row/column layout), never shown to users. Structure: `TimesheetManifest` model.

**Payroll Report workbook** (one per pay period, once generated — file ID = `PayPeriod.payrollReportFileId`)

- Active tabs (left, in this order, filtered to whichever exist): `current_hours`, `current_payroll_summary`, `EmployeeExpenses`, `AdditionalExpenses`, `AllocationReport`
- Archive tabs (right): `hrs_MMDD_HHmm` / `payroll_MMDD_HHmm` pairs (same timestamp per run), sorted newest-first, pairs kept adjacent. Ordering enforced by `sortPayrollReportTabs.ts` after any write, via the shared `reorderTabs.ts`/`listTabNames.ts` adapters.
- `EmployeeExpenses` columns: `employeeId`, `employeeName`, `activeThisPayPeriod`, `totalExpense` (nullable — not yet entered vs. entered as zero)
- `AdditionalExpenses` columns: `expenseName`, `amount`
- `AllocationReport` columns: `fundingSourceName`, `wagesAllocation`, `additionalExpenses`, `total`
- `current_hours` / `current_payroll_summary`: written by `generatePayrollReport.ts` from signed timesheets only (both employee + supervisor signatures present)

**Read functions for the report sub-tabs return `T[] | null`** (as of 2026-07-08): `null` = tab doesn't exist yet (that step of the process hasn't happened), `[]` = tab exists but has no rows. The public `GET` services (`getEmployeeExpenses`, `getAdditionalExpenses`, `getAllocationReport`) currently coalesce `null → []` at their boundary to keep the external API returning a plain array — but the distinction is preserved at the `db/` layer for any future caller that wants it (e.g. `getPayrollReport.ts` already propagates `null` directly, since its contract was already `T | null`).

---

## Deferred / intentionally out of scope

Don't flag these as gaps — they're deliberate, not missed:

- **Auth** — Google OAuth via Passport is not wired up. `ensureAuthenticated.ts` middleware exists but is applied to zero routes; no `passport`/`express-session` setup in `app.ts`. Dependencies (`connect-pg-simple`, `express-session`, `openid-client`, `passport-google-oauth20`) are installed but 0% used, pre-staged for this work.
- **Postgres** — `pg` is installed and `mapErrorResponse.ts` has `DatabaseError` handling ready, but nothing instantiates a `Pool`/`Client` anywhere. `src/db/postgres/user/` and `src/db/postgres/auditLog/` exist as empty directories.
- **The other "future" left-drawer nav items** (Employees, Supervisors, Funding Sources, Activities, Holidays, Settings management screens) — marked future in `docs/UI.md`, not started.

---

## Endpoint reference

Don't maintain a hand-written route list here — it'll drift the same way `BlackwellTime.md`'s did. `docs/openapi.json` is the generated, always-accurate source of truth (regenerated via `npm run generate` from the `@swagger` JSDoc blocks above each route handler — run this after adding or changing a schema so it stays in sync). Current resources: `client` (list, `:clientId/employees`, `:clientId/summary`, create, update), `payPeriod` (list, `next`, `:payPeriodId`, create, update, close), `timesheet` (generate, status), `timesheetFolder` (list, create, update), `payrollReport` (get report, generate, employeeExpenses get/put/batch, additionalExpenses get/put, allocationReport get/generate), `admin` (`cache/clear`), `health`.

---

## Other docs — what's where

- `docs/TODO.md` — live punch list, treat as current source of truth for open work
- `docs/BUSINESS_RULES.md` — business logic decisions (timesheet structure, approval flow, payroll report re-run behavior, funding source allocation math)
- `docs/BlackwellTime.md` — original design sketch; conceptual sections still useful, implementation-detail sections stale (see banner at top of that file)
- `docs/UI.md` — frontend page/nav sketch
- `docs/DECISIONS.md` — open questions requiring client (Blackwell) sign-off, not engineering decisions
