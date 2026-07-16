# Integration Test Scenario Plan (DRAFT — for review)

Planning document only — no test code here. Scenarios below were derived by reading the actual
service/route/model files for every endpoint not yet covered by `tests/integration/createClient/`
(same method used for `createClient`: real branches from real code, not guesses).

Status: draft, written overnight per request. Nothing in `tests/integration/` has been touched.
Review together and turn into real `scenarios.ts`/test files one operation at a time, per the
style guide's existing plan.

---

## Cross-cutting notes (apply to everything below)

**Error mapping** (confirmed in `src/middleware/mapErrorResponse.ts`):
`NotFoundError` → 404, body `{ error: 'not_found', message }`. `UnprocessableError` → 422, body
`{ error: 'unprocessable', message }`. Every `assert` below should check `res.body.message`, same
rule as `createClient`.

**Suspected second occurrence of the `createClient` permissions bug.** `generatePayrollReport.ts`
creates the report workbook via `createOAuthWorkbook` (OAuth client) and then immediately writes
tabs to it via `writePayrollReportTab` → `createTabIfNotExists` → `createTab` (service-account
client) — the exact same OAuth-create-then-service-account-write shape that produced the real
`403 PERMISSION_DENIED` we hit testing `createClient`. Flagged, not touched. Worth confirming/fixing
the root cause once (probably: share created files with the service account, or use one credential
type consistently) rather than patching each call site separately. Every other OAuth-create call
site (`createEmployee`, `createTimesheetFolder` via `folderExists` only, `createClient`) was checked
— this is the only other one found.

**Inconsistent "client not found" behavior on reads.** Every other client-scoped read
(`getEmployees`, `getActivities`, `getSettings`, `getTimesheetFolders`, `getClientSummary`, etc.)
throws `NotFoundError` → 404 when `clientId` doesn't resolve. `getPayPeriods.ts` is the one
exception — it returns `[]` with 200 instead. Worth a scenario that pins down current behavior either
way, and a product question for you: intentional, or a bug?

**Cost tiering.** Same convention as `createClient`: "free" = fails before any live API call
(pure validation), "real" = costs at least one live Sheets/Drive request. Noted per scenario.

---

## client/ (remaining — createClient already done)

### updateClient — `PUT /client/:clientId`
Only `status`/`clientName`/`clientCode` are editable; everything else in the body is ignored.
- `updateClient_success` (200, real) — updates status/name/code on an existing test client, asserts persisted via a follow-up GET.
- `updateClient_partialUpdate` (200, real) — sends only `{ status }`, asserts clientName/clientCode unchanged.
- `updateClient_notFound` (404, real — one failed lookup call) — random/garbage clientId.

### getClients — `GET /client`
- `getClients_returnsList` (200, real) — asserts the array contains a just-created test client by clientId. No error branches — pure passthrough.

~~### getClientEmployees — `GET /client/:clientId/employees`~~
~~Removed duplicate route. Use `GET /employee/:clientId` instead.~~

### getClientSummary — `GET /client/:clientId/summary`
Composes payrollConfig + non-closed pay periods; filters to active employees only.
- `getClientSummary_success` (200, real) — asserts shape: employees/supervisors/activities/fundingSources/holidays/settings/payPeriods all present.
- `getClientSummary_excludesInactiveEmployees` (200, real) — needs one Active + one Inactive employee (builder dependency: `createTestEmployee`), asserts inactive one is absent.
- `getClientSummary_excludesClosedPayPeriods` (200, real) — needs a Closed pay period present, asserts it's excluded from `payPeriods`.
- `getClientSummary_clientNotFound` (404, real).

---

## employee/

### createEmployee — `POST /employee/:clientId`
- `createEmployee_withTimesheetFolderId` (201, real) — provisions a new timesheet workbook via a pre-existing Active TimesheetFolder (builder dependency: `createTestTimesheetFolder`).
- `createEmployee_withExistingTimesheetFileId` (201, real) — passes an existing file id directly, skips provisioning.
- `createEmployee_clientNotFound` (404, real).
- `createEmployee_missingBothTimesheetFields` (422, free) — neither `timesheetFileId` nor `timesheetFolderId`.
- `createEmployee_timesheetFolderNotFound` (404, real) — garbage `timesheetFolderId`.
- `createEmployee_timesheetFolderInactive` (404, real) — same code path as "not found": an Inactive TimesheetFolder is treated identically (`!timesheetFolder || status !== Active`). Worth asserting the message doesn't imply "doesn't exist" when it does exist but is Inactive — possible product/UX gap to flag, not a bug.

### updateEmployee — `PUT /employee/:clientId/:employeeId`
- `updateEmployee_success` (200, real).
- `updateEmployee_clientNotFound` (404, real).
- `updateEmployee_employeeNotFound` (404, real) — valid client, garbage employeeId (surfaces from `writeEmployees`'s find-or-404, one level deeper than the client check).

### getEmployees — `GET /employee/:clientId`
- `getEmployees_success` (200, real).
- `getEmployees_clientNotFound` (404, real).

---

## activity/

### createActivity — `POST /activity/:clientId`
- `createActivity_success` (201, real) — 2 funding sources summing to 100.
- `createActivity_percentageRemainderApplied` (201, real) — last funding source's submitted percentage deliberately wrong; asserts the server overwrote it with the computed remainder (needs a GET-back or `getActivities` follow-up to check the persisted value, since POST only returns `{ message }`).
- `createActivity_tooManyFundingSources` (422, free) — 4 funding sources, fails before the client lookup even happens (validated first in the function).
- `createActivity_remainderNegative` (422, real) — funding sources before the last already exceed 100%.
- `createActivity_clientNotFound` (404, real).

### updateActivity — `PUT /activity/:clientId/:activityId`
Same three validation branches as create (order: fundingSources length check, then client lookup — note update's `writeActivities` doesn't appear to distinguish "activity not found" as its own 404, unlike employee — worth double-checking `writeActivities`'s find-or-404 behavior before assuming; if it silently no-ops instead of 404ing that's worth flagging).
- `updateActivity_success` (200, real).
- `updateActivity_tooManyFundingSources` (422, free).
- `updateActivity_clientNotFound` (404, real).
- `updateActivity_activityNotFound` (unconfirmed status — check `writeActivities.ts` before writing; likely 404 like `writeEmployees` but not yet read).

### deleteActivity — `DELETE /activity/:clientId/:activityId`
- `deleteActivity_success` (200, real).
- `deleteActivity_clientNotFound` (404, real).
- `deleteActivity_activityNotFound` (unconfirmed — check `deleteActivityRow.ts`).

### getActivities — `GET /activity/:clientId`
- `getActivities_success` (200, real).
- `getActivities_clientNotFound` (404, real).

---

## fundingSource/

### createFundingSource — `POST /fundingSource/:clientId`
- `createFundingSource_success` (201, real) — no validation branches beyond client existence.
- `createFundingSource_clientNotFound` (404, real).

### updateFundingSource — `PUT /fundingSource/:clientId/:fundingSourceId`
- `updateFundingSource_success` (200, real).
- `updateFundingSource_clientNotFound` (404, real).
- `updateFundingSource_fundingSourceNotFound` (unconfirmed — check `writeFundingSources.ts`).

### deleteFundingSource — `DELETE /fundingSource/:clientId/:fundingSourceId`
The one delete with real business logic — blocked if referenced by an activity.
- `deleteFundingSource_success` (200, real) — unreferenced funding source.
- `deleteFundingSource_clientNotFound` (404, real).
- `deleteFundingSource_fundingSourceNotFound` (404, real) — garbage id, found explicitly in-service (not delegated to the row-delete layer like others).
- `deleteFundingSource_stillReferenced` (422, real) — needs an Activity referencing this funding source by name first (builder dependency: `createTestActivity` with a matching `fundingSourceName`).

### getFundingSources — `GET /fundingSource/:clientId`
- `getFundingSources_success` (200, real).
- `getFundingSources_clientNotFound` (404, real).

---

## holiday/

Structurally identical to fundingSource minus the "still referenced" delete guard — holidays have
no reverse-reference check in `deleteHoliday.ts`.
- `createHoliday_success` (201, real).
- `createHoliday_clientNotFound` (404, real).
- `updateHoliday_success` (200, real).
- `updateHoliday_clientNotFound` (404, real).
- `updateHoliday_holidayNotFound` (unconfirmed — check `writeHolidays.ts`).
- `deleteHoliday_success` (200, real).
- `deleteHoliday_clientNotFound` (404, real).
- `deleteHoliday_holidayNotFound` (unconfirmed — check `deleteHolidayRow.ts`; deleteHoliday doesn't pre-check existence in-service the way deleteFundingSource does, so behavior on a garbage id is whatever the row-delete layer does — could be a silent no-op instead of 404, worth confirming before assuming).
- `getHolidays_success` (200, real).
- `getHolidays_clientNotFound` (404, real).

---

## supervisor/

Same shape again — no reverse-reference guard on delete.
- `createSupervisor_success` (201, real).
- `createSupervisor_clientNotFound` (404, real).
- `updateSupervisor_success` (200, real).
- `updateSupervisor_clientNotFound` (404, real).
- `updateSupervisor_supervisorNotFound` (unconfirmed — check `writeSupervisors.ts`).
- `deleteSupervisor_success` (200, real).
- `deleteSupervisor_clientNotFound` (404, real).
- `deleteSupervisor_supervisorNotFound` (unconfirmed — check `deleteSupervisorRow.ts`).
- `getSupervisors_success` (200, real).
- `getSupervisors_clientNotFound` (404, real).

---

## settings/

Settings is a singleton per client (no id, no create/delete — only get/update).
- `updateSettings_success` (200, real).
- `updateSettings_clientNotFound` (404, real).
- `getSettings_success` (200, real).
- `getSettings_clientNotFound` (404, real).

---

## timesheetFolder/

### createTimesheetFolder — `POST /timesheetFolder/:clientId`
Always created Active regardless of request body; `driveFolderLink` parsed + verified live.
- `createTimesheetFolder_success` (201, real) — real folder link, anchored under `TEST_DATA_ROOT_FOLDER_ID`.
- `createTimesheetFolder_clientNotFound` (404, real).
- `createTimesheetFolder_badFolderLink` (404, real) — syntactically valid but nonexistent Drive folder id, mirrors `createClient_badFolderLink`.
- `createTimesheetFolder_malformedFolderLink` (422, free) — reuses the same `parseDriveLink` as createClient, so same free/malformed-string branch.

### updateTimesheetFolder — `PUT /timesheetFolder/:clientId/:timesheetFolderId`
- `updateTimesheetFolder_nameOnly` (200, real) — only `timesheetFolderName`, driveFolderLink untouched/not re-verified.
- `updateTimesheetFolder_statusChange` (200, real) — flips Active → Inactive; useful precondition builder for `createEmployee_timesheetFolderInactive` above.
- `updateTimesheetFolder_newDriveLink` (200, real) — re-verifies the new link live.
- `updateTimesheetFolder_clientNotFound` (404, real).
- `updateTimesheetFolder_timesheetFolderNotFound` (404, real) — checked explicitly in-service, confirmed.
- `updateTimesheetFolder_badFolderLink` (404, real) — new link doesn't resolve.

### getTimesheetFolders — `GET /timesheetFolder/:clientId`
- `getTimesheetFolders_success` (200, real).
- `getTimesheetFolders_clientNotFound` (404, real).

---

## payPeriod/

### createPayPeriod — `POST /payPeriod/:clientId`
Note: route doc only documents 201, no 404 listed, but service does call `getClientById` and throws
`NotFoundError` on a missing client — the swagger comment looks stale/incomplete, not the code.
- `createPayPeriod_success` (201, real).
- `createPayPeriod_clientNotFound` (404, real) — undocumented in the route's swagger block but present in the service; worth calling out when we generate docs from these scenarios later, since it'll surface the gap.

### updatePayPeriod — `PUT /payPeriod/:clientId/:payPeriodId`
Same undocumented-404 pattern as above (route doc only says 200).
- `updatePayPeriod_success` (200, real) — e.g. Pending → Open transition.
- `updatePayPeriod_clientNotFound` (404, real).
- `updatePayPeriod_payPeriodNotFound` (unconfirmed — check `writePayPeriod.ts`, likely 404 like the employee/funding-source pattern).

### closePayPeriod — `PATCH /payPeriod/:clientId/:payPeriodId/close`
- `closePayPeriod_success` (200, real) — Open → Closed.
- `closePayPeriod_alreadyClosed` (200, real) — explicit no-op branch in the service; assert it doesn't error and the pay period is unchanged.
- `closePayPeriod_clientNotFound` (404, real) — via `getPayPeriodById` → `getClientAndPayPeriod`.
- `closePayPeriod_payPeriodNotFound` (404, real) — confirmed explicit in `getClientAndPayPeriod`.

### getNextPayPeriod — `GET /payPeriod/:clientId/next`
Real computed-date logic worth exercising both branches of.
- `getNextPayPeriod_noPriorPayPeriods` (200, real) — fresh client, asserts `startDate` equals the client's `settings.payPeriodStartDate`.
- `getNextPayPeriod_afterExisting` (200, real) — one existing pay period, asserts new `startDate` = prior `endDate` + 1 day and interval length matches `payPeriodInterval` (Weekly=7, BiWeekly=14).
- `getNextPayPeriod_clientNotFound` (404, real).

### getPayPeriodById — `GET /payPeriod/:clientId/:payPeriodId`
- `getPayPeriodById_success` (200, real).
- `getPayPeriodById_clientNotFound` (404, real).
- `getPayPeriodById_payPeriodNotFound` (404, real) — confirmed explicit.

### getPayPeriods — `GET /payPeriod/:clientId`
- `getPayPeriods_success` (200, real).
- `getPayPeriods_clientNotFound_returnsEmptyArray` (200, real) — deliberately pins the divergent behavior flagged above rather than assuming it should 404; flag for a product decision, don't "fix" it in the test.

---

## timesheet/

### generateTimesheets — `POST /timesheet/:clientId/:payPeriodId/generate`
Heavy service — worth a few real scenarios given how much logic lives here (week-chunking,
manifest, formatting, status flip). All real, all quota-relevant — consider running this operation's
suite least frequently once built.
- `generateTimesheets_success` (200, real) — one active employee with a valid `timesheetFileId`, asserts tab created + pay period flips Pending → Open.
- `generateTimesheets_skipsExistingTab` (200, real) — run twice for the same employee/pay period, second run is a no-op for that employee (needs to assert no duplicate tab / no error, not easy to assert via HTTP alone — may need a direct adapter read in the test, same pattern as the `orphanedRegistryClientCode` precondition trick in createClient).
- `generateTimesheets_employeeMissingTimesheetFile` (422, real) — active employee with an empty `timesheetFileId` (only reachable by crafting the PayrollConfig row directly, similar to the orphaned-registry trick — normal `createEmployee` never allows this state).
- `generateTimesheets_clientOrPayPeriodNotFound` (404, real) — via `getClientAndPayPeriod`.

### getTimesheetStatuses — `GET /timesheet/status/:clientId/:payPeriodId`
- `getTimesheetStatuses_notGenerated` (200, real) — before `generateTimesheets` has run, `totalHours` null → status `NotGenerated`.
- `getTimesheetStatuses_afterGenerate` (200, real) — after generation, unsigned → `Generated`.
- `getTimesheetStatuses_payPeriodNotFound` (404, real).
Note: full traversal of all 5 status states (Generated/Submitted/Approved/Complete) requires
simulating signatures and `current_hours` inclusion — likely out of scope for integration tests
and better covered by the existing unit tests on `deriveTimesheetStatus` directly; flagging rather
than planning all 5 as live scenarios.

---

## payrollReport/

The biggest remaining surface. Everything here depends on a pay period with at least one Complete
(both-signed) timesheet, which integration tests can't easily produce end-to-end (signing happens
in the live spreadsheet, not via any API route) — worth discussing how far into this we actually go
live vs. leaving it to unit coverage.

### generatePayrollReport — `POST /payrollReport/:clientId/:payPeriodId/generate`
- `generatePayrollReport_noCompleteTimesheets` (422, real) — the one branch reachable without a signed timesheet; cheapest real scenario here.
- `generatePayrollReport_clientOrPayPeriodNotFound` (404, real).
- `generatePayrollReport_success` (200, real) — **blocked** until we decide how to fake a Complete timesheet signature state for a test employee; flagging as needing a decision, not building blind. Also the operation most likely to reproduce the OAuth/service-account bug noted above — if we do build this one, expect it to fail the same way `createClient` did on first live run.

### generateAllocationReport — `POST /payrollReport/:clientId/:payPeriodId/allocationReport`
- `generateAllocationReport_reportNotYetGenerated` (422, real) — cheap, no precondition needed beyond a valid pay period.
- `generateAllocationReport_noHoursData` (422, real) — needs a `payrollReportFileId` set but empty `current_hours` — likely another orphaned-precondition-via-direct-adapter-call scenario.
- `generateAllocationReport_clientOrPayPeriodNotFound` (404, real).
- `generateAllocationReport_success` (200, real) — blocked on the same "need a real generated payroll report" precondition as above.

### getPayrollReport — `GET /payrollReport/:clientId/:payPeriodId`
- `getPayrollReport_noReportYet` (200, real) — returns `null`, not 404 — asserts body is literally `null`.
- `getPayrollReport_payPeriodNotFound` (404, real).
- `getPayrollReport_success` (200, real) — blocked on generated-report precondition.

### getAllocationReport — `GET /payrollReport/:clientId/:payPeriodId/allocationReport`
- `getAllocationReport_noReportYet` (200, real) — returns `[]`.
- `getAllocationReport_payPeriodNotFound` (404, real).

### getEmployeeExpenses / updateEmployeeExpenses / updateEmployeeExpensesBatch
- `getEmployeeExpenses_noReportYet` (200, real) — returns `[]`.
- `getEmployeeExpenses_payPeriodNotFound` (404, real).
- `updateEmployeeExpenses_noReportFile` (404, real) — pay period exists but `payrollReportFileId` unset.
- `updateEmployeeExpenses_activeWithHours_rejected` (422, real) — marking an employee inactive while they have `TotalHours > 0` in the summary — needs a generated report precondition (blocked, same as above).
- `updateEmployeeExpenses_upsertNew` (200, real) — employee not yet in the expenses tab, needs only a `payrollReportFileId` set (achievable via the orphaned-precondition trick without a full report generation).
- `updateEmployeeExpensesBatch_success` (200, real) — mix of new + existing employeeIds.
- `updateEmployeeExpensesBatch_unknownEmployeeId` (422, real) — one id not in PayrollConfig; asserts nothing was written (partial-failure-is-all-or-nothing behavior worth explicitly checking via a follow-up GET).
- `updateEmployeeExpensesBatch_noReportFile` (404, real).

### getAdditionalExpenses / updateAdditionalExpenses
- `getAdditionalExpenses_noReportYet` (200, real) — returns `[]`.
- `getAdditionalExpenses_payPeriodNotFound` (404, real).
- `updateAdditionalExpenses_success` (200, real) — needs only `payrollReportFileId` set.
- `updateAdditionalExpenses_noReportFile` (404, real).

---

## admin/ and health/

- `clearCache_success` (200, real-but-free — a Sheets/Drive call isn't made, this just clears in-memory Maps; zero quota cost despite being a live HTTP call). Only one branch, no auth/guard on this route currently — worth a passing mention, not a finding, since it wasn't asked about.
- `health_success` (200, free) — static response, arguably not worth a formal scenario file at all given it's a hardcoded `{ status: 'ok' }` with zero logic.

---

## Open items before building (need your input, not blocking the plan)

1. **`writeActivities`/`writeFundingSources`/`writeHolidays`/`writeSupervisors`/`writePayPeriod` not-found behavior** — only `writeEmployees` was actually read this session (confirmed 404-on-missing-id). The others marked "unconfirmed" above follow the same naming pattern and almost certainly behave the same way, but that's an assumption carried over from `createEmployee`'s file, not something read directly for each one yet.
2. **`deleteHolidayRow`/`deleteSupervisorRow`/`deleteActivityRow` not-found behavior** — same gap: `deleteFundingSource` explicitly pre-checks existence in the service layer before deleting; the others call straight through to the row-delete adapter with no service-level check, so "delete a nonexistent id" might silently succeed rather than 404. Worth reading those three adapter files before writing the actual scenarios.
3. **How far to go on `payrollReport` "success" paths** — several are blocked on manufacturing a Complete (both-signed) timesheet, which has no API route (signing happens in the live sheet). Options: (a) skip true success-path integration coverage here and rely on unit tests, (b) find/build a direct adapter-level way to write signature cells as a test precondition like the orphaned-registry trick, (c) something else. Wanted your call before spending real API calls exploring this.
4. **The `getPayPeriods` empty-array-instead-of-404 divergence** — plan above treats it as current, intentional-until-told-otherwise behavior. Flag if you want it changed; if so it's a one-line service fix, not a test-scope problem.
5. **The systemic OAuth/service-account bug in `generatePayrollReport`** — same shape as the `createClient` bug, not yet confirmed live (would need a real run to prove it, which means either fixing `createClient`'s version first or hitting the same wall twice). Suggest fixing the root cause once both are confirmed to share it, rather than patching per-operation.
