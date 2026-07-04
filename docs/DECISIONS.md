# Client Decisions

Decisions that affect Blackwell's workflow, accounts, or costs. These need to be reviewed and approved by the client before going to production.

---

## Google OAuth for Login

Blackwell staff will sign in to the dashboard using their existing Google accounts. Each user must be added to the system by email address before their first login. There is no self-registration.

**Action required:** Provide a list of email addresses for all staff who should have access.

---

## Google Cloud Project Ownership

A Google Cloud project has been created to host the Sheets API integration and service account. Currently under the developer's Google account.

**Decision needed:** Should this be transferred to a Blackwell-owned Google account before going to production? Affects billing responsibility and long-term ownership.

---

## Service Account Access to Google Sheets

A service account has been granted Editor access to the Client-Config spreadsheet and all client Payroll-Config files. This is what allows the system to read configuration and generate timesheets automatically.

**Action required:** Blackwell should be aware that a service account (not a person) has editor access to these files. Any new config files added in the future will also need to be shared with the service account email.

---

## Hosting on Railway

The backend service runs on Railway. There is a small monthly cost (estimated a few dollars per month at this scale).

**Decision needed:** Who owns the Railway account and who is responsible for the hosting cost?

---

## Dashboard Access via Web URL

Blackwell staff will access the tool through a web browser at a URL, not inside Google Sheets. The Google Sheets files remain unchanged — the dashboard is a separate interface for triggering generation and tracking status.

**Confirm:** Is this acceptable for day-to-day use?

---

## Payroll Submission — Holiday Rate

Employees have a holiday rate in addition to base and secondary rates. It is not yet confirmed how holiday hours are handled for payroll submission.

**Current assumption:** Holiday pay is time-and-a-half — a 1.5× modifier applied to whichever rate the employee was working at (base or secondary) on that day. "Holiday rate" is not a separate rate but a multiplier on the applicable rate.

**Question:** Is this correct — holiday hours at base rate × 1.5, and holiday hours at secondary rate × 1.5? Or does Blackwell handle holiday pay differently?

---

## Flat Rate Codes

Flat rate activities need named codes that the payroll service maps to dollar amounts (same way Base/Secondary map to employee hourly rates). Placeholder codes `FlatRate1` and `FlatRate2` are in use until confirmed with the client.

**Questions:**
- What flat rate activity types does Blackwell actually have (e.g. on-call, meetings)?
- Does the payroll service support named flat rate codes, or does it take a dollar amount directly?

---

## Payroll Submission — Rate on File

Employees have up to three rates (base, secondary, holiday) plus flat rate amounts per activity. Pay rates are currently stored manually in the payroll config spreadsheet and used by the app to calculate funding source cost proportions for the allocation report.

**Question:** Does the payroll service already have employee rates on file? If so, can we pull rates from there rather than maintaining them manually in the config spreadsheet?

**Current assumption:** Rates are maintained manually in the payroll config until payroll service integration is available. This is a known duplication that will be resolved when the payroll service is integrated.

---

## Pay Period Status

Pay period status is descriptive, not prescriptive — it communicates where a pay period stands without locking down any actions.

| Status | Trigger |
|---|---|
| Pending | Pay period created |
| Open | Timesheets generated |
| Processed | Payroll report generated (can still be regenerated) |
| Closed | Bookkeeper clicks "Close Pay Period" button |

Status only moves forward. No enforcement — a "Processed" period can still have its payroll report regenerated freely.

---

## Timesheet Generation is One-Way

Once a timesheet tab is generated for an employee and pay period, it cannot be deleted through the dashboard. If a timesheet needs to be regenerated (e.g. activities were added after generation), the tab must be manually deleted from the employee's Google Sheet before regenerating.

**Confirm:** Is this workflow acceptable?
