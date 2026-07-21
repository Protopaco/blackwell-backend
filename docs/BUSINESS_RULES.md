# Business Rules

Rules and assumptions that are currently hardcoded or implied. Review when onboarding new clients or expanding the system.

---

## Timesheet Structure

- Timesheets are organized in weekly blocks, Monday through Sunday
- Each pay period tab contains one section per week
- Activities are rows, days of the week are columns (B through H)
- Column A is always the label column

### Tab Layout (per pay period)

```
[Header]
Row 1: Pay Period label + pay period name
Row 2: Employee name + position
Row 3: Divider

[Week 1]
Row 4: Holiday row — holiday name above its date column, empty otherwise
Row 5: Day row — Mon, Tue, Wed, Thu, Fri, Sat, Sun
Row 6: Date row — formatted dates e.g. 6/1, 6/2...
Row 7+: Activity rows (see Activity Sort Order below)
Daily Total row — sums all hourly activity rows per column; includes weekly total formula
[Divider]
Flat Rate Activities (if any exist)
[Divider]

[Week 2]
...same structure repeated...

[Footer]
Employee signature row
Supervisor signature row

[Daily Totals]
One column per day (Mon-Sun) — formula sums all hourly activity rows for that day
One weekly total cell — formula sums the daily total columns

[Summary]
Total Hours Worked    — sum of all hourly activity rows
Holiday Hours         — sum of hours in holiday columns across all hourly rows
ETO                   — sum of rows where PayrollCategory = ETO
PTO                   — sum of rows where PayrollCategory = PTO
STO                   — sum of rows where PayrollCategory = STO
Flat Rate Shifts      — count of flat rate rows (only if flat rate activities exist)
```

> Summary rows only appear for PayrollCategories that exist on the client's activities.
> Summary uses Google Sheets formulas so totals update live as employees enter hours.

### Activity Sort Order

Activities are split into three groups, each sorted alphabetically:

```
[Work Activities]        PayrollCategory = Base or Secondary
[Time Off Activities]    PayrollCategory = ETO, PTO, or STO
[Divider]
[Flat Rate Activities]   PayRate = FlatRate
```

Work and Time Off groups are not visually separated from each other but Time Off sits below Work. Flat Rate is always separated by a divider.

> Implementation: `sortActivities()` service function in `src/services/timesheet/sortActivities.ts`
> Returns: `{ workActivities[], timeOffActivities[], flatRateActivities[] }` each sorted alphabetically by activityName

### Holiday Display

- Holidays are date-based, not activity-based
- A holiday row sits above the day/date rows in each week section
- The holiday name appears only in the column corresponding to that date
- All other cells in the holiday row are empty
- Employees enter hours against their normal activities on holiday days
- Holiday hours are captured in the summary by summing holiday column values across all hourly rows

### Flat Rate Activities

- Flat rate activities appear in the weekly grid like hourly activities
- Columns are Mon-Sun, same as hourly
- Employee marks which days they performed the flat rate activity (e.g. 1 for on-call shift)
- Summary counts total flat rate entries, not hours
- Use case: on-call shifts — employee is paid a flat rate to be available; if called in, additional hourly work is recorded separately

### Manifest

- A `_manifest` tab is created in each employee timesheet workbook
- One row per pay period tab, storing a JSON blob of the timesheet structure
- Records exact row numbers for each activity and column numbers for each date
- Used to read back approved hours without interrogating the sheet structure
- Sheet and manifest are always created and deleted together — they are one unit

## Pay Periods

- Supported intervals: Weekly, Bi-weekly
- Monthly is defined in constants but not yet implemented
- Pay period names are formatted as MM/DD - MM/DD
- Pay periods are chunked into 7-day blocks starting from the pay period start date (not calendar weeks)
  - A pay period starting on Wednesday will chunk Wed-Tue, not Mon-Sun
  - This ensures week totals and daily totals align with the actual pay period calendar
- Implementation: `chunkDatesByWeek()` utility in `src/utils/dateUtils.ts`

## Date Utilities

The `src/utils/dateUtils.ts` module provides:

- `getDatesBetween(startDate, endDate)` — returns array of all dates inclusive between start and end
- `chunkDatesByWeek(dates)` — chunks array into 7-day blocks; used to split pay periods into weekly sections
- `formatDateHeader(date)` — formats date as M/D (no leading zeros) for display in timesheet
- `getDayOfWeek(date)` — returns day name (Mon, Tue, Wed, etc.) for display in timesheet
- `getHolidayName(date, holidays)` — looks up holiday name for a given date, returns null if not a holiday

## Activities

- Maximum three funding sources per activity
- Funding source percentages are stored on the activity, not derived at runtime

## Employees

- Only Active employees get timesheets generated
- One timesheet file per employee, one tab per pay period
- Timesheet files are never deleted through the tool
- When a new employee is added, their timesheet file is created automatically in the client's `TimesheetFolderId` via OAuth. The file ID is written back to the `TimesheetFileId` column in the Employees config tab automatically.

## TimesheetFolders

- TimesheetFolder names are unique per client, using trimmed, case-insensitive comparison.
- The Drive folder link/id is set at creation only. Updates can change `TimesheetFolderName` and `Status`, but cannot change `DriveFolderId`.
- TimesheetFolders are never deleted through the tool. Mark them `Inactive` to preserve audit context when a location should no longer be used for new employees.

## Holidays

- Holidays are shared across all employees for a client
- No per-employee holiday exceptions

## Supervisors

- Any supervisor can approve any employee's timesheet
- No hard assignment between supervisors and employees
- Whoever signs the timesheet is the approver of record

## Approval

- Approval is recorded by writing the supervisor name and date to the signature row
- No digital signature verification
- No approval notifications
- Status is determined by reading signature cell coordinates from the manifest:
  - `NotGenerated` — no manifest found
  - `Generated` — manifest exists, signature cells are empty
  - `Submitted` — employee signature cell is filled
  - `Approved` — supervisor signature cell is filled (employee may or may not be signed)
  - `Complete` — both signature cells are filled

## Pay Rates

- Pay rates (Base, Secondary, Holiday) are stored on the employee record
- Pay rates are display only — never used in calculations by this system
- Gross pay calculation belongs to ADP, not this system

## Timesheet Templates

- Two templates defined: TotalHours and ClockInOut
- ClockInOut template is defined but not yet implemented
- For ClockInOut timesheets, hours will be calculated from clock in/out times at read time

> ⚠️ Cleanup: `TimesheetTemplate` is a misnomer. TotalHours and ClockInOut are not different templates — they are different time input methods for the same template. Should be renamed to `TimeInputMethod` in a future cleanup pass.

## Time Entry

- A TimeEntry must have either `hours` OR both `clockIn` and `clockOut` — never neither
- For TotalHours timesheets: `hours` is set directly by the employee
- For ClockInOut timesheets: `clockIn` and `clockOut` are set, `hours` is calculated at read time and also stored
- Clock in/out raw values will need to be persisted to the database in a future phase — currently only hours are stored

## Data Mapping

- The Apps Script config sheet stores `TimesheetTemplate` — mapped to `timeInputMethod` in this codebase
- The Apps Script config sheet uses PascalCase column headers (e.g. `EmployeeId`, `FirstName`) — the `db/` layer is responsible for mapping these to camelCase model properties
- The `db/` layer is the only place where raw sheet column names appear — models always use camelCase

## Timesheet Data Validation (Phase 2)

- Hourly activity cells should only accept decimal numbers
- Flat rate activity cells should only accept integers
- No letters or symbols permitted in data entry cells
- To be implemented after initial timesheet structure is approved

## Timesheet Generation Pipeline (Complete)

The timesheet generation service (`generateTimesheets`) builds the entire sheet structure in memory, then writes in a single batch call to avoid throttling:

1. Load payroll config (one batch read of all config tabs)
2. Filter to active employees
3. For each employee:
   - Check if timesheet already exists (read manifest) — skip if tab still exists; regenerate if tab was manually deleted
   - Create timesheet file via OAuth if employee has no `timesheetFileId` yet
   - Generate timesheet structure in memory:
     - Sort activities via `sortActivities()`
     - Get date range via `getDatesBetween()`
     - Chunk dates via `chunkDatesByWeek()`
     - Build header rows, then one week section per week (holiday, day, date, activity, daily total rows)
     - Build signature rows and summary formula rows
   - Write entire structure to employee's timesheet file in one call
   - Apply all formatting in one `batchUpdate` call via `applyTimesheetFormatting()`
   - Build and save manifest for later reading

Implementation status:
- ✅ `sortActivities()` — separates and sorts activities by type
- ✅ `dateUtils.ts` — all date utilities complete
- ✅ `rowBuilders.ts` — header, employee, divider, holiday, day, date, activity, daily total, summary, signature rows
- ✅ `buildWeek.ts` — combines holiday + day + date + activities + daily total for one week, returns rows + WeekManifest
- ✅ `generateTimesheets.ts` — full orchestration: in-memory build, batch write, formatting, manifest save
- ✅ `applyTimesheetFormatting.ts` — all formatting applied in single batchUpdate
- ✅ `readTimesheetDetail.ts` — reads signature cells and total hours via manifest coordinates
- ✅ `getTimesheetStatuses.ts` — returns per-employee hours + signature status for a pay period (GET /timesheet/status/:clientId/:payPeriodId)

## Payroll Reports

- One payroll report file per pay period, named by pay period (e.g. `04/29 - 05/12`), stored in the client's `payrollReportFolderId`
- Files are created automatically via OAuth when a payroll report is first generated for a pay period
- Each file has four tabs:

| Tab | Owner | Description |
|-----|-------|-------------|
| `Hours` | App | Raw activity totals read from timesheets, appended on each run |
| `Payroll Summary` | App | Hours rolled up by payroll category per employee, appended on each run |
| `Results` | Bookkeeper | Gross pay per employee as output by ADP — manually entered, never touched by the app |
| `Allocation` | Formulas | Funding source cost breakdown — formula-driven, reads from `Hours` and `Results`, updates automatically when `Results` is filled in |

### Re-run Behaviour

The payroll report function is designed to be called multiple times for the same pay period as timesheets are signed. Each run archives the previous data and writes a fresh set from scratch.

On each run:
1. Check if the report file exists — create it via OAuth if not
2. Scan all active employee timesheets — only process employees whose timesheet is `Complete` (both employee and supervisor signatures present)
3. If no timesheets are Complete, throw an error and do nothing
4. For each Complete timesheet, apply the `includeInPayroll` rule (see below) before including it
5. If `current_hours` exists, rename it to `hrs_MMDD_HHmm` (e.g. `hrs_0626_1430`)
6. If `current_payroll_summary` exists, rename it to `adp_MMDD_HHmm` using the same timestamp
7. Write fresh `current_hours` and `current_payroll_summary` tabs with all currently-included Complete employees

### Include/Ignore for Payroll (`includeInPayroll`)

- Each generated timesheet has a real Google Sheets checkbox (label: "Supervisor approval: Include in payroll"), placed next to the supervisor signature. Defaults checked (`TRUE`) when the timesheet is generated. Edited directly in the sheet by a supervisor — there is no API to set it; the app only reads it.
- The checkbox is only honored once the timesheet is otherwise `Complete` (both signatures present) — an unsigned timesheet is excluded by the existing signature rule regardless of the checkbox value.
- Once Complete:
  - `includeInPayroll = TRUE` — employee is included, same as before this rule existed.
  - `includeInPayroll = FALSE` and the employee has zero total hours and zero flat-rate quantity — employee is silently skipped (not an error; this is the normal "supervisor unchecked it, nothing to lose" case).
  - `includeInPayroll = FALSE` but the employee has any hours or flat-rate quantity — payroll report generation fails outright with a validation error naming the employee, rather than silently dropping recorded hours. The supervisor/admin must resolve this on the timesheet (either re-check the box or zero out the hours) before generation can proceed.
- `EmployeeExpenses` no longer carries an Include/Ignore flag — it's expenses-only (`employeeId`, `employeeName`, `totalExpense`). The allocation report (`buildAllocationRows.ts`) simply includes any expense record with a non-null `totalExpense`; employees excluded from payroll never appear in the hours data it computes from, so they contribute nothing regardless.

> The archive tabs use the timestamp of when they were archived, not when they were originally generated. MMDD_HHmm format (e.g. `hrs_0626_1430`) is used to keep tab names short.

> Write order is: write new data to temp tabs first, then rename old tabs to archives, then rename temp tabs to current. This ensures `Allocation` is never left pointing at a missing tab if a write fails midway.

> `Results` and `Allocation` are never touched on any run, regardless of how many times the function is called.

> The UI disables the generate button while the function is running to prevent concurrent runs.

### Tab Structure

```
current_hours            ← always the latest run; referenced by Allocation formulas
current_payroll_summary  ← always the latest run
hrs_0626_1430            ← archived previous run (Hours)
payroll_0626_1430        ← archived previous run (Payroll Summary, same timestamp)
hrs_0624_0900            ← older run
payroll_0624_0900        ← older run
Results                  ← bookkeeper-entered gross pay, never touched by app
Allocation               ← formula-driven, always reads from current_hours and Results
```

### Hours Tab Columns

One row per employee per activity per day. Raw daily entries are preserved so any aggregation can be derived — holiday hours, non-holiday hours, weekly subtotals, funding source breakdowns.

| Column | Description |
|--------|-------------|
| `generatedAt` | ISO timestamp of the run that produced this row |
| `employeeId` | |
| `employeeName` | |
| `activityName` | |
| `payrollCategory` | Base / ETO / PTO / STO / Holiday / FlatRate |
| `date` | ISO date string (YYYY-MM-DD) |
| `isHoliday` | TRUE if this date is a configured holiday for the client |
| `hours` | Hours entered for this activity on this date (shift count for flat rate) |

### ADP Summary Tab Columns

Rolled up from the Hours tab data — total hours per employee per payroll category.

| Column | Description |
|--------|-------------|
| `generatedAt` | ISO timestamp of the run that produced this row |
| `employeeId` | |
| `employeeName` | |
| `payrollCategory` | |
| `totalHours` | Sum of all hours in this category for this employee across the pay period |
| `holidayHours` | Hours in this category that fell on holiday dates |

### Flat Rate Activities in Reports

Flat rate activities are counted by shifts, not summed as hours. In the `Hours` tab, `hours` for a flat rate activity is `1` if the employee worked that day or `0` if not. The `payrollCategory` is `FlatRate` to distinguish them from hourly rows.

## Funding Source Allocation

- Allocation percentages are stored per activity, not per pay period
- Allocation is derived from approved hours after payroll is run externally
- This system produces allocation percentages — it does not calculate gross wages
