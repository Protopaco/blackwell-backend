import PayrollReportSummaryRow from '#models/PayrollReportSummaryRow.js';
import TimesheetEntry from '#models/TimesheetEntry.js';

// Aggregates TimesheetEntry records into ADP Summary rows — one row per employee per payroll category.
const buildSummaryRows = (entries: TimesheetEntry[], generatedAt: string): PayrollReportSummaryRow[] => {
  const summaryMap = new Map<string, PayrollReportSummaryRow>();

  for (const entry of entries) {
    const key = `${entry.employeeId}__${entry.payrollCategory}`;
    const existing = summaryMap.get(key);

    if (existing) {
      existing.TotalHours += entry.hours;
      if (entry.isHoliday) existing.HolidayHours += entry.hours;
    } else {
      summaryMap.set(key, {
        GeneratedAt: generatedAt,
        EmployeeId: entry.employeeId,
        EmployeeName: entry.employeeName,
        PayrollCategory: entry.payrollCategory,
        TotalHours: entry.hours,
        HolidayHours: entry.isHoliday ? entry.hours : 0,
      });
    }
  }

  return Array.from(summaryMap.values());
};

export default buildSummaryRows;
