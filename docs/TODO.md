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

### Remove payrollReportFileId from PayPeriod API response
`payrollReportFileId` is an internal system field — the UI has no use for it. Remove it from the `PayPeriod` swagger schema and strip it from the API response. It should remain in the internal model for service-layer use.

---

### Review Client/PayPeriod resolution pattern
Every service resolves `clientId → client → payPeriodRegistryFileId → payPeriod → payrollReportFileId` from scratch on every request. We have caching to reduce Sheets API calls, but the pattern is still repetitive and fragile. Investigate a better solution — e.g. a lightweight mapping table or a resolution helper that centralizes this chain. Goal: services should not need to pass clientId and payPeriodId through multiple layers just to get to a file ID.

---

## Code Cleanup

~~### Update all `import Guid from './Guid.js'` to use absolute imports~~
~~Several model files use relative imports for Guid. Update all occurrences to `import Guid from '#models/Guid.js'` to match the codebase standard.~~

---

### Split inline row mappers into their own files
`readClients.ts` (`mapToClient`) and `readPayPeriods.ts` (`mapToPayPeriod`) define their row-mapping function inline, unlike the payrollConfig domain where each mapper gets its own file (`mapEmployee.ts`, `mapActivity.ts`, `mapFundingSource.ts`, etc.). Extract these two for consistency with that convention.

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
After any write to the payroll report workbook, reorder tabs so active tabs are on the left and archive tabs are on the right. Active tab order: `current_hours`, `current_payroll_summary`, `EmployeeExpenses`, `AdditionalExpenses`, `AllocationReport`. Archive tabs follow in chronological order. Confirmed not built — no reorder/tab-index logic exists anywhere in `src`.

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

### Split test suite into unit vs. integration
Right now everything runs together under one `vitest` invocation, sequential (`fileParallelism: false`) because of the shared 60 req/min Google Sheets quota. But the suite actually mixes two very different kinds of tests: pure-logic tests with no external dependency (`buildAllocationRows`, `dateUtils`, `buildWeek`, `sortActivities`, `rowBuilders`) and real integration tests that hit the live Google Sheets API end-to-end (client/payPeriod/payrollReport/timesheet tests). Split into:
- **Unit suite** — no external calls, safe to run on every save/commit, can be fully parallel.
- **Integration suite** — hits real Sheets API, needs credentials/test-client setup, run on demand only.
Likely needs a second vitest config (or projects setup) and separate npm scripts (e.g. `test:unit` / `test:integration`).

---

### Add a full-lifecycle integration test: create client → close pay period
Build one flagship integration test that exercises the entire pay period workflow end-to-end rather than the current per-endpoint piecemeal tests: create a brand-new test client, generate timesheets, fill in and sign them, generate the payroll report, save employee/additional expenses, generate the allocation report, and close the pay period. Should clean up (delete) whatever it creates. This belongs in the integration suite above, and would need its own setup/teardown since it can't reuse the existing shared `TEST_CLIENT_ID` fixture.

---

## Open Questions (see DECISIONS.md)
- Confirm holiday pay is time-and-a-half modifier
- Confirm flat rate code names
- Confirm whether payroll service has rates on file (affects whether pay rates can be pulled automatically or must be maintained manually in payroll config)
