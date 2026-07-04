# TODO

## Completed

- ~~Work through "closing pay period" tasks~~ — Pay period status model defined (Pending → Open → Processed → Closed), close endpoint built, status updates wired into generateTimesheets and generatePayrollReport
- ~~Sketch out UI and what will be needed for each page~~ — See docs/UI.md
- ~~Sketch out "add payroll data for allocation"~~ — See docs/BlackwellTime.md Allocation Report section

---

## Data Model / Config

### Update employee data model to include all fields, including pay rates
Audit the employee model against all fields stored in the payroll config spreadsheet. Ensure pay rates (HourlyPayRate1, HourlyPayRate2, FlatPayRate1, FlatPayRate2) are properly typed and accessible for use in the allocation calculation.

### Remove allocationReportFolderId from logic and references
The allocation report now lives in the payroll report workbook — there is no separate allocation report folder. Remove `allocationReportFolderId` from the client model, config reads, docs, and any references in routes or services.

---

## Allocation Report — Spreadsheet Tabs

### Create EmployeeExpenses tab service
Write a service that creates/overwrites the `EmployeeExpenses` tab in the payroll report workbook. Columns: `employeeId`, `employeeName`, `include` (boolean), `totalExpense` (number | null). No history — overwrite every save.

### Create PayrollExpenses tab service
Write a service that creates/overwrites the `PayrollExpenses` tab in the payroll report workbook. Columns: `expenseName`, `amount`. No history — overwrite every save.

### Create AllocationReport tab service
Write a service that creates/overwrites the `AllocationReport` tab in the payroll report workbook. Columns: `fundingSourceId`, `fundingSourceName`, `totalExpense`. No history — overwrite every save.

### Create tab-order maintenance service
After any write to the payroll report workbook, reorder tabs so active tabs are on the left and archive tabs are on the right. Active tab order: `current_hours`, `current_adp_summary`, `EmployeeExpenses`, `PayrollExpenses`, `AllocationReport`. Archive tabs follow in chronological order.

---

## Allocation Report — Services

### Create Update Employee Expenses service
Accepts a list of employee expense records (`employeeId`, `include`, `totalExpense`). Enforces server-side rule: `include` cannot be `false` if the employee has hours in `current_hours` for this pay period. Writes to `EmployeeExpenses` tab.

### Create Update PayrollExpenses service
Accepts a list of additional org-level expense items (`expenseName`, `amount`). Writes to `PayrollExpenses` tab.

### Create Generate Allocation Report service
Reads `current_hours`, `EmployeeExpenses`, and `PayrollExpenses`. Runs the full allocation calculation:
1. Per included employee: hours × pay rate → weighted cost per funding source → proportion of total
2. Apply proportions to employee's `totalExpense` → dollar amount per funding source
3. Sum across all employees per funding source → total org spend per funding source
4. Compute funding source shares of total org spend
5. Distribute each `PayrollExpenses` item proportionally across funding sources
6. Final = wages allocation + distributed additional expenses per funding source

Writes results to `AllocationReport` tab. See BlackwellTime.md for full calculation detail.

---

## Allocation Report — Endpoints

### GET /v1/pay-periods/:payPeriodId/employee-expenses
Returns the current `EmployeeExpenses` data for the pay period. Used to populate the Employee Timesheet Status card expense fields.

### PUT /v1/pay-periods/:payPeriodId/employee-expenses
Accepts and saves employee expense data. Enforces include/ignore business rule server-side.

### GET /v1/pay-periods/:payPeriodId/payroll-expenses
Returns the current `PayrollExpenses` data for the pay period.

### PUT /v1/pay-periods/:payPeriodId/payroll-expenses
Accepts and saves org-level additional expense items.

### POST /v1/pay-periods/:payPeriodId/allocation-report
Triggers the Generate Allocation Report service. Calculates and writes the `AllocationReport` tab. Returns the allocation results for in-app display.

### GET /v1/pay-periods/:payPeriodId/allocation-report
Returns the current allocation report data for in-app display.

---

## Testing

### Unit tests for allocation calculation
The allocation math is complex enough to warrant thorough unit tests. Cover: proportion calculation, expense distribution, ignored employees, employees with no hours in a funding source, org-level expense distribution, edge cases (single employee, single funding source, zero expenses).

---

## Open Questions (see DECISIONS.md)
- Confirm holiday pay is time-and-a-half modifier
- Confirm flat rate code names
- Confirm whether payroll service has rates on file (affects whether pay rates can be pulled automatically or must be maintained manually in payroll config)
