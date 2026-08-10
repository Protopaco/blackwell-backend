import PayrollReportSummaryRow from '#models/PayrollReportSummaryRow.js';
import TimesheetEntry from '#models/TimesheetEntry.js';

// Aggregates TimesheetEntry records into summary rows — one row per employee per payroll category, pay rate type, and holiday modifier.
const buildSummaryRows = (entries: TimesheetEntry[], generatedAt: string): PayrollReportSummaryRow[] => {
  const summaryMap = new Map<string, PayrollReportSummaryRow>();

  for (const entry of entries) {
    const key = `${entry.employeeId}__${entry.payrollCategory}__${entry.payRateType}__${entry.isHoliday}`;
    const existing = summaryMap.get(key);

    if (existing) {
      existing.TotalHours += entry.hours;
    } else {
      summaryMap.set(key, {
        GeneratedAt: generatedAt,
        EmployeeId: entry.employeeId,
        EmployeeName: entry.employeeName,
        PayrollCategory: entry.payrollCategory,
        PayRateType: entry.payRateType,
        IsHoliday: entry.isHoliday,
        TotalHours: entry.hours,
      });
    }
  }

  return Array.from(summaryMap.values());
};

export default buildSummaryRows;
