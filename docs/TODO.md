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
~~Every service resolves `clientId → client → payPeriodRegistryFileId → payPeriod → payrollReportFileId` from scratch on every request. We have caching to reduce Sheets API calls, but the pattern is still repetitive and fragile. Investigate a better solution — e.g. a lightweight mapping table or a resolution helper that centralizes this chain. Goal: services should not need to pass clientId and payPeriodId through multiple layers just to get to a file ID.~~ — decision: there's no real fix for needing both `clientId` and `payPeriodId` short of a DB migration (pay periods live in a per-client Sheet file, so there's no way to resolve a bare `payPeriodId` without first knowing which client's registry to look in — a reverse-index cache was considered and rejected, since the first lookup for any given `payPeriodId` would still need `clientId`, making the API inconsistent). What _was_ fixable: the two-hop lookup was duplicated inline across 10 files. Centralized into `services/payPeriod/getClientAndPayPeriod.ts` (does the real resolution, returns both `client` and `payPeriod` — for the 3 callers that need client fields afterward: `generateAllocationReport.ts`, `generatePayrollReport.ts`, `generateTimesheets.ts`) with the existing `getPayPeriodById.ts` now a one-line wrapper around it (for the 6 callers that only need `payPeriod`: `getPayrollReport.ts`, `updateAdditionalExpenses.ts`, `getEmployeeExpenses.ts`, `getAllocationReport.ts`, `updateEmployeeExpenses.ts`, `getAdditionalExpenses.ts`). Verified via typecheck, full unit suite, and a live integration run of the most-affected test files.

---

## Code Cleanup

~~### Remove duplicate `/client/:clientId/employees` route~~

~~`GET /api/v1/employee/:clientId` is the route being covered by the Employee integration tests. The older `/client/:clientId/employees` route appears to duplicate the same responsibility and should be deleted once the Employee route coverage is stable.~~ — done: removed the duplicate Client route and kept the canonical `GET /api/v1/employee/:clientId` endpoint.

---

~~### Update all `import Guid from './Guid.js'` to use absolute imports~~
~~Several model files use relative imports for Guid. Update all occurrences to `import Guid from '#models/Guid.js'` to match the codebase standard.~~

---

~~### Split inline row mappers into their own files~~
~~`readClients.ts` (`mapToClient`) and `readPayPeriods.ts` (`mapToPayPeriod`) define their row-mapping function inline, unlike the payrollConfig domain where each mapper gets its own file (`mapEmployee.ts`, `mapActivity.ts`, `mapFundingSource.ts`, etc.). Extract these two for consistency with that convention.~~ — done as `mapClient.ts` and `mapPayPeriod.ts`.

---

~~### Revisit map*/build* naming convention~~
~~Two naming patterns exist side by side: `map<Entity>` (raw sheet row → typed domain model, e.g. `mapEmployee`, `mapClient`, `mapPayPeriod`) and `build<Thing>` (typed data → some other output shape, e.g. `buildAllocationRows`, `buildPayrollReportResponse`, `buildPayPeriodResponse`). The split is internally consistent but was arrived at informally, not designed up front — worth a deliberate pass to confirm it holds up, especially since `build*` currently covers both trivial reshaping (`buildPayPeriodResponse`, just drops one field) and real aggregation/computation (`buildAllocationRows`). Consider whether the trivial cases should be their own convention (e.g. `to*`) instead of overloading `build*`.~~ — decision: keep `map*`/`build*` as-is, don't switch to `to*`/`from*` and don't split `build*` further. Switching verbs (`build*` → `to*`) wouldn't fix the actual concern — the overloading between trivial and complex cases would persist under any single verb. Splitting `build*` by trivial-vs-complex was also rejected — the actual spread (`buildHoursRows` is a simple 1:1 map, `buildSummaryRows` aggregates, `buildWeek` is complex generation, `buildArchiveTimestamp` takes no input at all) is a spectrum, not two clean buckets, so it'd just add a fuzzy judgment call for every future function. The rule that actually holds up: `map*` = raw external data → typed domain model (first time it becomes a real type), `build*` = typed data → a different/computed output shape (regardless of computation complexity), `sort*` = reorder a list without changing its shape (added this session for `sortPayrollReportTabs`/`sortTimesheetTabs` — its clean fit is itself evidence the existing split's edges are clear enough to notice when something new doesn't belong in either bucket).

---

~~### Alphabetize Swagger route groups and endpoints~~

~~The generated OpenAPI spec's tag/group order (and endpoint order within each group) currently just follows registration order.~~ — done, but not the way originally sketched: registration order (`app.use`/`router.use`) turned out to have **zero effect** on the generated docs — `swaggerSpec.ts` discovers route files via `glob`, which returned filesystem-dependent order, not registration or alphabetical order (confirmed empirically). The real fix: a root-level `tags` array (alphabetical) added to `swaggerSpec.ts`'s `definition` — this is the actual OpenAPI-standard mechanism for group order, Swagger UI does not sort tags on its own. Endpoint order within each group needed a custom `operationsSorter` in `app.ts` (GET→POST→PUT→PATCH→DELETE, alphabetical-by-path tiebreak) — swagger-ui-dist's own built-in `'method'` sorter is just alphabetical-by-method-name (`delete, get, patch, post, put`), not a curated order, so it didn't fit. `docExpansion: 'none'` added alongside so groups default to collapsed. One gotcha worth remembering: `swaggerUi.setup()` serializes a function option by extracting only its own source text and re-evaluating it in the browser bundle — it must be fully self-contained, any reference to an outer-scope variable becomes a `ReferenceError` client-side.

---

~~### Remove or restrict `PUT /payPeriod/:clientId/:payPeriodId`~~

~~Pay periods are backend-owned workflow records: dates/name come from `GET /payPeriod/:clientId/next`, creation persists that suggested period, and status changes should happen through workflow actions (`generateTimesheets`, `generatePayrollReport`, `closePayPeriod`) rather than a generic update endpoint. Decide whether to delete this route entirely or restrict it before adding integration coverage for it.~~ — done: removed the public `PUT /payPeriod/:clientId/:payPeriodId` route. Kept the internal `updatePayPeriod` service because workflow services still use it after enforcing business rules.

---

### Rename Pay Period row persistence helpers

Low priority. The DB-layer helper names `appendPayPeriod` and `writePayPeriod` are awkward: both write to Sheets, but one inserts a new pay period row and the other updates an existing one. Rename them to something clearer, such as `createPayPeriodRow` / `updatePayPeriodRow` or `insertPayPeriod` / `updatePayPeriodRow`, once the current integration-test work settles.

---

## Data Model / Config

~~### Update employee data model to include all fields, including pay rates~~
~~Audit the employee model against all fields stored in the payroll config spreadsheet. Ensure pay rates (HourlyPayRate1, HourlyPayRate2, FlatPayRate1, FlatPayRate2) are properly typed and accessible for use in the allocation calculation.~~

~~### Remove allocationReportFolderId from logic and references~~
~~The allocation report now lives in the payroll report workbook — there is no separate allocation report folder. Remove `allocationReportFolderId` from the client model, config reads, docs, and any references in routes or services.~~ — already gone from `src/`; the only leftover was a stale `docs/openapi.json`, fixed by regenerating it (`npm run generate`).

---

~~### Route getEmployees.ts through the payrollConfigCache~~

~~`getEmployees.ts` predates the `readPayrollConfig(...)`-cached pattern used by the other PayrollConfig entities and still called `readEmployees.ts` directly, uncached.~~ — already done, turned out to have been fixed as part of building Employee CRUD itself; this item was just never struck through. `getEmployees.ts` now matches `getHolidays.ts`'s exact shape. The only remaining direct use of `readEmployees.ts` is inside `writeEmployees.ts`'s read-modify-write, which is correct and expected (same pattern as `writeHolidays.ts`). Noted in passing, not fixed: `readEmployeeById.ts` looks like dead code — nothing in `src/` calls it.

---

~~### Wire Activity.flatRateAmount into buildAllocationRows.ts~~

~~Discovered 2026-07-13 while building Employee CRUD: `resolveDollarRate` in `buildAllocationRows.ts` fell through to `0` for `FlatPayRate1`/`FlatPayRate2` activities — a live calculation gap, not a regression.~~ — fixed: `resolveDollarRate` now takes the full `Activity` (not just `payRate`) and returns `activity.flatRateAmount` for both flat-rate cases. Confirmed with the user that `row.Hours` for a flat-rate activity holds the _quantity_ of flat-rate units entered that day (e.g. "2 shifts"), not a duration — traced through `readTimesheetEntries.ts` (`flatRateRows` read identically to `activityRows`, same cell-reading logic) to verify this before changing anything, since it's real payroll math. So `rowCost = row.Hours * dollarRate` was already the right shape (quantity × per-unit amount), no restructuring needed beyond the rate resolution itself. Covered by two new cases in `buildAllocationRows.test.ts` (`FlatPayRate1` mixed with an hourly activity, and `FlatPayRate2` alone), replacing the old test that had locked in the `$0` behavior.

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

### Replace dev test-data endpoint/sower plan with backend fixture commands

Decision: do not build a separate `blackwell-sower` repo for now, and do not expose test-data reset actions as HTTP endpoints. No other application needs to trigger these actions. They should be backend-owned dev/QA commands because the backend already owns Google Drive/Sheets auth and the client registry shape.

Target commands:

- `npm run dev:test-data:reset`

Backend-owned env vars:

- `TEST_DATA_ROOT_FOLDER_ID` — disposable live UI test data parent
- `CLIENT_CONFIG_FILE_ID` — existing Clients registry

Guardrails:

- Commands only run in `development` or `qa`.
- No Swagger/OpenAPI route, no mounted dev endpoint, no `DEV_TOOL_KEY`.
- Never call these from app startup.
- Only trash/create known folders such as `UI_TEST_DATA`.
- Only remove/write Clients rows with the `UI_TEST_` client-code prefix.
- Print explicit summaries of trashed folders, created scenarios, and written Clients rows.

Suggested structure:

```text
src/devTestData/
  constants.ts
  purgeDevTestData.ts
  resetDevTestData.ts
  scenarios/
    buildFreshClientRequest.ts
    createFreshClientScenario.ts
  scripts/
    reset.ts
```

Milestone 1 scope: Fresh Client only.

- Scenario: `Fresh Client`
- Live client name/code: `UI Test Fresh Client` / `UI_TEST_FC`
- Create client with settings.
- No employees, supervisors, funding sources, activities, holidays, pay periods, or payroll state.

Implementation chunks:

1. Remove the dev test-data purge HTTP route, route mounting, Swagger/OpenAPI exposure if any, and route-specific tests. Keep reusable purge logic as internal dev tooling.
2. Add command guard helpers for `development`/`qa` only and required backend env validation.
3. Refactor `purgeDevTestData` into a command-safe service that trashes live `UI_TEST_DATA` under `TEST_DATA_ROOT_FOLDER_ID`, removes `UI_TEST_` Clients rows, and clears relevant caches.
4. Add `resetDevTestData` for Fresh Client. It should purge live data, create a fresh `UI_TEST_DATA` folder under `TEST_DATA_ROOT_FOLDER_ID`, then run `createFreshClientScenario` directly against that folder.
5. Add the reset command script and npm script.
6. Add focused unit tests around guards, env validation, and Clients row filtering/writing. Add live integration coverage only after the Fresh Client reset works manually.
7. Do not add Configured Client, Early Client, or Late Client until Fresh Client reset works end to end.

---

### Add integration test data namespace cleanup

Integration tests currently create real Drive/Sheets artifacts across the shared test area without a single owning namespace. Add an integration-test data root folder such as `INTEGRATION_TEST_DATA` and a consistent client-code prefix such as `IT_`, then update builders to create all integration artifacts under that root. Cleanup can then trash one folder tree and remove matching `IT_` clients from the Clients sheet, similar to the UI test data reset flow.

---

~~### Validate Activity funding source references~~

~~`createActivity` and `updateActivity` currently accept funding source names without verifying that those names exist in the client's Funding Sources tab. Add validation so activities can only reference real funding sources.~~ — done via `validateActivityFundingSources.ts`, wired into create/update Activity, with unit coverage and integration 422 cases.

~~### Validate Holiday dates~~

~~`createHoliday` and `updateHoliday` currently accept `holidayDate` without validating the format or calendar value. Add validation, likely strict `YYYY-MM-DD`, then add 422 tests for malformed dates.~~ — done via reusable `validateIsoDateString.ts`, wired into create/update Holiday with unit coverage and integration 422 cases.

~~### Validate duplicate client codes~~

~~`createClient` does not directly check whether `clientCode` already exists in the `Clients` sheet. Duplicate client codes can be created when they use different folders and avoid Payroll Config / Pay Period Registry file-name collisions. Add explicit client-code uniqueness validation before provisioning client infrastructure.~~ — done via `validateClientCodeIsUnique.ts`, checked before folder/workbook provisioning starts, with unit coverage and the existing integration scenario converted from `it.fails`.

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

### Review generated timesheet styling

Low priority. Generated timesheets are being created, but the visual styling needs review: the tab exists and the data is present, but the coloring is off compared with the intended workbook format.

---

~~### Add derived status to timesheet status endpoint~~
~~`GET /timesheet/status/:clientId/:payPeriodId` only returned raw `totalHours`/`employeeSigned`/`supervisorSigned` — UI needs a labeled status per employee.~~ — done via `deriveTimesheetStatus.ts`, wired into `getTimesheetStatuses.ts`. Uses the five-state `TimesheetStatus` enum (`NotGenerated`/`Generated`/`Submitted`/`Approved`/`Complete`); distinguishes `Approved` from `Complete` by checking whether the employee's hours appear in `current_hours` for the pay period.

---

## Client Summary

~~### Add client summary/config data endpoint~~
~~Client Summary page needs: current pay period, number of employees, timesheet template, pay period interval. The template (`Settings.timeInputMethod`) and interval (`Settings.payPeriodInterval`) already exist in `PayrollConfig`/`Settings` but nothing exposes them via a GET endpoint today — `readPayrollConfig` is only used internally by generation services. Need a new endpoint (e.g. `GET /client/:clientId/summary`) that surfaces this data. Open question: is "current pay period" derived from the existing `GET /payPeriod` list (most recent non-Closed), or does it need its own resolution logic?~~ — done via `getClientSummary.ts` / `GET /client/:clientId/summary`. Scope ended up broader than originally planned: returns the full active-employee list plus supervisors/activities/fundingSources/holidays/settings from `PayrollConfig`, not just the four original fields. `payPeriods` (all non-Closed pay periods, `PayPeriodResponse[]` shape via `buildPayPeriodResponse`) was added after the initial cut — there's no single "current" pay period since multiple non-Closed ones can coexist, so the array is returned as-is and the UI picks/displays from it; `GET /payPeriod/:clientId` still exists separately if the full (including Closed) list is ever needed.

---

~~## Client CRUD (Create/Update)~~

~~Design session 2026-07-13. Client creation provisions real Drive/Sheets infrastructure (folders, PayrollConfig workbook, PayPeriodRegistry workbook), not just a sheet row — see design discussion for the full reasoning on the existing-link/create-new toggle, the never-delete/no-rollback safety philosophy, and why `EmployeePayrollFolderId` became the sole folder anchor. Update is deliberately narrow (`status`/`clientName`/`clientCode` only, no delete endpoint).~~ — done via `services/client/createClient.ts`, `services/client/updateClient.ts`, `services/client/resolveFolder.ts`, the three new `db/adapter/` Drive functions (`createFolder.ts`, `folderExists.ts`, `driveChildExists.ts`), `utils/parseDriveLink.ts`, and `POST`/`PUT /api/v1/client`. Full details now live in `ARCHITECTURE.md`'s "Data model" section (Client-Config). `docs/BlackwellTime.md`'s old Client field list/creation flow (lines ~268-270, ~569, and the ~10-step folder-provisioning sketch) is now fully superseded — don't build from that doc for anything Client-related.

One deviation worth knowing if touching this again: the two Sheets files are named `"{ClientCode} Payroll Config"` / `"{ClientCode} Pay Period Registry"` (clientCode-prefixed, unlike the plain-named folders).

---

~~## TimesheetFolder entity + createEmployee/generateTimesheets rework (Client.timesheetsFolderId follow-up)~~

~~Design session same day. `Client.timesheetsFolderId` (nullable, no resolution path) was a stopgap — real clients can have several timesheet locations (different sites, changed over time), not just one. Replaced entirely with a proper one-to-many `TimesheetFolder` PayrollConfig entity (`TimesheetFolderId` app-generated UUID, `TimesheetFolderName`, `DriveFolderId`, `Status`) rather than a single client-level field.~~ — done. `Client.timesheetsFolderId` removed everywhere (model, column, mapper, create/update flows, schemas). New `TimesheetFolder` entity built full-width: model, own `TimesheetFolderStatus` enum, db layer (`mapTimesheetFolder.ts`/`readTimesheetFolders.ts`/`appendTimesheetFolder.ts`/`writeTimesheetFolders.ts`), services (`getTimesheetFolders.ts`/`createTimesheetFolder.ts`/`updateTimesheetFolder.ts`), routes (`GET`/`POST`/`PUT /api/v1/timesheetFolder`), wired into `readPayrollConfig.ts` as the 7th tab. Create/Update accept a raw Drive link (parsed via the existing `parseDriveLink` util, verified via the existing `folderExists` adapter — reused from Client CRUD, no new Drive mechanics). Status-only, no delete — same reasoning as `Client`: unlike `Supervisors`/`FundingSources`/`Activities`/`Holidays` (effectively snapshotted into each pay period's payroll report, so deleting old config doesn't corrupt historical reports), `Employee`/`TimesheetFolder` persist and get referenced indefinitely with no compensating snapshot — hard-delete would destroy an audit trail for no benefit.

`createEmployee.ts` now takes a new `EmployeeCreateRequest` type requiring exactly one of `timesheetFileId` (existing file) or `timesheetFolderId` (validated against this client's `TimesheetFolders` — must exist and be `Active` — then used to provision a new file there). `generateTimesheets.ts`'s lazy timesheet-file-creation fallback was removed entirely — a missing `timesheetFileId` on an active employee at generation time is now a data error, checked upfront (before the per-employee loop) and reported as one clear error naming every affected employee, rather than something generation tries to silently fix mid-batch.

Not touched, flagged for awareness: `db/employee/updateEmployeeTimesheetFile.ts` is now orphaned dead code (was only called from the removed `generateTimesheets.ts` fallback) — left in place, not deleted, since it wasn't asked for.

---

## Open Questions (see DECISIONS.md)

- Confirm holiday pay is time-and-a-half modifier
- Confirm flat rate code names — probably unnecessary; likely additive (not a replace) if ever needed, revisit at payroll app integration
- Confirm whether payroll service has rates on file (affects whether pay rates can be pulled automatically or must be maintained manually in payroll config)
