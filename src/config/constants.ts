import type EmployeeExpense from '#models/EmployeeExpense.js';
import type AdditionalExpense from '#models/AdditionalExpense.js';
import type AllocationReportRow from '#models/AllocationReportRow.js';
import type PayrollReportHoursRow from '#models/PayrollReportHoursRow.js';
import type PayrollReportSummaryRow from '#models/PayrollReportSummaryRow.js';

// ─── Payroll Report Tabs ──────────────────────────────────────────────────────

export const CURRENT_HOURS_TAB = 'current_hours';
export const CURRENT_PAYROLL_SUMMARY_TAB = 'current_payroll_summary';
export const PENDING_HOURS_TAB = 'pending_hours';
export const PENDING_PAYROLL_SUMMARY_TAB = 'pending_payroll_summary';
export const HOURS_HEADERS: (keyof PayrollReportHoursRow)[] = [
  'GeneratedAt', 'EmployeeId', 'EmployeeName', 'ActivityName',
  'PayrollCategory', 'Date', 'IsHoliday', 'Hours',
];
export const SUMMARY_HEADERS: (keyof PayrollReportSummaryRow)[] = [
  'GeneratedAt', 'EmployeeId', 'EmployeeName',
  'PayrollCategory', 'PayRate', 'IsHoliday', 'TotalHours',
];
export const EMPLOYEE_EXPENSES_TAB = 'EmployeeExpenses';
export const EMPLOYEE_EXPENSES_HEADERS: (keyof EmployeeExpense)[] = ['employeeId', 'employeeName', 'activeThisPayPeriod', 'totalExpense'];
export const ADDITIONAL_EXPENSES_TAB = 'AdditionalExpenses';
export const ADDITIONAL_EXPENSES_HEADERS: (keyof AdditionalExpense)[] = ['expenseName', 'amount'];
export const ALLOCATION_REPORT_TAB = 'AllocationReport';
export const ALLOCATION_REPORT_HEADERS: (keyof AllocationReportRow)[] = ['fundingSourceName', 'wagesAllocation', 'additionalExpenses', 'total'];

// ─── Timesheet Tabs ───────────────────────────────────────────────────────────

export const MANIFEST_TAB = '_manifest';
export const MANIFEST_HEADERS = ['tabName', 'manifest'];

// ─── Pay Period Registry Tabs ─────────────────────────────────────────────────

export const PAY_PERIOD_HEADERS = [
  'PayPeriodId', 'PayPeriodName', 'Status', 'StartDate', 'EndDate', 'CreatedDate', 'PayrollReportFileId',
];

// ─── Payroll Config Sheet Tabs ────────────────────────────────────────────────

export const EMPLOYEES_TAB = 'Employees';
export const EMPLOYEES_HEADERS = [
  'EmployeeId', 'FirstName', 'LastName', 'Position',
  'HourlyPayRate1', 'HourlyPayRate2', 'HolidayPayRate',
  'Email', 'Status', 'TimesheetFileId',
];
export const ACTIVITIES_TAB = 'Activities';
export const ACTIVITIES_HEADERS = [
  'ActivityId', 'ActivityName', 'TrackSeparately', 'PayrollCategory',
  'FundingSource1Name', 'FundingSource1Percentage',
  'FundingSource2Name', 'FundingSource2Percentage',
  'FundingSource3Name', 'FundingSource3Percentage',
  'PayRate', 'FlatRateAmount',
];
export const FUNDING_SOURCES_TAB = 'FundingSources';
export const FUNDING_SOURCES_HEADERS = ['FundingSourceId', 'FundingSourceName', 'FundingSourceCode'];
export const HOLIDAYS_TAB = 'Holidays';
export const HOLIDAYS_HEADERS = ['HolidayId', 'HolidayName', 'HolidayDate'];
export const SUPERVISORS_TAB = 'Supervisors';
export const SUPERVISORS_HEADERS = ['SupervisorId', 'FirstName', 'LastName', 'Email'];
export const SETTINGS_TAB = 'Settings';
export const SETTINGS_HEADERS = ['TimesheetTemplate', 'PayPeriodInterval', 'PayPeriodStartDate'];

// ─── Client Config Sheet Tabs ─────────────────────────────────────────────────

export const CLIENTS_TAB = 'Clients';
export const CLIENT_HEADERS = [
  'ClientId',
  'ClientName',
  'ClientCode',
  'Status',
  'EmployeePayrollFolderId',
  'PayrollConfigFolderId',
  'PayrollReportFolderId',
  'TimesheetsFolderId',
  'PayrollConfigFileId',
  'PayPeriodRegistryFileId',
];

// ─── Client Provisioning — Drive folder/file names ────────────────────────────
// Folder names are used as-is. File names are labels only — createClient.ts prefixes each with the
// client's clientCode to produce the real file name (e.g. "ACME Payroll Config").

export const EMPLOYEE_PAYROLL_FOLDER_NAME = 'Employee Payroll';
export const PAYROLL_CONFIG_FOLDER_NAME = 'Payroll Config';
export const PAYROLL_REPORT_FOLDER_NAME = 'Payroll Report';
export const PAYROLL_CONFIG_FILE_LABEL = 'Payroll Config';
export const PAY_PERIOD_REGISTRY_FILE_LABEL = 'Pay Period Registry';

// ─── Cache TTLs ───────────────────────────────────────────────────────────────

export const CACHE_TTL_SHORT_MS = 60 * 1000;
export const CACHE_TTL_MEDIUM_MS = 5 * 60 * 1000;
export const CACHE_TTL_LONG_MS = 30 * 60 * 1000;
