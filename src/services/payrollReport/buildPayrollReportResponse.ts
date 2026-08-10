import { EmployeeActivityPayRateType } from '#models/EmployeeActivityPayRateType.js';
import EmployeeExpense from '#models/EmployeeExpense.js';
import EmployeePayrollSummary from '#models/EmployeePayrollSummary.js';
import PayrollReportResponse from '#models/PayrollReportResponse.js';

// Transforms flat PayrollReportSummaryRow records (read from the spreadsheet) into a grouped-by-employee response shape.
// employeeExpenses is joined in by employeeId; an employee with no expense entry gets totalExpense: null.
// Rows are routed by PayRateType: FlatRate goes to the flatRate bucket; Hourly and Salary (both hour-tracked
// on the timesheet) go to the hourly bucket — salary's own dollar handling is [057]'s scope, not this response shape.
const buildPayrollReportResponse = (
  rawRows: Record<string, unknown>[],
  employeeExpenses: EmployeeExpense[] | null = [],
): PayrollReportResponse => {
  const response: PayrollReportResponse = {};
  const totalExpenseByEmployeeId = new Map((employeeExpenses ?? []).map((expense) => [expense.employeeId, expense.totalExpense]));

  for (const row of rawRows) {
    const employeeId = row['EmployeeId'] as string;
    const payRateType = row['PayRateType'] as string;

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

    if (payRateType === EmployeeActivityPayRateType.FlatRate) {
      const quantity = Number(row['TotalHours']);
      employee.flatRate.push({ payRate: payRateType, quantity });
      employee.totalFlatRate += quantity;
    } else {
      const totalHours = Number(row['TotalHours']);
      employee.hourly.push({
        payrollCategory: row['PayrollCategory'] as string,
        payRate: payRateType,
        isHoliday: row['IsHoliday'] === 'TRUE' || row['IsHoliday'] === true,
        totalHours,
      });
      employee.totalHours += totalHours;
    }
  }

  return response;
};

export default buildPayrollReportResponse;
