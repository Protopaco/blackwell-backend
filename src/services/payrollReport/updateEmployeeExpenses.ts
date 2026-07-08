import getPayPeriodById from '#services/payPeriod/getPayPeriodById.js';
import readPayrollReportSummary from '#db/payrollReport/readPayrollReportSummary.js';
import readEmployeeExpensesTab from '#db/payrollReport/readEmployeeExpensesTab.js';
import writeEmployeeExpensesTab from '#db/payrollReport/writeEmployeeExpensesTab.js';
import EmployeeExpense from '#models/EmployeeExpense.js';
import Guid from '#models/Guid.js';
import { logger } from '#utils/logger.js';
import { NotFoundError, UnprocessableError } from '#utils/errors.js';

const updateEmployeeExpenses = async (
  clientId: Guid,
  payPeriodId: Guid,
  updatedExpense: EmployeeExpense,
): Promise<void> => {
  logger.info(`updateEmployeeExpenses clientId=${clientId} payPeriodId=${payPeriodId} employeeId=${updatedExpense.employeeId}`);

  const payPeriod = await getPayPeriodById(clientId, payPeriodId);
  if (!payPeriod.payrollReportFileId) throw new NotFoundError(`No payroll report file exists for pay period: ${payPeriodId}`);

  if (!updatedExpense.activeThisPayPeriod) {
    const summaryRows = await readPayrollReportSummary(payPeriod.payrollReportFileId);
    const hasHours = summaryRows.some(
      (row) => row['EmployeeId'] === updatedExpense.employeeId && Number(row['TotalHours']) > 0,
    );
    if (hasHours) {
      throw new UnprocessableError(`Employee ${updatedExpense.employeeId} has hours this pay period and cannot be marked inactive`);
    }
  }

  const existingExpenses = await readEmployeeExpensesTab(payPeriod.payrollReportFileId);
  const index = existingExpenses.findIndex((expense) => expense.employeeId === updatedExpense.employeeId);

  if (index >= 0) {
    existingExpenses[index] = updatedExpense;
  } else {
    existingExpenses.push(updatedExpense);
  }

  await writeEmployeeExpensesTab(payPeriod.payrollReportFileId, existingExpenses);
  logger.info(`updateEmployeeExpenses: complete for employee ${updatedExpense.employeeId}`);
};

export default updateEmployeeExpenses;
