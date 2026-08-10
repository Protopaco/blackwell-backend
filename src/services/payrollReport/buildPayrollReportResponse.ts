import EmployeeExpense from '#models/EmployeeExpense.js';
import EmployeePayrollSummary from '#models/EmployeePayrollSummary.js';
import PayrollReportResponse from '#models/PayrollReportResponse.js';

// SHIM — the PayRate column (and the hourly/flat-rate split it drove) was removed from
// PayrollReportSummaryRow in [052]; the real replacement (splitting by the bridge row's payRateType) is
// [055]'s scope. Every row is treated as hourly until then — flatRate is always empty.
const buildPayrollReportResponse = (
  rawRows: Record<string, unknown>[],
  employeeExpenses: EmployeeExpense[] | null = [],
): PayrollReportResponse => {
  const response: PayrollReportResponse = {};
  const totalExpenseByEmployeeId = new Map((employeeExpenses ?? []).map((expense) => [expense.employeeId, expense.totalExpense]));

  for (const row of rawRows) {
    const employeeId = row['EmployeeId'] as string;

    if (!response[employeeId]) {
      response[employeeId] = {
        employeeName: row['EmployeeName'] as string,
        totalHours: 0,
        totalFlatRate: 0,
        totalExpense: totalExpenseByEmployeeId.get(employeeId) ?? null,
        hourly: [],
        flatRate: [],
      } satisfies EmployeePayrollSummary;
    }

    const employee = response[employeeId];

    const totalHours = Number(row['TotalHours']);
    employee.hourly.push({
      payrollCategory: row['PayrollCategory'] as string,
      payRate: '',
      isHoliday: row['IsHoliday'] === 'TRUE' || row['IsHoliday'] === true,
      totalHours,
    });
    employee.totalHours += totalHours;
  }

  return response;
};

export default buildPayrollReportResponse;
