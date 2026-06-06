# Business Rules

Rules and assumptions that are currently hardcoded or implied. Review when onboarding new clients or expanding the system.

---

## Timesheet Structure

- Timesheets are organized in weekly blocks, Monday through Sunday
- Each pay period tab contains one section per week
- Activities are rows, days of the week are columns (B through H)
- Column A is always the label column

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

## Funding Source Allocation

- Allocation percentages are stored per activity, not per pay period
- Allocation is derived from approved hours after payroll is run externally
- This system produces allocation percentages — it does not calculate gross wages
