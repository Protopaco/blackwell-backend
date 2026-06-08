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
Last: Divider

[Week 2]
...same structure repeated...

[Footer]
Employee signature row
Supervisor signature row

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

## Activities

- Maximum three funding sources per activity
- Funding source percentages are stored on the activity, not derived at runtime

## Employees

- Only Active employees get timesheets generated
- One timesheet file per employee, one tab per pay period
- Timesheet files are never deleted through the tool

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

## Funding Source Allocation

- Allocation percentages are stored per activity, not per pay period
- Allocation is derived from approved hours after payroll is run externally
- This system produces allocation percentages — it does not calculate gross wages
