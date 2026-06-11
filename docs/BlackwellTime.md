# Blackwell Time — Project Documentation

## Project Overview

A Node/TypeScript backend service that automates timesheet generation and payroll cost allocation for Blackwell Bookkeeping. Blackwell manages payroll for multiple nonprofit clients. The current process is entirely manual — timesheets are built by hand in Google Sheets, formulas are manually maintained, holidays are manually applied, and cost allocation is done in spreadsheets.

This service automates the heavy lifting while keeping Google Sheets as the delivery layer, since Blackwell and their clients are already comfortable with it.

---

## Architecture Overview

### Three Concerns, Kept Apart

```
Google Sheets (data storage + employee-facing UI)
        ↕
Blackwell Time API (this service — Express/Node/TypeScript)
        ↕
Blackwell Time Dashboard (web UI for Blackwell staff)
```

### What Stays in Apps Script
Configuration UIs — adding clients, employees, activities, funding sources, holidays, pay periods. This is already built and working. It writes configuration data to Google Sheets. The new service reads from those same sheets.

### What Lives in This Service
- Timesheet generation
- Manifest generation and storage
- Reading approved hours
- Allocation calculation
- Export (ADP, QuickBooks — future)
- Dashboard API

---

## Tech Stack

- **Runtime:** Node.js + TypeScript (ESM)
- **Framework:** Express
- **Hosting:** Railway
- **Data layer:** Google Sheets API (temporary — designed to be replaced with a real database)
- **Database:** PostgreSQL (hosted on Railway)
- **Auth:** Google OAuth via Passport.js
- **Sessions:** express-session + connect-pg-simple (stored in PostgreSQL)
- **Logging:** Pino
- **Testing:** Vitest
- **Other:** dotenv, cors

### Dependencies (expected)
```
express
typescript
tsx
pino
pino-http
passport
passport-google-oauth20
express-session
connect-pg-simple
pg
dotenv
cors
googleapis
```

### Dev Dependencies
```
vitest
pino-pretty
prettier
@types/*
nodemon
```

---

## Code Style Rules

These are non-negotiable. Every file in this project follows these rules.

- **One function per file**
- **Each function does one thing**
- **Arrow functions always** — no `function` keyword
- **Default exports whenever possible**
- **No one-letter variable names** — every variable name describes what it means
- **No magic numbers or hardcoded strings** — all constants live in `src/config/constants.ts`
- **Interfaces for object shapes**
- **Use `const` object pattern for controlled vocabularies** — not TypeScript enums
- **Keep layers separated** — routes don't touch the db, services don't touch HTTP, db doesn't touch business logic
- **CSS in `.css` files** — no inline styles
- **Error handling is centralized** — not scattered across files
- **Logging is a shared service**

### Controlled Vocabulary Pattern
```typescript
export const PayPeriodStatus = {
  Draft: "Draft",
  Open: "Open",
  Closed: "Closed",
} as const;

export type PayPeriodStatus = typeof PayPeriodStatus[keyof typeof PayPeriodStatus];
```

---

## Folder Structure

```
src/
  app.ts                          — Express setup, middleware, route registration
  config/
    constants.ts                  — All controlled values, no magic strings/numbers
  db/
    adapter/
      sheetsAdapter.ts            — ONLY file that touches Google Sheets API
    client/
    employee/
    activity/
    fundingSource/
    payPeriod/
    settings/
    holiday/
    manifest/
  models/                         — TypeScript interfaces, one per file
  services/                       — Business logic, calls db/, knows nothing about HTTP
  routes/
    v1/                           — One folder per resource, one file per endpoint
  middleware/
    mapErrorResponse.ts
  utils/
    logger.ts
    dateUtils.ts
```

---

## Data Layer Philosophy

- All Google Sheets access lives in `db/adapter/sheetsAdapter.ts` only
- Everything else in `db/` calls the adapter — never Google directly
- One file per operation
- Designed to be replaced one file at a time when migrating to a real database
- When that happens: rewrite the file to call SQL instead of the adapter — nothing else changes

### Naming Conventions

**`db/` layer** — data access verbs, reflect the operation against the data source:
- `readX` — reads one or more records
- `writeX` — replaces/updates existing records
- `appendX` — adds a new record
- `deleteX` — removes a record
- `mapX` — maps a raw row to a typed model (shared, used by readX and readPayrollConfig)

**`services/` layer** — business logic verbs, reflect intent:
- `getX` — retrieves data, may apply business logic
- `createX` — creates a new record, assigns IDs, enforces rules
- `updateX` — updates an existing record, enforces state transitions

**`routes/` layer** — named by HTTP method + resource:
- `getX`, `postX`, `putX`, `deleteX`

### Layer Rules
- Routes call services only — never `db/` directly
- Services call `db/` functions — never the adapter directly
- `db/` functions call the adapter — never Google APIs directly
- Infrastructure concerns (env vars, file IDs) live in the `db/` layer, not services or routes
- `CLIENT_CONFIG_FILE_ID` lives only in `db/client/readClients.ts`

### sheetsAdapter Operations

**Naming convention:** We use **Workbook** for the file and **Tab** for a sheet inside it. This follows the Excel convention and avoids the ambiguity of shortening "Spreadsheet" to "Sheet".

Two levels of operations:

**Workbook level:**
- `createWorkbook` — creates a new Google Sheets file, returns the new workbook ID

**Tab level:**
- `createTab` — adds a new tab to an existing workbook
- `readTab` — reads all rows from a tab, returns array of objects keyed by header
- `writeTab` — writes rows to a tab in one batch call, full replacement
- `appendRow` — appends a single row to a tab
- `deleteTab` — deletes a tab from a workbook
- `deleteRow` — deletes a specific row from a tab by 1-based row number

> `deleteWorkbook` is intentionally omitted. Once an employee begins using their timesheet file it must be protected. Deletion at the workbook level is too dangerous.

> `createTab` and `writeTab` are intentionally separate. Chaining them when needed is the responsibility of the service layer.

> `writeTab` always replaces. The caller is responsible for knowing when to write. "If not exists" logic lives in the service layer, not the adapter.

### Auth

Uses a Google Cloud service account. Credentials are stored as a JSON string in the `GOOGLE_SERVICE_ACCOUNT_JSON` environment variable. Parsed at runtime — no file on disk, works the same locally and on Railway.

Never commit the service account credentials. `service-account.json` is in `.gitignore`.

### Function Signatures

```typescript
const createWorkbook = async (name: string, folderId?: string): Promise<string>
const createTab = async (workbookId: string, tabName: string): Promise<void>
const readTab = async (workbookId: string, tabName: string): Promise<Record<string, unknown>[]>
const writeTab = async (workbookId: string, tabName: string, rows: Record<string, unknown>[]): Promise<void>
const appendRow = async (workbookId: string, tabName: string, row: Record<string, unknown>): Promise<void>
const deleteTab = async (workbookId: string, tabName: string): Promise<void>
const deleteRow = async (workbookId: string, tabName: string, rowNumber: number): Promise<void>
// rowNumber is 1-based — the adapter handles conversion to 0-based for the Sheets API
```

---

## Data Layer — Structure

### Overview

There are four types of Google Sheets files in the system:

```
Client-Config (one, shared)
  └── Clients sheet

Payroll-Config (one per client)
  └── Employees sheet
  └── Supervisors sheet
  └── FundingSources sheet
  └── Activities sheet
  └── Settings sheet
  └── Holidays sheet

Pay-Period-Registry (one per client)
  └── {year} sheet (one per calendar year, e.g. "2026")

Employee Timesheet (one per employee)
  └── {PayPeriodName} sheet (one per pay period, e.g. "06/01 - 06/14")
  └── _manifest sheet (one per pay period — hidden, machine-readable)
```

---

### Client-Config Spreadsheet

**File ID:** stored in environment variable `CLIENT_CONFIG_FILE_ID`
**One file, shared across all clients.**

#### Clients Sheet

| Column | Description |
|---|---|
| clientId | UUID |
| clientName | Display name |
| clientCode | Short code |
| trackFundingSource | Boolean |
| clientFolderLink | Google Drive folder URL |
| clientFolderId | Google Drive folder ID |
| employeePayrollFolderId | ID of Employee/Payroll subfolder |
| payrollConfigFolderId | ID of Payroll Config subfolder |
| reportsFolderId | ID of Reports subfolder |
| payrollReportFolderId | ID of Payroll Reports subfolder |
| allocationReportFolderId | ID of Allocation Reports subfolder |
| timesheetsFolderId | ID of Timesheets subfolder |
| payrollConfigFileId | ID of the Payroll-Config spreadsheet |
| payPeriodRegistryFileId | ID of the Pay-Period-Registry spreadsheet |

---

### Payroll-Config Spreadsheet

**One per client.** File ID stored in the Clients sheet (`payrollConfigFileId`).
Created automatically when a client is added.

#### Employees Sheet

| Column | Description |
|---|---|
| EmployeeId | UUID |
| FirstName | |
| LastName | |
| Position | Job title |
| BasePayRate | Hourly rate — display only, never used in calculations |
| SecondaryPayRate | Secondary rate — display only, never used in calculations |
| HolidayPayRate | Holiday rate — display only, never used in calculations |
| Email | |
| Status | Active / Inactive |
| TimesheetFileLink | Google Sheets URL |
| TimesheetFileId | Google Sheets file ID |

#### Supervisors Sheet

| Column | Description |
|---|---|
| SupervisorId | UUID |
| SupervisorFirstName | |
| SupervisorLastName | |
| SupervisorEmail | |

> Supervisors are client-side managers, never Blackwell employees. There is no hard assignment between supervisors and employees — any supervisor can approve any employee's timesheet. Whoever approves signs it.

#### FundingSources Sheet

| Column | Description |
|---|---|
| FundingSourceId | UUID |
| FundingSourceName | |
| FundingSourceCode | Optional. Accounting code for QuickBooks mapping — display name and QBO identifier may differ |

#### Activities Sheet

| Column | Description |
|---|---|
| ActivityId | UUID |
| ActivityName | |
| TrackSeparately | Boolean |
| PayrollCategory | Base / ETO / PTO / STO / Holiday |
| FundingSource1Name | — needs redesign, max 3 hardcoded |
| FundingSource1Percentage | |
| FundingSource2Name | |
| FundingSource2Percentage | |
| FundingSource3Name | |
| FundingSource3Percentage | |
| PayRate | Base / Secondary / Holiday / FlatRate |
| FlatRateAmount | |

> ⚠️ The hardcoded FundingSource1/2/3 columns are a known limitation. Three funding sources per activity is accepted as sufficient for now. Revisit when migrating to a real database.

#### Settings Sheet

| Column | Description |
|---|---|
| TimesheetTemplate | `TotalHours` or `ClockInOut` — controls which timesheet template is generated |
| PayPeriodInterval | Weekly / Bi-weekly / Monthly |
| PayPeriodStartDate | Canonical date string (YYYY-MM-DD) |

> Settings are client-level. Set once during client setup, rarely changed. Not shared across clients.

#### Holidays Sheet

| Column | Description |
|---|---|
| HolidayId | UUID |
| HolidayName | e.g. "MLK Day" |
| HolidayDate | Canonical date string (YYYY-MM-DD) |

> Holidays are shared across all employees for a client.

---

### Pay-Period-Registry Spreadsheet

**One per client.** File ID stored in the Clients sheet (`payPeriodRegistryFileId`).
Created automatically when a client is added.

One sheet tab per calendar year (e.g. "2026").

#### {Year} Sheet

| Column | Description |
|---|---|
| PayPeriodId | UUID |
| PayPeriodName | e.g. "06/01 - 06/14" |
| Status | Draft / Pending / Open / Closed |
| StartDate | Canonical date string (YYYY-MM-DD) |
| EndDate | Canonical date string (YYYY-MM-DD) |
| CreatedDate | |

---

### Employee Timesheet Spreadsheet

**One per employee.** File ID stored in the Employees sheet (`TimesheetFileId`).
Created automatically on first timesheet generation for that employee.

One sheet tab per pay period, named by PayPeriodName (e.g. "06/01 - 06/14").
One hidden `_manifest` tab per pay period.

#### Timesheet Layout (TotalHours template)

```
Row 1:    Pay Period header
Row 2:    Employee name + position
Row 3:    Divider

[Week 1]
Row 4:    Holiday row (holiday names by date column)
Row 5:    Day row (Mon, Tue, Wed...)
Row 6:    Date row (6/1, 6/2, 6/3...)
Row 7+:   Activity rows (one per activity)
Last:     Divider

[Week 2]
...same structure...

Footer:
          Employee signature row
          Supervisor signature row

Summary:
          Total hours by activity
```

Columns: A = label, B-H = days of week (Mon-Sun)

#### _manifest Sheet

Stores a single JSON blob describing the exact structure of the timesheet.
Used by the service to read back approved hours without interrogating the sheet.
Never visible to or edited by users.

Structure defined in models — see `TimesheetManifest` interface.

---

## Timesheet Generation

### Core Concept
Generate entire timesheet structure in memory, write to Google Sheets in one batch call. No read-after-write. No metadata lookups during generation.

### Manifest
Every generated timesheet has a companion manifest stored in a hidden `_manifest` sheet tab in the same file. The manifest records exactly which row each activity landed on and which columns are dates/holidays. Used later to read back approved hours without interrogating the sheet structure.

### Idempotent Generation
- If a timesheet sheet already exists for a pay period — skip it
- If it does not exist — create it
- Sheet and manifest are always created and deleted together — they are one unit
- To fix a timesheet: delete the sheet + manifest, regenerate

### Generation Pipeline
```
Trigger generation for client + pay period
  → Load all config (employees, activities, holidays, pay period, settings)
  → For each active employee:
      → Check if sheet exists (skip if yes)
      → Build header in memory
      → Build body in memory
      → Build footer in memory
      → Build summary in memory
      → Build manifest in memory
      → Write everything in one batch call
      → Save manifest
```

---

## Scope Boundary — Timekeeping vs Payroll

This service tracks **where time went**, not **what it cost**.

**In scope:**
- Hours by employee, activity, funding source, date
- Allocation percentages
- Approved hour summaries

**Out of scope (belongs in ADP):**
- Pay rates
- Gross pay calculation
- Overtime
- Tax/deduction logic
- Benefit accrual
- Bonuses

---

## Future State

When this service outgrows Google Sheets:
- Replace `db/adapter/sheetsAdapter.ts` with a database adapter
- Replace `db/` files one at a time with SQL-backed equivalents
- Routes, services, and models stay unchanged
- Frontend eventually becomes a full hosted UI

---

## Models

All models live in `src/models/`. One file per model. All IDs use the `Guid` type alias.

### Shared Types

```typescript
// src/models/Guid.ts
type Guid = string;
```

### Controlled Vocabularies

```typescript
// src/models/EmployeeStatus.ts
const EmployeeStatus = {
  Active: "Active",
  Inactive: "Inactive",
} as const;
type EmployeeStatus = typeof EmployeeStatus[keyof typeof EmployeeStatus];

// src/models/PayPeriodStatus.ts
const PayPeriodStatus = {
  Draft: "Draft",
  Pending: "Pending",
  Open: "Open",
  Closed: "Closed",
} as const;
type PayPeriodStatus = typeof PayPeriodStatus[keyof typeof PayPeriodStatus];

// src/models/TimesheetTemplate.ts
const TimesheetTemplate = {
  TotalHours: "TotalHours",
  ClockInOut: "ClockInOut",
} as const;
type TimesheetTemplate = typeof TimesheetTemplate[keyof typeof TimesheetTemplate];

// src/models/PayPeriodInterval.ts
const PayPeriodInterval = {
  Weekly: "Weekly",
  BiWeekly: "Bi-weekly",
  Monthly: "Monthly",
} as const;
type PayPeriodInterval = typeof PayPeriodInterval[keyof typeof PayPeriodInterval];

// src/models/PayrollCategory.ts
const PayrollCategory = {
  Base: "Base",
  ETO: "ETO",
  PTO: "PTO",
  STO: "STO",
  Holiday: "Holiday",
} as const;
type PayrollCategory = typeof PayrollCategory[keyof typeof PayrollCategory];

// src/models/PayRate.ts
const PayRate = {
  Base: "Base",
  Secondary: "Secondary",
  Holiday: "Holiday",
  FlatRate: "FlatRate",
} as const;
type PayRate = typeof PayRate[keyof typeof PayRate];
```

### Domain Models

```typescript
// src/models/Client.ts
interface Client {
  clientId: Guid;
  clientName: string;
  clientCode: string;
  trackFundingSource: boolean;
  clientFolderLink: string;
  clientFolderId: string;
  employeePayrollFolderId: string;
  payrollConfigFolderId: string;
  reportsFolderId: string;
  payrollReportFolderId: string;
  allocationReportFolderId: string;
  timesheetsFolderId: string;
  payrollConfigFileId: string;
  payPeriodRegistryFileId: string;
}

// src/models/Employee.ts
interface Employee {
  employeeId: Guid;
  firstName: string;
  lastName: string;
  position: string;
  basePayRate: number;        // display only — never used in calculations
  secondaryPayRate: number;   // display only — never used in calculations
  holidayPayRate: number;     // display only — never used in calculations
  email: string;
  status: EmployeeStatus;
  timesheetFileLink: string;
  timesheetFileId: string;
}

// src/models/Supervisor.ts
interface Supervisor {
  supervisorId: Guid;
  supervisorFirstName: string;
  supervisorLastName: string;
  supervisorEmail: string;
}

// src/models/FundingSource.ts
interface FundingSource {
  fundingSourceId: Guid;
  fundingSourceName: string;
  fundingSourceCode?: string;   // optional — reserved for QuickBooks mapping
}

// src/models/Activity.ts
interface ActivityFundingSource {
  fundingSourceName: string;
  percentage: number;
}

interface Activity {
  activityId: Guid;
  activityName: string;
  trackSeparately: boolean;
  payrollCategory: PayrollCategory;
  fundingSources: ActivityFundingSource[];  // max 3, limit accepted for now
  payRate: PayRate;
  flatRateAmount?: number;
}

// src/models/Holiday.ts
interface Holiday {
  holidayId: Guid;
  holidayName: string;
  holidayDate: string;
}

// src/models/PayPeriod.ts
interface PayPeriod {
  payPeriodId: Guid;
  payPeriodName: string;
  status: PayPeriodStatus;
  startDate: string;
  endDate: string;
  createdDate: string;
}

// src/models/Settings.ts
interface Settings {
  timesheetTemplate: TimesheetTemplate;
  payPeriodInterval: PayPeriodInterval;
  payPeriodStartDate: string;
}

// src/models/TimeEntry.ts
interface TimeEntry {
  timeEntryId: Guid;
  employeeId: Guid;
  payPeriodId: Guid;
  activityId: Guid;
  date: string;
  hours?: number;
  clockIn?: string;
  clockOut?: string;
}

// A TimeEntry must have either hours OR both clockIn and clockOut — never neither.
// For TotalHours timesheets: hours is set.
// For ClockInOut timesheets: clockIn and clockOut are set, hours is also calculated and stored.
// Clock in/out values will need to be persisted to the database in a future phase.
```

### Manifest Models

```typescript
// src/models/TimesheetManifest.ts

interface DateColumnManifest {
  date: string;
  column: number;
}

interface ActivityRowManifest {
  activityId: Guid;
  activityName: string;
  row: number;
}

interface WeekManifest {
  weekIndex: number;
  dateRow: number;
  dates: DateColumnManifest[];
  activityRows: ActivityRowManifest[];
}

interface TimesheetManifest {
  payPeriodId: Guid;
  employeeId: Guid;
  generatedAt: string;
  tabName: string;
  weeks: WeekManifest[];
}
```

---

## db/ Layer

One file per operation. All functions call the adapter — never Google directly. Designed to be replaced one file at a time when migrating to a real database.

### PayrollConfig Model

Used by `getPayrollConfig` to return everything needed for timesheet generation in one batch call.

```typescript
// src/models/PayrollConfig.ts
interface PayrollConfig {
  employees: Employee[];
  supervisors: Supervisor[];
  activities: Activity[];
  fundingSources: FundingSource[];
  holidays: Holiday[];
  settings: Settings;
}
```

### Functions

**Batch:**
```typescript
// src/db/getPayrollConfig.ts
const getPayrollConfig = async (payrollConfigFileId: string): Promise<PayrollConfig>
```
Reads all tabs from the Payroll-Config workbook in one batch call. Used as the primary data load for timesheet generation.

**client/**
```typescript
// src/db/client/getClients.ts
const getClients = async (clientConfigFileId: string): Promise<Client[]>
```

**employee/**
```typescript
// src/db/employee/getEmployees.ts
const getEmployees = async (payrollConfigFileId: string): Promise<Employee[]>

// src/db/employee/getEmployeeById.ts
const getEmployeeById = async (payrollConfigFileId: string, employeeId: Guid): Promise<Employee | null>
```

**supervisor/**
```typescript
// src/db/supervisor/getSupervisors.ts
const getSupervisors = async (payrollConfigFileId: string): Promise<Supervisor[]>
```

**activity/**
```typescript
// src/db/activity/getActivities.ts
const getActivities = async (payrollConfigFileId: string): Promise<Activity[]>
```
Responsible for collapsing FundingSource1/2/3 flat columns into the `fundingSources` array on the `Activity` model.

**fundingSource/**
```typescript
// src/db/fundingSource/getFundingSources.ts
const getFundingSources = async (payrollConfigFileId: string): Promise<FundingSource[]>
```

**holiday/**
```typescript
// src/db/holiday/getHolidays.ts
const getHolidays = async (payrollConfigFileId: string): Promise<Holiday[]>
```

**settings/**
```typescript
// src/db/settings/getSettings.ts
const getSettings = async (payrollConfigFileId: string): Promise<Settings>
```

**payPeriod/**
```typescript
// src/db/payPeriod/getPayPeriods.ts
const getPayPeriods = async (payPeriodRegistryFileId: string): Promise<PayPeriod[]>

// src/db/payPeriod/savePayPeriod.ts
const savePayPeriod = async (payPeriodRegistryFileId: string, payPeriod: PayPeriod): Promise<void>
```

**manifest/**
```typescript
// src/db/manifest/getManifest.ts
const getManifest = async (timesheetFileId: string, tabName: string): Promise<TimesheetManifest | null>

// src/db/manifest/saveManifest.ts
const saveManifest = async (timesheetFileId: string, manifest: TimesheetManifest): Promise<void>

// src/db/manifest/deleteManifest.ts
const deleteManifest = async (timesheetFileId: string, tabName: string): Promise<void>
```

---

## Services

Services contain all business logic. They call `db/` functions and return results. They know nothing about HTTP. No classes — plain functions organized by folder.

### TimesheetStatus Controlled Vocabulary

```typescript
// src/models/TimesheetStatus.ts
const TimesheetStatus = {
  NotGenerated: "NotGenerated",
  Generated: "Generated",
  Submitted: "Submitted",
  Approved: "Approved",
} as const;
type TimesheetStatus = typeof TimesheetStatus[keyof typeof TimesheetStatus];
```

### services/timesheet/

```typescript
// src/services/timesheet/generateTimesheets.ts
const generateTimesheets = async (clientId: Guid, payPeriodId: Guid): Promise<void>
// Loads full PayrollConfig in one batch call, generates timesheets for all active
// employees, writes each timesheet in one batch write, saves manifest.
// Skips employees that already have a timesheet for this pay period.

// src/services/timesheet/checkTimesheetStatus.ts
const checkTimesheetStatus = async (timesheetFileId: string, tabName: string): Promise<TimesheetStatus>
// Checks whether a timesheet tab exists and whether it has been approved.
```

> `deleteTimesheet` is intentionally omitted — same reasoning as `deleteWorkbook`. Once an employee has worked in a timesheet it must be protected.

> `readTimesheet` is deferred to the time entry phase.

### services/payPeriod/

```typescript
// src/services/payPeriod/getNextPayPeriod.ts
const getNextPayPeriod = async (payrollConfigFileId: string, payPeriodRegistryFileId: string): Promise<PayPeriod>
// Calculates the next pay period dates and name from settings + existing periods.
// Returns a suggested PayPeriod with no ID — nothing is saved.
// Flow: getNextPayPeriod → UI confirms → createPayPeriod assigns ID and saves.

// src/services/payPeriod/createPayPeriod.ts
const createPayPeriod = async (payPeriodRegistryFileId: string, payPeriod: PayPeriod): Promise<void>
// Assigns a new ID and saves to the Pay-Period-Registry.

// src/services/payPeriod/updatePayPeriod.ts
const updatePayPeriod = async (payPeriodRegistryFileId: string, payPeriod: PayPeriod): Promise<void>
// Updates an existing pay period — including status transitions (Draft → Pending → Open → Closed).
```

### services/client/

```typescript
// src/services/client/getClients.ts
const getClients = async (clientConfigFileId: string): Promise<Client[]>
// Returns all clients for the dashboard list.
```

### services/timeEntry/ (deferred)

```typescript
// src/services/timeEntry/readTimeEntries.ts
const readTimeEntries = async (timesheetFileId: string, tabName: string): Promise<TimeEntry[]>
// Reads approved hours from a timesheet using the manifest.
// Returns normalized TimeEntry records.
// Deferred to the time entry / allocation phase.
```

---

## Routes

One file per endpoint. Routes parse the request, call a service, return a response. No business logic.

### DTOs

DTOs (Data Transfer Objects) are shaped for what the caller needs — a combination of data from multiple sources. They are not exact copies of storage models. Defined alongside the routes that use them.

```typescript
// src/models/PayPeriodDTO.ts
interface PayPeriodDTO {
  payPeriodId: Guid;
  payPeriodName: string;
  status: PayPeriodStatus;
  startDate: string;
  endDate: string;
  createdDate: string;
  clientId: Guid;
  clientName: string;
  payPeriodRegistryFileId: string;
}
```

### Endpoints

**timesheet/**
```
POST /api/v1/timesheet/generate
  Body: { clientId: Guid, payPeriodId: Guid }
  Generates timesheets for all active employees for the given pay period.

GET /api/v1/timesheet/status?payPeriodId=guid
  Returns approval status for all employees for the given pay period.
```

**payPeriod/**
```
GET /api/v1/payPeriod?clientId=guid
  Returns all pay periods for a client.

GET /api/v1/payPeriod/:payPeriodId
  Returns a single pay period by ID.

GET /api/v1/payPeriod/next?clientId=guid
  Returns the suggested next pay period — not saved, for UI confirmation.

POST /api/v1/payPeriod
  Creates a new pay period.

PUT /api/v1/payPeriod/:payPeriodId
  Updates an existing pay period including status transitions.
```

**client/**
```
GET /api/v1/client
  Returns all clients. Client creation and editing stays in Apps Script.
```

**health/**
```
GET /api/v1/health
```

---

## Database

PostgreSQL hosted on Railway. Starts small — just enough for auth, sessions, and audit logging. Foundation for future migration of config and timesheet data out of Google Sheets.

### Phase 1 Tables (now)

**user_sessions** — managed automatically by connect-pg-simple. No manual definition needed.

**users**
```sql
CREATE TABLE users (
  id        SERIAL PRIMARY KEY,
  googleId  VARCHAR(255) UNIQUE,
  email     VARCHAR(255) UNIQUE NOT NULL,
  name      VARCHAR(255),
  active    BOOLEAN NOT NULL DEFAULT true,
  createdAt TIMESTAMP NOT NULL DEFAULT NOW()
);
```
> `googleId` is nullable — user is added by email before first login. Populated on first successful login.
> `active = false` disables access without losing audit history.

**audit_log**
```sql
CREATE TABLE audit_log (
  id        SERIAL PRIMARY KEY,
  userId    INT REFERENCES users(id),
  action    VARCHAR(255) NOT NULL,
  payload   JSONB,
  createdAt TIMESTAMP NOT NULL DEFAULT NOW()
);
```
> `userId` is nullable — login rejection events may not have a user record to reference.
> `payload` is JSONB for flexibility — stores relevant context (clientId, payPeriodId, email, etc.).

### Phase 2 Tables (future)
When Google Sheets is replaced — clients, employees, activities, pay periods, time entries, etc. Each `db/` file gets rewritten one at a time to point at these tables instead of the Sheets adapter.

### Database Setup Project

Database setup and migrations live in a **separate project** — `blackwell-time-setup` — to avoid any confusion between application code and database management scripts. Never mixed into the application.

```
/Users/paulstevens/SaffinSystems/
  blackwell-time/          — the application
  blackwell-time-setup/    — database setup and migrations
```

Same pattern as `babeonym-setup`. Reference that project for structure.

#### Migration Files

Numbered SQL files, each drops and recreates a function or creates a table. Run in order via a `runSQL.ts` utility and a `setup.ts` entry point.

```
src/database/
  001_create_tables.v1.sql          — users, audit_log, user_sessions
  002_get_user_by_email.v1.sql
  003_get_user_by_google_id.v1.sql
  004_create_user.v1.sql
  005_update_user_google_id.v1.sql  — populate googleId on first login
  006_deactivate_user.v1.sql
  007_create_audit_log.v1.sql
```

### PostgreSQL db/ Structure

One file per SQL function call. Never multiple functions in one file. Organized by domain. The pool is the only shared utility.

```
src/db/
  postgres/
    dbController.ts           — shared pool instance, same pattern as Babeonym
    user/
      getUserByEmail.ts
      getUserByGoogleId.ts
      createUser.ts
      updateUserGoogleId.ts
      deactivateUser.ts
    auditLog/
      createAuditLog.ts
```

Each file follows this pattern:
```typescript
const getUserByEmail = async (email: string): Promise<User | null> => {
  const { rows } = await pool.query(
    'SELECT * FROM get_user_by_email($1)',
    [email]
  );
  return rows[0] ?? null;
};

export default getUserByEmail;
```

### Audit Log Service

```typescript
// src/utils/auditLog.ts
const logAction = async (userId: number, action: AuditAction, payload: Record<string, unknown>): Promise<void>
```

Called from services whenever something meaningful happens. Controlled vocabulary for actions:

```typescript
const AuditAction = {
  TimesheetGenerated: "TIMESHEET_GENERATED",
  PayPeriodCreated: "PAY_PERIOD_CREATED",
  PayPeriodUpdated: "PAY_PERIOD_UPDATED",
} as const;
type AuditAction = typeof AuditAction[keyof typeof AuditAction];
```

## Auth

Google OAuth via Passport.js. Blackwell staff sign in with their Google accounts. On successful login, validate the email domain matches the expected Blackwell domain. Sessions stored in PostgreSQL via connect-pg-simple.

Same pattern as Babeonym backend — reference that project for implementation.

### Approved Users

The `users` table is the approved users list. Access is explicitly granted by manually inserting a row with the user's email before they attempt to log in. There is no self-registration. `googleId` is null until first login.

To add a user: manually run an insert script with their email address.

### Auth Flow
```
User clicks "Sign in with Google"
  → Google OAuth callback
  → Look up user by email
  → If not found → log LOGIN_REJECTED → reject
  → If found but active = false → log LOGIN_REJECTED → reject
  → If found and active = true → populate googleId if null → log LOGIN_SUCCESS → create session → redirect to dashboard
```

### Middleware
```typescript
// src/middleware/ensureAuthenticated.ts
// Same pattern as Babeonym — checks req.user, returns 401 if not present
```

---

## Web UI — Dashboard

### Stack
- **React + Vite + TypeScript**
- **MUI (Material UI)** — components and theming, same as Babeonym
- **React Router** — client side routing
- **Context + useReducer** — state management, same pattern as Babeonym
- **OpenAPI generated client** — typed API client generated from backend Swagger spec

### Design Philosophy
Use MUI primitives — don't over-customize. But don't skimp on details. Loading spinners, skeleton loaders, status chips, subtle transitions, success/error toasts. These details give the app weight and build trust with Blackwell.

### App Shell

**App Bar (persistent across all pages)**
- Logo / app title
- Client selector dropdown — shows current client, hidden on Client List page
- Current user display
- Sign out button

### Routes

```
/login                                    — Sign in with Google
/                                         — Client List (landing page after login)
/client/:clientId/payPeriod               — Pay Period List
/client/:clientId/payPeriod/:payPeriodId  — Pay Period Detail
```

Unauthenticated users are redirected to `/login`. After login, redirected back to intended route.

### Pages

**Login**
- Sign in with Google button
- Clean, minimal

**Client List**
- List of clients
- Click to navigate to Pay Period List

**Pay Period List**
- Header showing selected client
- List of pay periods with color coded status chips
  - Draft = grey
  - Open = green
  - Closed = blue
- Create Pay Period button — pre-populates form with suggested next period, Blackwell confirms

**Pay Period Detail**
- Header showing client + pay period name
- Employee list with timesheet status chips per employee
  - Not Generated = red outline
  - Generated = grey
  - Submitted = yellow
  - Approved = green
- Per-employee actions:
  - View Timesheet — opens Google Sheet in new tab
- Pay period actions:
  - Generate Timesheets — available when Open, timesheets not yet generated
  - Close Pay Period — moves status to Closed
  - Regenerate Reports — phase 2, placeholder button

### State Management

One context — selected client. Pay period flows from URL params. Everything else is local component state or direct API calls. Much simpler than Babeonym.

### UX Details Worth Getting Right
- Timesheet generation shows progress indicator with status message — "Generating timesheets for [client]..."
- Color coded status chips on pay periods and timesheets for instant visual scanning
- Loading spinners / skeleton loaders while API calls are in flight
- Success/error toasts after actions
- Disabled buttons with tooltips explaining why they are disabled
- Smooth redirect after login

### Component Philosophy

Each component does one thing. Pages are thin — they compose components and manage top level state. If something looks like it might be reused later, make it a component now. When in doubt, split it. Files are cheap, untangling an overloaded component is not.

### Component Structure

This is a starting point. Components will be added as the build progresses.

```
src/
  pages/
    Login.tsx
    ClientList.tsx
    PayPeriodList.tsx
    PayPeriodDetail.tsx

  components/
    AppBar/
      AppBar.tsx
      ClientSelector/
        ClientSelector.tsx
      UserMenu/
        UserMenu.tsx
    Client/
      ClientCard.tsx
    PayPeriod/
      PayPeriodCard.tsx
      PayPeriodStatusChip.tsx
      CreatePayPeriodModal/
        CreatePayPeriodModal.tsx
        CreatePayPeriodForm.tsx
    Timesheet/
      EmployeeTimesheetRow.tsx
      TimesheetStatusChip.tsx
    Shared/
      LoadingSpinner.tsx
      PageHeader.tsx
      ToastNotification.tsx

  state/
    client/
      client.context.ts
      client.provider.tsx
      client.reducer.ts
      client.types.ts

  api/
    client.ts
    generated/       — OpenAPI generated client, do not edit manually

  styles/
    index.css
    fonts.css

  themes/            — MUI theme configuration, same pattern as Babeonym

  router.tsx
  App.tsx
  main.tsx

---

## Future Enhancements

### Automated Timesheet File Creation for New Employees

Currently, when a new employee is added, their Google Sheets timesheet file must be created manually. This is because the service account cannot create Drive files owned by a real Google user — files created by a service account count against the service account's storage quota, which is zero.

The fix is OAuth2 offline flow:

1. Create an OAuth2 Client ID in Google Cloud Console (type: Desktop App)
2. Run a one-time local authorization script that opens a browser and asks for consent
3. Store the resulting `refresh_token` in the environment
4. Use the refresh token in `copyWorkbook` to make Drive API calls on behalf of the real user

This would allow the system to copy the timesheet template into the client's timesheets folder, owned by the real user's account, without any manual intervention. All other API calls (Sheets reads/writes) can remain on the service account.
```
