# UI Sketch

## App Layout

Single page application with a persistent app bar across the top.

### App Bar
- **Top left**: Client selection component. Visible at all times.
- **Top right**: Google Sign In button when signed out. When signed in, shows user's first name and a Sign Out button.

### No Client Selected
Basic landing/welcome page. Left drawer does not appear.

### Client Selected
Left drawer appears. Main content area loads the Client Summary page.

---

## Left Drawer (Client Nav)

| Item | Status |
|---|---|
| Pay Periods | Active |
| Employees | Greyed out (future) |
| Supervisors | Greyed out (future) |
| Funding Sources | Greyed out (future) |
| Activities | Greyed out (future) |
| Holidays | Greyed out (future) |
| Settings | Greyed out (future) |

---

## Pages

### Client Summary
Default page when a client is selected. Displays basic client information.

---

### Pay Periods Index
Accessed via "Pay Periods" in the left drawer.

- List of pay periods in reverse chronological order
- Each row shows: Pay Period Name, Status
- Clicking a pay period opens the Pay Period Dashboard
- **"Create Pay Period" button** — opens a confirmation modal showing Name, Start Date, End Date, and a Create button. No user configuration — dates are driven by existing config.

---

### Pay Period Dashboard
Opened by clicking a pay period from the index. Contains the following cards:

#### Card 1 — Pay Period Info
- Pay period name, start date, end date, status

#### Card 2 — Employee Timesheet Status
This card handles both timesheet status tracking and expense entry for the allocation report.

**Per employee row:**
- Employee name
- Timesheet status — one of five states, from `GET /timesheet/status/:clientId/:payPeriodId` (`status` field, backed by the `TimesheetStatus` model):
  | Status | Meaning |
  |---|---|
  | `NotGenerated` | No timesheet tab exists yet for this employee/pay period |
  | `Generated` | Timesheet exists, employee hasn't signed yet |
  | `Submitted` | Employee has signed, supervisor hasn't |
  | `Approved` | Both signed, but not yet reflected in a generated payroll report |
  | `Complete` | Both signed and included in the most recently generated payroll report's `current_hours` |
  FE display grouping (e.g. collapsing to fewer visual states) is a FE design decision, not dictated by the backend.
- Include/Ignore toggle — defaults to Include; locked to Include if the employee has hours this period (enforced server-side)
- Total Expense field — dollar amount input (wages + taxes + everything, entered after bookkeeper runs payroll externally); required if Include, greyed out if Ignore

**Card actions:**
- **"Generate Timesheets" button** — generates timesheets for any employees who don't yet have one (e.g. newly added). Always available.
- **"Write Allocation Report" button** — enabled only once all included employees have a Total Expense entered. Triggers the app's allocation calculation and writes results to the payroll report workbook.

#### Card 3 — Payroll Report
- Payroll report status
- **"Generate Payroll Report" button** — can be run multiple times; re-generation is supported
- In-app display of payroll report data (design TBD — likely modal or separate page; depends on client feedback and employee count)

#### Card 4 — Allocation Report
- Live display of funding source allocations — recalculates as expense data is entered on Card 2
- Fields for org-level additional expenses (e.g. HSA, benefits) — entered here, distributed proportionally across funding sources by the app
- **"Close Pay Period" button** — final step; enabled once the allocation report has been written to the sheet. Sets pay period status to Closed.
