# TODO

## Completed

- ~~Work through "closing pay period" tasks~~ — Pay period status model defined (Pending → Open → Processed → Closed), close endpoint built, status updates wired into generateTimesheets and generatePayrollReport
- ~~Sketch out UI and what will be needed for each page~~ — See docs/UI.md
- ~~Sketch out "add payroll data for allocation"~~ — See docs/BlackwellTime.md Allocation Report section

---

## Code Quality

~~### Introduce custom error types~~
~~Replace string-matched error handling in route handlers with typed custom errors (e.g. `NotFoundError`, `UnprocessableError`). Update middleware to map these to proper HTTP status codes. Currently all unhandled errors return 500 — this will make error handling consistent and remove the scattered `error.message.startsWith(...)` pattern across routes.~~

---

~~### Move HOURS_HEADERS and SUMMARY_HEADERS to constants~~
~~`generatePayrollReport.ts` defines `HOURS_HEADERS` and `SUMMARY_HEADERS` locally. Move them to `constants.ts` alongside the other tab headers for consistency, and to make them available when the hours/summary read functions are built.~~

---

~~### Remove payrollReportFileId from PayPeriod API response~~
~~`payrollReportFileId` is an internal system field — the UI has no use for it. Remove it from the `PayPeriod` swagger schema and strip it from the API response. It should remain in the internal model for service-layer use.~~ — done via `PayPeriodResponse` model + `buildPayPeriodResponse.ts`, wired into `getPayPeriods.ts`, `getPayPeriodById.ts`, `getNextPayPeriod.ts`.

---

~~### Review Client/PayPeriod resolution pattern~~
~~Every service resolves `clientId → client → payPeriodRegistryFileId → payPeriod → payrollReportFileId` from scratch on every request. We have caching to reduce Sheets API calls, but the pattern is still repetitive and fragile. Investigate a better solution — e.g. a lightweight mapping table or a resolution helper that centralizes this chain. Goal: services should not need to pass clientId and payPeriodId through multiple layers just to get to a file ID.~~ — decision: there's no real fix for needing both `clientId` and `payPeriodId` short of a DB migration (pay periods live in a per-client Sheet file, so there's no way to resolve a bare `payPeriodId` without first knowing which client's registry to look in — a reverse-index cache was considered and rejected, since the first lookup for any given `payPeriodId` would still need `clientId`, making the API inconsistent). What *was* fixable: the two-hop lookup was duplicated inline across 10 files. Centralized into `services/payPeriod/getClientAndPayPeriod.ts` (does the real resolution, returns both `client` and `payPeriod` — for the 3 callers that need client fields afterward: `generateAllocationReport.ts`, `generatePayrollReport.ts`, `generateTimesheets.ts`) with the existing `getPayPeriodById.ts` now a one-line wrapper around it (for the 6 callers that only need `payPeriod`: `getPayrollReport.ts`, `updateAdditionalExpenses.ts`, `getEmployeeExpenses.ts`, `getAllocationReport.ts`, `updateEmployeeExpenses.ts`, `getAdditionalExpenses.ts`). Verified via typecheck, full unit suite, and a live integration run of the most-affected test files.

---

## Code Cleanup

~~### Update all `import Guid from './Guid.js'` to use absolute imports~~
~~Several model files use relative imports for Guid. Update all occurrences to `import Guid from '#models/Guid.js'` to match the codebase standard.~~

---

~~### Split inline row mappers into their own files~~
~~`readClients.ts` (`mapToClient`) and `readPayPeriods.ts` (`mapToPayPeriod`) define their row-mapping function inline, unlike the payrollConfig domain where each mapper gets its own file (`mapEmployee.ts`, `mapActivity.ts`, `mapFundingSource.ts`, etc.). Extract these two for consistency with that convention.~~ — done as `mapClient.ts` and `mapPayPeriod.ts`.

---

~~### Revisit map*/build* naming convention~~
~~Two naming patterns exist side by side: `map<Entity>` (raw sheet row → typed domain model, e.g. `mapEmployee`, `mapClient`, `mapPayPeriod`) and `build<Thing>` (typed data → some other output shape, e.g. `buildAllocationRows`, `buildPayrollReportResponse`, `buildPayPeriodResponse`). The split is internally consistent but was arrived at informally, not designed up front — worth a deliberate pass to confirm it holds up, especially since `build*` currently covers both trivial reshaping (`buildPayPeriodResponse`, just drops one field) and real aggregation/computation (`buildAllocationRows`). Consider whether the trivial cases should be their own convention (e.g. `to*`) instead of overloading `build*`.~~ — decision: keep `map*`/`build*` as-is, don't switch to `to*`/`from*` and don't split `build*` further. Switching verbs (`build*` → `to*`) wouldn't fix the actual concern — the overloading between trivial and complex cases would persist under any single verb. Splitting `build*` by trivial-vs-complex was also rejected — the actual spread (`buildHoursRows` is a simple 1:1 map, `buildSummaryRows` aggregates, `buildWeek` is complex generation, `buildArchiveTimestamp` takes no input at all) is a spectrum, not two clean buckets, so it'd just add a fuzzy judgment call for every future function. The rule that actually holds up: `map*` = raw external data → typed domain model (first time it becomes a real type), `build*` = typed data → a different/computed output shape (regardless of computation complexity), `sort*` = reorder a list without changing its shape (added this session for `sortPayrollReportTabs`/`sortTimesheetTabs` — its clean fit is itself evidence the existing split's edges are clear enough to notice when something new doesn't belong in either bucket).

---

### Alphabetize Swagger route groups and endpoints

The generated OpenAPI spec's tag/group order (and endpoint order within each group) currently just follows registration order — `app.use(...)` order in `app.ts` for groups, `router.use(...)` order in each resource's `index.ts` for endpoints within a group — not any deliberate ordering. Noted as "pretty chaotic" while browsing `/api/docs` during the PayrollConfig CRUD work. Worth a pass to reorder both alphabetically: route group registration in `app.ts` (currently health, client, payPeriod, timesheet, admin, payrollReport, holiday, supervisor — not alphabetical), and the `router.use(...)` calls within each group's `index.ts`. Purely cosmetic/organizational, no functional change — low priority, revisit once all PayrollConfig CRUD entities exist so it's a single pass instead of repeated churn.

---

## Data Model / Config

~~### Update employee data model to include all fields, including pay rates~~
~~Audit the employee model against all fields stored in the payroll config spreadsheet. Ensure pay rates (HourlyPayRate1, HourlyPayRate2, FlatPayRate1, FlatPayRate2) are properly typed and accessible for use in the allocation calculation.~~

~~### Remove allocationReportFolderId from logic and references~~
~~The allocation report now lives in the payroll report workbook — there is no separate allocation report folder. Remove `allocationReportFolderId` from the client model, config reads, docs, and any references in routes or services.~~ — already gone from `src/`; the only leftover was a stale `docs/openapi.json`, fixed by regenerating it (`npm run generate`).

---

### Route getEmployees.ts through the payrollConfigCache

Started building CRUD routes for PayrollConfig entities (Employees, Supervisors, Activities, FundingSources, Holidays, Settings), starting with Holidays. New entities' list reads go through `readPayrollConfig(...)` (already cached, one batched `readTabs`/`batchGet` call for all 6 tabs) rather than calling their individual `read<Entity>s.ts` directly — avoids a second, separately-invalidated cache per entity, and avoids extra Sheets API calls on a cold cache. `getEmployees.ts` (the one entity with an existing live route, `GET /client/:clientId/employees`) predates this and still calls `readEmployees.ts` directly, uncached. Fix it to match the new pattern when Employee CRUD routes get built.

---

### Wire Activity.flatRateAmount into buildAllocationRows.ts

Discovered 2026-07-13 while building Employee CRUD: `resolveDollarRate` in `buildAllocationRows.ts` used to read `employee.flatPayRate1`/`flatPayRate2` for `FlatPayRate1`/`FlatPayRate2` activities — but those Employee fields were confirmed dead (no live sheet column ever existed for them; that design was abandoned once it was realized the flat rate varies by *activity*, not by employee) and have been removed from the `Employee` model. `resolveDollarRate` now falls through to `0` for both flat-rate cases, which is a live calculation gap, not a regression — flat-rate activities were already always resolving to $0 before this cleanup, just silently via the dead employee fields instead of an explicit fallthrough. The real fix: use `Activity.flatRateAmount` (added earlier the same session, currently unused by any calculation) as the dollar amount for `FlatPayRate1`/`FlatPayRate2` activities instead. Needs its own review — this is payroll calculation logic, not CRUD scaffolding.

---

## Allocation Report — Spreadsheet Tabs

~~### Create EmployeeExpenses tab service~~ — done as `writeEmployeeExpensesTab.ts` (field ended up named `activeThisPayPeriod` instead of `include`)

~~### Create AdditionalExpenses tab service~~ — done as `writeAdditionalExpensesTab.ts`

~~### Create AllocationReport tab service~~ — done as `writeAllocationReportTab.ts` (columns ended up as `wagesAllocation`/`additionalExpenses`/`total` instead of a single `totalExpense`)

~~### Create tab-order maintenance service~~
~~Shared low-level piece~~: `reorderTabs.ts` (`src/db/adapter/`) takes a workbook ID + an ordered list of tab names and reorders them in one batched Sheets API call (fetch tab metadata → map name→sheetId → one `batchUpdate` with `updateSheetProperties.index` per tab). Built as a generic adapter since the mechanics don't care what kind of workbook it is. Paired with a new `listTabNames.ts` adapter (returns every current tab title — nothing existed for this before, only single-tab lookups).

Two domain-specific policy functions compute the order and call `reorderTabs` — both pure functions, unit-tested, no live API needed:

~~**Payroll report workbook**~~ — done as `sortPayrollReportTabs.ts` (`src/services/payrollReport/`). Active tabs left (`current_hours`, `current_payroll_summary`, `EmployeeExpenses`, `AdditionalExpenses`, `AllocationReport`, filtered to whichever exist), archive tabs right sorted by timestamp descending — most recently archived closest to the active tabs — with `hrs_`/`payroll_` same-run pairs kept adjacent (`hrs_` first). Wired into `writeAllocationReportTab.ts`, `writeEmployeeExpensesTab.ts`, `writeAdditionalExpensesTab.ts`, and `generatePayrollReport.ts` (once, after its archive/rename dance settles into a final tab state).

~~**Timesheet workbook**~~ — done as `sortTimesheetTabs.ts` (`src/services/timesheet/`). Pay period tabs newest-first by the real `PayPeriod.startDate`, `_manifest` pinned last. Wired into `generateTimesheets.ts`, once per employee after their new pay-period tab and manifest entry are written.

Both use the naming convention correction from the map*/build* discussion below: named `sort*` (matching the existing `sortActivities.ts` precedent — take a list, apply ordering rules, return it organized), not `build*` (which is reserved for reshaping into a genuinely different output type, not just reordering the same list).

---

~~## Allocation Report — Services~~

~~### Create Update Employee Expenses service~~ — done as `updateEmployeeExpenses.ts`, including the server-side active/hours business rule

~~### Create Update AdditionalExpenses service~~ — done as `updateAdditionalExpenses.ts`

~~### Create Generate Allocation Report service~~ — done as `generateAllocationReport.ts` / `buildAllocationRows.ts`

---

~~## Allocation Report — Endpoints~~

~~All 6 endpoints done~~ — GET/PUT employeeExpenses, GET/PUT additionalExpenses, GET/POST allocationReport, all live under `/payrollReport/:clientId/:payPeriodId/...` (routes ended up nested under client+pay period rather than the `/pay-periods/:payPeriodId/...` path originally sketched here).

---

## Testing

~~### Unit tests for allocation calculation~~
~~The allocation math is complex enough to warrant thorough unit tests. Cover: proportion calculation, expense distribution, ignored employees, employees with no hours in a funding source, org-level expense distribution, edge cases (single employee, single funding source, zero expenses).~~ — done, `buildAllocationRows.test.ts` (24 tests) already covers all of this: proportion calculation, expense distribution, ignored/inactive employees, zero-hours edge cases, rounding/remainder handling, and sort order. Item was just never struck through.

---

~~### Assess cache-invalidation test coverage~~
~~Decision made: keep the two existing flaky integration tests (`allocationReport.test.ts`, `generatePayrollReport.test.ts`) as-is rather than lightening them — they verify something a mock can't (real Sheets write → real read sees fresh data, no eventual-consistency gap), which is a different and stronger claim than wiring correctness. Their occasional quota-flakiness is more acceptable now that wiring has separate, always-run coverage (below).~~

~~Still fully untested: `payPeriodsCache` invalidation (`writePayPeriod.ts`) and `payrollConfigCache` invalidation (`updateEmployeeTimesheetFile.ts`)~~ — closed. Every invalidation site turned out to be the same trivial shape (one `<cache>.delete(key)` call right after a successful write), so wiring got unit-tested by mocking the underlying Sheets adapter calls (`vi.mock()`), with zero quota cost: `tests/unit/db/writeAdditionalExpensesTab.test.ts`, `writeEmployeeExpensesTab.test.ts`, `writeAllocationReportTab.test.ts`, `writePayPeriod.test.ts`, `updateEmployeeTimesheetFile.test.ts`. Also surfaced a gap not previously documented here: `employeeExpensesCache`/the whole `employeeExpenses` endpoint pair had **zero** test coverage of any kind (not even integration) — now has unit wiring coverage at least.

~~`currentHoursCache` (invalidated inside `generatePayrollReport.ts`) was deliberately **not** given an equivalent unit test~~ — user confirmed passing on it: that function has ~10 dependencies (`readClientById`, `readPayPeriodById`, `readPayrollConfig`, `readTimesheetDetail`, `readTimesheetEntries`, `createOAuthWorkbook`, `writePayPeriod`, `writePayrollReportTab`, `archivePayrollReportTab`, `renameTab`) that would all need mocking to reach one assertion — disproportionate effort for the existing integration test's marginal value.

~~`clientsCache` has no invalidation coverage~~ — confirmed there's nothing to test: no code anywhere writes to the `Clients` tab (`src/db/client/` has only reads, no `POST`/`PUT`/`PATCH`/`DELETE` route exists under `/client`). Client create/edit is unbuilt "phase two" work — when it gets built, its tests (including `clientsCache` invalidation) come with it as part of that feature, not before.

Deferred, not built now: real integration-level round-trip tests (POST/PUT → GET reflects fresh data through the live API, same style as `additionalExpenses.test.ts`) for `employeeExpensesCache`, `payPeriodsCache`, and `payrollConfigCache` — these three now have unit-level wiring coverage but, unlike `additionalExpensesCache`/`allocationReportCache`/`currentHoursCache`, no true end-to-end verification against real Sheets. Pick this up later.

---

~~### Split test suite into unit vs. integration~~
~~Right now everything runs together under one `vitest` invocation, sequential (`fileParallelism: false`) because of the shared 60 req/min Google Sheets quota. But the suite actually mixes two very different kinds of tests: pure-logic tests with no external dependency (`buildAllocationRows`, `dateUtils`, `buildWeek`, `sortActivities`, `rowBuilders`) and real integration tests that hit the live Google Sheets API end-to-end (client/payPeriod/payrollReport/timesheet tests). Split into:~~
~~- **Unit suite** — no external calls, safe to run on every save/commit, can be fully parallel.~~
~~- **Integration suite** — hits real Sheets API, needs credentials/test-client setup, run on demand only.~~
~~Likely needs a second vitest config (or projects setup) and separate npm scripts (e.g. `test:unit` / `test:integration`).~~ — done via Vitest 4 `test.projects` in `vitest.config.ts` (`unit` project: parallel, no setup file; `integration` project: sequential, `tests/integration/setup.ts` for env). Files physically moved to `tests/unit/` (6 files, 81 tests, includes `health.test.ts` — reclassified since it has no live API dependency despite using `supertest`) and `tests/integration/` (11 files, 44 tests, plus the shared `helpers/` fixtures and `setup.ts`). `npm test` now runs unit-only by default; `npm run test:integration` is separate and on-demand. Note: this only stops integration flakiness from blocking the default/build run — it does not fix the underlying flakiness itself (shared mutable `TEST_CLIENT_ID` fixture, no retry/backoff), which is still open, see "Assess cache-invalidation test coverage" above and the flagship end-to-end test below.

---

### Add a full-lifecycle integration test: create client → close pay period
Build one flagship integration test that exercises the entire pay period workflow end-to-end rather than the current per-endpoint piecemeal tests: create a brand-new test client, generate timesheets, fill in and sign them, generate the payroll report, save employee/additional expenses, generate the allocation report, and close the pay period. Should clean up (delete) whatever it creates. This belongs in the integration suite above, and would need its own setup/teardown since it can't reuse the existing shared `TEST_CLIENT_ID` fixture.

---

## Timesheet

~~### Add derived status to timesheet status endpoint~~
~~`GET /timesheet/status/:clientId/:payPeriodId` only returned raw `totalHours`/`employeeSigned`/`supervisorSigned` — UI needs a labeled status per employee.~~ — done via `deriveTimesheetStatus.ts`, wired into `getTimesheetStatuses.ts`. Uses the five-state `TimesheetStatus` enum (`NotGenerated`/`Generated`/`Submitted`/`Approved`/`Complete`); distinguishes `Approved` from `Complete` by checking whether the employee's hours appear in `current_hours` for the pay period.

---

## Client Summary

~~### Add client summary/config data endpoint~~
~~Client Summary page needs: current pay period, number of employees, timesheet template, pay period interval. The template (`Settings.timeInputMethod`) and interval (`Settings.payPeriodInterval`) already exist in `PayrollConfig`/`Settings` but nothing exposes them via a GET endpoint today — `readPayrollConfig` is only used internally by generation services. Need a new endpoint (e.g. `GET /client/:clientId/summary`) that surfaces this data. Open question: is "current pay period" derived from the existing `GET /payPeriod` list (most recent non-Closed), or does it need its own resolution logic?~~ — done via `getClientSummary.ts` / `GET /client/:clientId/summary`. Scope ended up broader than originally planned: returns the full active-employee list plus supervisors/activities/fundingSources/holidays/settings from `PayrollConfig`, not just the four original fields. `payPeriods` (all non-Closed pay periods, `PayPeriodResponse[]` shape via `buildPayPeriodResponse`) was added after the initial cut — there's no single "current" pay period since multiple non-Closed ones can coexist, so the array is returned as-is and the UI picks/displays from it; `GET /payPeriod/:clientId` still exists separately if the full (including Closed) list is ever needed.

---

## Open Questions (see DECISIONS.md)
- Confirm holiday pay is time-and-a-half modifier
- Confirm flat rate code names — probably unnecessary; likely additive (not a replace) if ever needed, revisit at payroll app integration
- Confirm whether payroll service has rates on file (affects whether pay rates can be pulled automatically or must be maintained manually in payroll config)
