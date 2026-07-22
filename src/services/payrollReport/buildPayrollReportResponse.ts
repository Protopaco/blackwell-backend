import { isFlatRate } from '#models/PayRate.js';
import EmployeeExpense from '#models/EmployeeExpense.js';
import EmployeePayrollSummary from '#models/EmployeePayrollSummary.js';
import PayrollReportResponse from '#models/PayrollReportResponse.js';

// Transforms flat PayrollReportSummaryRow records (read from the spreadsheet) into a grouped-by-employee response shape.
// employeeExpenses is joined in by employeeId; an employee with no expense entry gets totalExpense: null.
const buildPayrollReportResponse = (
  rawRows: Record<string, unknown>[],
  employeeExpenses: EmployeeExpense[] | null = [],
): PayrollReportResponse => {
  const response: PayrollReportResponse = {};
  const totalExpenseByEmployeeId = new Map((employeeExpenses ?? []).map((expense) => [expense.employeeId, expense.totalExpense]));

  for (const row of rawRows) {
    const employeeId = row['EmployeeId'] as string;
    const payRate = row['PayRate'] as string;

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

    if (isFlatRate(payRate as any)) {
      const quantity = Number(row['TotalHours']);
      employee.flatRate.push({ payRate, quantity });
      employee.totalFlatRate += quantity;
    } else {
      const totalHours = Number(row['TotalHours']);
      employee.hourly.push({
        payrollCategory: row['PayrollCategory'] as string,
        payRate,
        isHoliday: row['IsHoliday'] === 'TRUE' || row['IsHoliday'] === true,
        totalHours,
      });
      employee.totalHours += totalHours;
    }
  }

  return response;
};

export default buildPayrollReportResponse;
