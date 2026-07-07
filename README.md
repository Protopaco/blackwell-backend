# Blackwell Time — Backend

Node/TypeScript API service that automates timesheet generation and payroll cost allocation for Blackwell Bookkeeping. Blackwell manages payroll for multiple nonprofit clients. Timesheets are built in Google Sheets; this service handles generation, formatting, status tracking, and pay period management.

---

## Quick Start

```bash
npm install
npm run watch        # development with hot reload + pretty logs
npm run test         # run Vitest test suite
npm run build        # compile TypeScript to dist/
npm run generate     # export openapi.json from live spec
```

**Environment variables required** — copy `.env-example` to `.env`:

| Variable | Description |
|---|---|
| `GOOGLE_SERVICE_ACCOUNT_JSON` | Full service account JSON as a string |
| `GOOGLE_OAUTH_CLIENT_ID` | OAuth client ID for file creation |
| `GOOGLE_OAUTH_CLIENT_SECRET` | OAuth client secret |
| `GOOGLE_OAUTH_REFRESH_TOKEN` | Offline refresh token for OAuth file creation |
| `CLIENT_CONFIG_FILE_ID` | Google Sheets file ID of the Client-Config spreadsheet |
| `FRONTEND_BASE_URL` | Frontend origin for CORS (production) |
| `PORT` | HTTP port (default 3000) |

---

## Architecture

```
Google Sheets (data storage + employee-facing UI)
        ↕
Blackwell Time API (this service — Express/Node/TypeScript)
        ↕
Blackwell Time Dashboard (React frontend — separate repo)
```

**Three strict layers:**

```
routes/     — parse HTTP, call one service, return response. No business logic.
services/   — business logic. Calls db/ functions. Knows nothing about HTTP.
db/         — data access. Calls sheetsAdapter only. No business logic.
```

Routes never call `db/` directly. Services never touch the adapter directly. Each layer is designed to be replaced without touching the others.

---

## Tech Stack

- **Runtime:** Node.js + TypeScript (ESM)
- **Framework:** Express 5
- **Hosting:** Railway
- **Data layer:** Google Sheets API (via service account + OAuth)
- **Auth:** Google OAuth via Passport.js (sessions in PostgreSQL)
- **Logging:** Pino + pino-http
- **Testing:** Vitest + Supertest
- **API docs:** swagger-jsdoc + swagger-ui-express

---

## Folder Structure

```
src/
  app.ts                              Express setup, middleware, routes
  db/
    adapter/
      sheetsAdapter.ts               ONLY file that touches Google APIs
    activity/                        readActivities, mapActivity
    client/                          readClients, readClientById
    employee/                        readEmployees, readEmployeeById, updateEmployeeTimesheetFile
    fundingSource/                   readFundingSources, mapFundingSource
    holiday/                         readHolidays, mapHoliday
    manifest/                        readManifest, appendManifest, deleteManifest
    payPeriod/                       readPayPeriods, readPayPeriodById, appendPayPeriod, writePayPeriod
    payrollConfig/                   readPayrollConfig (batch load of all config tabs)
    settings/                        readSettings, mapSettings
    supervisor/                      readSupervisors, mapSupervisor
  middleware/
    ensureAuthenticated.ts
    mapErrorResponse.ts
  models/                            TypeScript interfaces and controlled vocabularies
  routes/
    v1/
      admin/                         POST /admin/clearCache
      client/                        GET /client
      health/                        GET /health
      payPeriod/                     GET/POST/PUT /payPeriod
      timesheet/                     POST /timesheet/generate, GET /timesheet/status
  services/
    client/                          getClients, getClientById
    employee/                        getEmployees
    payPeriod/                       getPayPeriods, getPayPeriodById, getNextPayPeriod, createPayPeriod, updatePayPeriod
    timesheet/
      generateTimesheets.ts          Main orchestrator
      applyTimesheetFormatting.ts    Batch formatting after write
      buildWeek.ts                   Builds one week's rows + manifest
      checkTimesheetStatus.ts        Reads signature cells to determine status
      getTimesheetStatuses.ts        Status for all employees for a pay period
      rowBuilders.ts                 Pure functions: one row type per function
      sortActivities.ts              Splits and sorts activities by category
      formatting/                    One file per formatting concern
  utils/
    cache.ts                         TTL in-memory cache (used by readClients, readPayrollConfig)
    dateUtils.ts                     Date range, chunking, display formatting
    logger.ts                        Pino logger instance
    timesheetTheme.ts                Centralized colors and column widths
    oauth/                           One-time refresh token helper
    swagger/                         Spec generation and schema definitions
```

---

## API Endpoints

### Health
```
GET /api/v1/health
```

### Clients
```
GET /api/v1/client
  Returns all clients. Client creation stays in Apps Script.
```

### Pay Periods
```
GET  /api/v1/payPeriod?clientId=guid         All pay periods for a client
GET  /api/v1/payPeriod/:payPeriodId          Single pay period
GET  /api/v1/payPeriod/next?clientId=guid    Suggested next period (not saved)
POST /api/v1/payPeriod                       Create new pay period
PUT  /api/v1/payPeriod/:payPeriodId          Update (including status transitions)
```

### Timesheets
```
POST /api/v1/timesheet/generate
  Body: { clientId: Guid, payPeriodId: Guid }
  Generates timesheets for all active employees. Idempotent — skips employees who already have one.

GET /api/v1/timesheet/status?clientId=guid&payPeriodId=guid
  Returns status per active employee: NotGenerated | Generated | Submitted | Approved | Complete
```

### Admin
```
POST /api/v1/admin/clearCache    Clears the in-memory config cache
```

API docs available at `/api/docs` (Swagger UI) and `/openapi.json`.

---

## Timesheet Generation

### Overview

`generateTimesheets(clientId, payPeriodId)` is the core service. It:

1. Loads the client, pay period, and full payroll config (one batch read)
2. Filters to active employees
3. Chunks the pay period date range into 7-day weeks
4. Sorts all activities into three groups (work, time off, flat rate)
5. For each employee:
   - Checks if a timesheet already exists — skips if so
   - Creates a new Google Sheets file via OAuth if the employee doesn't have one yet (writes the file ID back to the config sheet)
   - Builds all rows in memory: header, employee row, dividers, then one week section per week, signatures, and summary formulas
   - Writes all rows in a single batch call
   - Applies all formatting in a single `batchUpdate` call
   - Saves the manifest

### Row Layout (per tab)

```
Row 1:   Pay Period header
Row 2:   Employee name + position
Row 3:   Divider

[Week 1]
  Holiday row (holiday names above matching date columns)
  Day row (Mon, Tue, Wed...)
  Date row (6/1, 6/2... + "Total" at end)
  Work activity rows (Base/Secondary — alphabetical)
  Time off activity rows (ETO/PTO/STO — alphabetical)
  Daily Total row (SUM formulas per column + weekly total)
  [Optional flat rate divider + flat rate rows if any exist]
  Divider

[Week 2...N — same structure]

Divider
Employee Signature:   [empty cell]
Supervisor Signature: [empty cell]
Divider

[Summary]
Total Hours Worked    =SUM of all hourly activity rows
Holiday Hours         =SUM of all hourly cells in holiday columns
ETO                   =SUM of ETO rows (only if ETO activities exist)
PTO                   =SUM of PTO rows (only if PTO activities exist)
STO                   =SUM of STO rows (only if STO activities exist)
Flat Rate Shifts      =COUNTA of flat rate rows (only if flat rate activities exist)
```

Columns: A = labels, B–H (or more) = one column per day, last column = weekly total.

### Activity Sort Order

`sortActivities()` divides activities into three groups, each sorted alphabetically:

1. **Work activities** — `PayrollCategory = Base` or `Secondary`
2. **Time off activities** — `PayrollCategory = ETO`, `PTO`, or `STO`
3. **Flat rate activities** — `PayRate = FlatRate`

Flat rate rows always appear after a divider. Work and time off are contiguous.

### Idempotency

- Checks the manifest before generating. If a manifest exists AND the tab still exists — skips.
- If a manifest exists but the tab was deleted — regenerates (recovers from manual deletion).
- Sheet and manifest are always created and deleted together.

### New Employee File Creation

When an employee has no `timesheetFileId`, the service creates a new Google Sheets file via OAuth (so the file is owned by the Blackwell user, not the service account). The new file ID and link are written back to the Employees config tab immediately.

### Manifest

Every generated timesheet has a companion `_manifest` tab storing a JSON blob. The manifest records:

- `payPeriodId`, `employeeId`, `generatedAt`, `tabName`
- Per-week: `dateRow`, `dailyTotalRow`, date-to-column mapping, activity-to-row mapping, flat rate row mapping
- Signature cell coordinates (row + column, 1-based) for the employee and supervisor rows

The manifest lets `checkTimesheetStatus` read signature cells by coordinate without interrogating the sheet structure.

### Timesheet Status

`checkTimesheetStatus` reads the manifest to get signature cell coordinates, then reads the full tab values and indexes into those coordinates directly. Status progression:

```
NotGenerated  — no manifest found
Generated     — manifest exists, no signatures
Submitted     — employee signature present
Approved      — supervisor signature present (but not both)
Complete      — both signatures present
```

Note: reading via specific A1 range notation fails when tab names contain `/` characters (e.g. `06/01 - 06/14`). The service reads the full tab and indexes by coordinate instead.

---

## Formatting

`applyTimesheetFormatting` collects all Google Sheets formatting requests and sends them in a single `batchUpdate` call immediately after writing values. Individual formatting functions live in `src/services/timesheet/formatting/`, one file per concern:

| File | Responsibility |
|---|---|
| `formatFreezeRows.ts` | Freeze top 3 header rows |
| `formatColumnWidths.ts` | Label column (165px), day columns (100px) |
| `formatHeaderRows.ts` | Pay period + employee name rows styling |
| `formatWeekSection.ts` | Holiday row, day/date rows, activity rows, daily total row, weekend/holiday column shading |
| `formatSignatureRows.ts` | Employee + supervisor signature rows |
| `formatSummaryRows.ts` | Summary label + value rows at bottom |
| `formatActivityRows.ts` | Per-row formatting for activity cells |
| `formatDividerRows.ts` | Empty separator rows |
| `formatDateRow.ts` | Date header row |
| `formatDayOfWeekRow.ts` | Day name header row |
| `formatDailyTotalRow.ts` | Daily total formulas row |
| `formatHolidayNameRow.ts` | Holiday name row |
| `mergeCells.ts` | Cell merge helper |
| `outlineBorder.ts` | Border helper |
| `fillRange.ts` | Background fill helper |
| `fillRow.ts` | Row fill helper |
| `apiRange.ts` | GridRange builder helper |
| `isWeekend.ts` | Weekend detection helper |
| `setFlatDataValidation.ts` | Integer-only validation for flat rate cells |
| `setHourDataValidation.ts` | Decimal-only validation for hourly cells |

### Theme

All colors and column widths are defined in `src/utils/timesheetTheme.ts`. Never define colors inline in formatting files.

| Name | Hex | Usage |
|---|---|---|
| `PRIMARY` | `#0E1733` | Structural rows: day/date headers, label column, dividers, daily totals |
| `SECONDARY` | `#6565AB` | Pay period and employee name header rows |
| `ACCENT` | `#7A305C` | Holiday name cells |
| `MUTED_ACCENT` | `#D9C7D3` | Reserved for future use |
| `MUTED_ACCENT_DARK` | `#DFB7D2` | Holiday columns on odd flat rate rows |
| `MUTED` | `#DCDEF0` | Weekend and holiday data cells; summary value cells |
| `WHITE` | `#FFFFFF` | Text on dark backgrounds |
| `BLACK` | `#000000` | Standard text |

---

## Data Layer

### Google Sheets Files

| File type | Quantity | Contains |
|---|---|---|
| Client-Config | 1 (shared) | All clients |
| Payroll-Config | 1 per client | Employees, Supervisors, FundingSources, Activities, Settings, Holidays |
| Pay-Period-Registry | 1 per client | One tab per calendar year with all pay periods |
| Employee Timesheet | 1 per employee | One tab per pay period + `_manifest` tab |

### sheetsAdapter

The only file that touches Google APIs. All other `db/` files call it.

**Naming convention:** "Workbook" = the Google Sheets file. "Tab" = a sheet inside it.

| Function | Description |
|---|---|
| `createWorkbook` | Creates a Sheets file owned by the service account |
| `createOAuthWorkbook` | Creates a Sheets file owned by the OAuth user (required for employee files) |
| `createTab` | Adds a new tab; throws if already exists |
| `createTabIfNotExists` | Safe idempotent version of createTab |
| `tabExists` | Returns true/false for a tab name |
| `readTab` | Reads a tab, maps rows to keyed objects using header row |
| `readTabValues` | Reads raw 2D array — no header mapping |
| `writeTab` | Overwrites a tab with keyed row objects |
| `writeValues` | Writes a raw 2D array with USER_ENTERED (formulas interpreted) |
| `updateCells` | Writes to a specific A1 range with USER_ENTERED |
| `appendRow` | Appends a single keyed row to a tab |
| `deleteTab` | Deletes a tab by name |
| `deleteRow` | Deletes a single row (1-based) from a tab |
| `getSheetId` | Returns numeric sheetId for a tab (required by formatting requests) |
| `applyFormattingRequests` | Sends pre-built formatting requests in one batchUpdate |

`deleteWorkbook` is intentionally omitted — employee timesheet files must never be deleted through the tool.

### Auth

Two auth modes in the adapter:

- **Service account** — reads config sheets, writes timesheet content, applies formatting. Credentials from `GOOGLE_SERVICE_ACCOUNT_JSON`.
- **OAuth2 (offline)** — creates new Google Drive files so they are owned by the real Blackwell user, not the service account. Requires a one-time authorization flow; stores refresh token in `GOOGLE_OAUTH_REFRESH_TOKEN`.

### In-Memory Cache

`src/utils/cache.ts` provides a generic TTL cache. Used by:
- `readClients` — avoids repeated reads of the Client-Config sheet
- `readPayrollConfig` — avoids repeated reads of the Payroll-Config tabs on each generation call

Cache can be cleared via `POST /api/v1/admin/clearCache`.

---

## Pay Periods

Pay period intervals: Weekly, Bi-weekly. Monthly is defined but not yet implemented.

Pay period names follow `MM/DD - MM/DD` format.

`getNextPayPeriod` reads the settings (interval + start date) and existing pay periods to suggest the next period. It returns an unsaved suggested `PayPeriod` — the UI confirms before `createPayPeriod` assigns an ID and saves it.

Status transitions: `Draft → Pending → Open → Closed`. Handled by `updatePayPeriod`.

Week chunking: `chunkDatesByWeek` splits date arrays into 7-day blocks starting from the pay period start date — not calendar week boundaries. A pay period starting Wednesday chunks Wed–Tue, not Mon–Sun.

---

## Models

All models in `src/models/`. One file per model. IDs use the `Guid` type alias (`string`).

Controlled vocabularies use the `const` object pattern (not TypeScript enums):

```typescript
export const PayPeriodStatus = {
  Draft: "Draft",
  Pending: "Pending",
  Open: "Open",
  Closed: "Closed",
} as const;
export type PayPeriodStatus = typeof PayPeriodStatus[keyof typeof PayPeriodStatus];
```

Vocabularies: `EmployeeStatus`, `PayPeriodStatus`, `TimesheetStatus`, `PayPeriodInterval`, `PayrollCategory`, `PayRate`, `TimeInputMethod` (stored as `TimesheetTemplate` in the config sheet — see known issues below).

---

## Tests

Vitest test suite in `tests/`. Integration tests hit the real Express app via Supertest — no database mocking.

| Test file | Covers |
|---|---|
| `health/health.test.ts` | GET /health |
| `client/getClients.test.ts` | GET /client |
| `payPeriod/getPayPeriods.test.ts` | GET /payPeriod |
| `payPeriod/getPayPeriodById.test.ts` | GET /payPeriod/:id |
| `payPeriod/getNextPayPeriod.test.ts` | GET /payPeriod/next |
| `timesheet/generateTimesheets.test.ts` | POST /timesheet/generate |
| `timesheet/getTimesheetStatus.test.ts` | GET /timesheet/status |
| `timesheet/buildWeek.test.ts` | buildWeek() unit tests |
| `timesheet/rowBuilders.test.ts` | Row builder unit tests |
| `timesheet/sortActivities.test.ts` | sortActivities() unit tests |
| `utils/dateUtils.test.ts` | Date utility unit tests |

---

## Known Issues and Deferred Work

### TimesheetTemplate vs TimeInputMethod

`TimesheetTemplate` in the config sheet stores `TotalHours` or `ClockInOut`. These are not different templates — they are different time input methods for the same template. The model should be renamed to `TimeInputMethod`. Deferred to a future cleanup pass.

### FundingSource Column Limit

Activities support a maximum of three funding sources stored as flat columns (`FundingSource1Name`, `FundingSource1Percentage`, etc.). Accepted as sufficient for current clients. Revisit when migrating to a real database.

### ClockInOut Template

Defined in the vocabulary but not yet implemented. `TotalHours` is the only active template.

### Monthly Pay Period Interval

Defined in `PayPeriodInterval` but not implemented in `getNextPayPeriod`.

### Time Entry Reading

`readTimeEntries` is deferred. Planned to read approved hours from a timesheet using the manifest and return normalized `TimeEntry` records. Required for payroll report generation.

### Payroll Reports

Phase 2. One Google Sheets file per pay period with four tabs: `Hours`, `ADP Summary`, `Results` (bookkeeper-filled), `Allocation` (formula-driven). Not yet implemented.

### PostgreSQL / Auth

Dependencies installed (`passport`, `connect-pg-simple`, `pg`, `openid-client`). Auth and session storage not yet wired up. `ensureAuthenticated` middleware exists but is not applied to routes.

---

## Code Style Rules

These are enforced in CLAUDE.md and apply everywhere:

- **One function per file**
- **Arrow functions always** — no `function` keyword
- **Default exports** whenever possible
- **Fully descriptive variable names** — no abbreviations, no single letters, no ambiguous shorthand (`columnIndex` not `col`, `rowIndex` not `r`, `backgroundColor` not `bg`)
- **One-line comment above every function** describing what it does and when it is used
- **All colors in `timesheetTheme.ts`** — never inline
- **No magic numbers** — all constants in context or named variables
- **Layers are strict** — routes → services → db → adapter

---

## Database (Phase 1)

PostgreSQL on Railway. Current scope: auth sessions and audit log only.

```sql
-- Managed by connect-pg-simple
CREATE TABLE user_sessions (...);

CREATE TABLE users (
  id        SERIAL PRIMARY KEY,
  googleId  VARCHAR(255) UNIQUE,        -- null until first login
  email     VARCHAR(255) UNIQUE NOT NULL,
  name      VARCHAR(255),
  active    BOOLEAN NOT NULL DEFAULT true,
  createdAt TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE audit_log (
  id        SERIAL PRIMARY KEY,
  userId    INT REFERENCES users(id),   -- nullable (login rejections)
  action    VARCHAR(255) NOT NULL,
  payload   JSONB,
  createdAt TIMESTAMP NOT NULL DEFAULT NOW()
);
```

Database migrations live in `blackwell-setup/` (separate project).

Phase 2 will migrate config and timesheet data from Google Sheets to PostgreSQL — replacing `db/` files one at a time without touching services or routes.
