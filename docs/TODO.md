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

### Review Client/PayPeriod resolution pattern
Every service resolves `clientId → client → payPeriodRegistryFileId → payPeriod → payrollReportFileId` from scratch on every request. We have caching to reduce Sheets API calls, but the pattern is still repetitive and fragile. Investigate a better solution — e.g. a lightweight mapping table or a resolution helper that centralizes this chain. Goal: services should not need to pass clientId and payPeriodId through multiple layers just to get to a file ID.

---

## Code Cleanup

~~### Update all `import Guid from './Guid.js'` to use absolute imports~~
~~Several model files use relative imports for Guid. Update all occurrences to `import Guid from '#models/Guid.js'` to match the codebase standard.~~

---

~~### Split inline row mappers into their own files~~
~~`readClients.ts` (`mapToClient`) and `readPayPeriods.ts` (`mapToPayPeriod`) define their row-mapping function inline, unlike the payrollConfig domain where each mapper gets its own file (`mapEmployee.ts`, `mapActivity.ts`, `mapFundingSource.ts`, etc.). Extract these two for consistency with that convention.~~ — done as `mapClient.ts` and `mapPayPeriod.ts`.

---

### Revisit map*/build* naming convention
Two naming patterns exist side by side: `map<Entity>` (raw sheet row → typed domain model, e.g. `mapEmployee`, `mapClient`, `mapPayPeriod`) and `build<Thing>` (typed data → some other output shape, e.g. `buildAllocationRows`, `buildPayrollReportResponse`, `buildPayPeriodResponse`). The split is internally consistent but was arrived at informally, not designed up front — worth a deliberate pass to confirm it holds up, especially since `build*` currently covers both trivial reshaping (`buildPayPeriodResponse`, just drops one field) and real aggregation/computation (`buildAllocationRows`). Consider whether the trivial cases should be their own convention (e.g. `to*`) instead of overloading `build*`.

---

## Data Model / Config

~~### Update employee data model to include all fields, including pay rates~~
~~Audit the employee model against all fields stored in the payroll config spreadsheet. Ensure pay rates (HourlyPayRate1, HourlyPayRate2, FlatPayRate1, FlatPayRate2) are properly typed and accessible for use in the allocation calculation.~~

~~### Remove allocationReportFolderId from logic and references~~
~~The allocation report now lives in the payroll report workbook — there is no separate allocation report folder. Remove `allocationReportFolderId` from the client model, config reads, docs, and any references in routes or services.~~ — already gone from `src/`; the only leftover was a stale `docs/openapi.json`, fixed by regenerating it (`npm run generate`).

---

## Allocation Report — Spreadsheet Tabs

~~### Create EmployeeExpenses tab service~~ — done as `writeEmployeeExpensesTab.ts` (field ended up named `activeThisPayPeriod` instead of `include`)

~~### Create AdditionalExpenses tab service~~ — done as `writeAdditionalExpensesTab.ts`

~~### Create AllocationReport tab service~~ — done as `writeAllocationReportTab.ts` (columns ended up as `wagesAllocation`/`additionalExpenses`/`total` instead of a single `totalExpense`)

### Create tab-order maintenance service
~~Shared low-level piece done~~: `reorderTabs.ts` (`src/db/adapter/`) takes a workbook ID + an ordered list of tab names and reorders them in one batched Sheets API call (fetch tab metadata → map name→sheetId → one `batchUpdate` with `updateSheetProperties.index` per tab). Built as a generic adapter since the mechanics don't care what kind of workbook it is — may have other uses beyond the two below.

Still to build — two domain-specific policy functions that compute the order and call `reorderTabs`, plus wiring:

**Payroll report workbook** — active tabs left, archives right: `current_hours`, `current_payroll_summary`, `EmployeeExpenses`, `AdditionalExpenses`, `AllocationReport`, filtered to whichever exist yet (`AllocationReport` doesn't until the bookkeeper gets that far). Archive tabs (`hrs_MMDD_HHmm`/`payroll_MMDD_HHmm` pairs) sorted by their timestamp suffix, not plain alphabetical — a plain name sort would separate same-run pairs since `h` < `p`. Call sites: `writeAllocationReportTab.ts`, `writeEmployeeExpensesTab.ts`, `writeAdditionalExpensesTab.ts`, `writePayrollReportTab.ts`/`generatePayrollReport.ts` — wherever a new tab is created or an old one gets archived. Do **not** hook into the shared `createTab`/`createTabIfNotExists` adapter — it's also used for timesheet tabs, which have no such rule.

**Timesheet workbook** — newest pay period left, `_manifest` pinned to the far right (internal bookkeeping, never shown). Sort by the real `PayPeriod.startDate` (descending), not by parsing `payPeriodName` — we already have the actual date, no need to parse the display string. Call site: `generateTimesheets.ts`, after each new pay-period tab is created.

Deferred until after the test suite refactor (see `## Testing`) — needs its own test coverage and shouldn't add load to the currently flaky, quota-constrained suite in the meantime.

---

~~## Allocation Report — Services~~

~~### Create Update Employee Expenses service~~ — done as `updateEmployeeExpenses.ts`, including the server-side active/hours business rule

~~### Create Update AdditionalExpenses service~~ — done as `updateAdditionalExpenses.ts`

~~### Create Generate Allocation Report service~~ — done as `generateAllocationReport.ts` / `buildAllocationRows.ts`

---

~~## Allocation Report — Endpoints~~

~~All 6 endpoints done~~ — GET/PUT employee-expenses, GET/PUT additional-expenses, GET/POST allocation-report, all live under `/payrollReport/:clientId/:payPeriodId/...` (routes ended up nested under client+pay period rather than the `/pay-periods/:payPeriodId/...` path originally sketched here).

---

## Testing

### Unit tests for allocation calculation
The allocation math is complex enough to warrant thorough unit tests. Cover: proportion calculation, expense distribution, ignored employees, employees with no hours in a funding source, org-level expense distribution, edge cases (single employee, single funding source, zero expenses).

---

### Assess cache-invalidation test coverage
The 7-cache refactor (`src/utils/caches/*`) added `invalidate`-on-write coverage in `additionalExpenses.test.ts` (already existed, exercises write→read correctly). Two new tests were added to check the same thing for `allocationReportCache` and `currentHoursCache` (`allocationReport.test.ts`, `generatePayrollReport.test.ts`), but each adds a full generate-then-verify Sheets API cycle to an already quota-constrained suite (60 req/min, `fileParallelism: false`). Two consecutive local runs each produced different, non-overlapping failures (generic 500s, one raw destructure crash in `getTestPayPeriod()`) — looks like pre-existing quota flakiness made more likely by the added load, not a bug in the invalidation logic itself. Come back and decide: keep the two new tests as-is and accept the flakiness, lighten them (drop the chained second call), or move this kind of check into the unit-test suite instead (see below) so it doesn't compete for Sheets API quota at all.
Still fully untested: `payPeriodsCache` invalidation (`writePayPeriod.ts`) and `payrollConfigCache` invalidation (`updateEmployeeTimesheetFile.ts`) — no test calls either function today. Pre-existing gap, not introduced by the refactor.

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
~~Client Summary page needs: current pay period, number of employees, timesheet template, pay period interval. The template (`Settings.timeInputMethod`) and interval (`Settings.payPeriodInterval`) already exist in `PayrollConfig`/`Settings` but nothing exposes them via a GET endpoint today — `readPayrollConfig` is only used internally by generation services. Need a new endpoint (e.g. `GET /client/:clientId/summary`) that surfaces this data. Open question: is "current pay period" derived from the existing `GET /payPeriod` list (most recent non-Closed), or does it need its own resolution logic?~~ — done via `getClientSummary.ts` / `GET /client/:clientId/summary`. Scope ended up broader than originally planned: returns the full active-employee list plus supervisors/activities/fundingSources/holidays/settings from `PayrollConfig`, not just the four original fields. Pay period data was deliberately left out — multiple non-Closed pay periods can coexist, so there's no single "current" one to resolve; the UI can call `GET /payPeriod/:clientId` if it needs that.

---

## Open Questions (see DECISIONS.md)
- Confirm holiday pay is time-and-a-half modifier
- Confirm flat rate code names — probably unnecessary; likely additive (not a replace) if ever needed, revisit at payroll app integration
- Confirm whether payroll service has rates on file (affects whether pay rates can be pulled automatically or must be maintained manually in payroll config)
