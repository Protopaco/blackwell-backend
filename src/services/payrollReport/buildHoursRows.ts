import PayrollReportHoursRow from '#models/PayrollReportHoursRow.js';
import TimesheetEntry from '#models/TimesheetEntry.js';

// Converts a flat list of TimesheetEntry records into Hours tab rows — one row per entry.
const buildHoursRows = (entries: TimesheetEntry[], generatedAt: string): PayrollReportHoursRow[] =>
  entries.map((entry) => ({
    GeneratedAt: generatedAt,
    EmployeeId: entry.employeeId,
    EmployeeName: entry.employeeName,
    ActivityName: entry.activityName,
    PayrollCategory: entry.payrollCategory,
    Date: entry.date,
    IsHoliday: entry.isHoliday ? 'TRUE' : 'FALSE',
    Hours: entry.hours,
  }));

export default buildHoursRows;
