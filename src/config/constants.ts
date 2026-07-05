import type EmployeeExpense from '#models/EmployeeExpense.js';
import type AdditionalExpense from '#models/AdditionalExpense.js';
import type AllocationReportRow from '#models/AllocationReportRow.js';

// ─── Payroll Report Tabs ──────────────────────────────────────────────────────

export const CURRENT_HOURS_TAB = 'current_hours';
export const CURRENT_PAYROLL_SUMMARY_TAB = 'current_payroll_summary';
export const PENDING_HOURS_TAB = 'pending_hours';
export const PENDING_PAYROLL_SUMMARY_TAB = 'pending_payroll_summary';
export const EMPLOYEE_EXPENSES_TAB = 'EmployeeExpenses';
export const EMPLOYEE_EXPENSES_HEADERS: (keyof EmployeeExpense)[] = ['employeeId', 'employeeName', 'activeThisPayPeriod', 'totalExpense'];
export const ADDITIONAL_EXPENSES_TAB = 'AdditionalExpenses';
export const ADDITIONAL_EXPENSES_HEADERS: (keyof AdditionalExpense)[] = ['expenseName', 'amount'];
export const ALLOCATION_REPORT_TAB = 'AllocationReport';
export const ALLOCATION_REPORT_HEADERS: (keyof AllocationReportRow)[] = ['fundingSourceName', 'wagesAllocation', 'additionalExpenses', 'total'];

// ─── Timesheet Tabs ───────────────────────────────────────────────────────────

export const MANIFEST_TAB = '_manifest';

// ─── Payroll Config Sheet Tabs ────────────────────────────────────────────────

export const EMPLOYEES_TAB = 'Employees';
export const ACTIVITIES_TAB = 'Activities';
export const FUNDING_SOURCES_TAB = 'FundingSources';
export const HOLIDAYS_TAB = 'Holidays';
export const SUPERVISORS_TAB = 'Supervisors';
export const SETTINGS_TAB = 'Settings';

// ─── Client Config Sheet Tabs ─────────────────────────────────────────────────

export const CLIENTS_TAB = 'Clients';
