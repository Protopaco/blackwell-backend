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

## Timesheet Generation is One-Way

Once a timesheet tab is generated for an employee and pay period, it cannot be deleted through the dashboard. If a timesheet needs to be regenerated (e.g. activities were added after generation), the tab must be manually deleted from the employee's Google Sheet before regenerating.

**Confirm:** Is this workflow acceptable?
