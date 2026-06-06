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

## Funding Source Allocation

- Allocation percentages are stored per activity, not per pay period
- Allocation is derived from approved hours after payroll is run externally
- This system produces allocation percentages — it does not calculate gross wages
