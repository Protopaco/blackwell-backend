import getPayPeriodById from '#services/payPeriod/getPayPeriodById.js';
import readEmployeeExpensesTab from '#db/payrollReport/readEmployeeExpensesTab.js';
import writeEmployeeExpensesTab from '#db/payrollReport/writeEmployeeExpensesTab.js';
import mergeEmployeeExpenseTotals from '#services/payrollReport/mergeEmployeeExpenseTotals.js';
import EmployeeExpenseUpdate from '#models/EmployeeExpenseUpdate.js';
import Guid from '#models/Guid.js';
import { logger } from '#utils/logger.js';
import { NotFoundError } from '#utils/errors.js';

const updateEmployeeExpensesBatch = async (
  clientId: Guid,
  payPeriodId: Guid,
  updates: EmployeeExpenseUpdate[],
): Promise<void> => {
  logger.info(
    `updateEmployeeExpensesBatch clientId=${clientId} payPeriodId=${payPeriodId} count=${updates.length}`,
  );

  const payPeriod = await getPayPeriodById(clientId, payPeriodId);
  if (!payPeriod.payrollReportFileId)
    throw new NotFoundError(`No payroll report file exists for pay period: ${payPeriodId}`);

  const existingExpenses = (await readEmployeeExpensesTab(payPeriod.payrollReportFileId)) ?? [];
  const mergedExpenses = mergeEmployeeExpenseTotals(existingExpenses, updates);

  await writeEmployeeExpensesTab(payPeriod.payrollReportFileId, mergedExpenses);
  logger.info(`updateEmployeeExpensesBatch: complete for pay period ${payPeriodId}`);
};

export default updateEmployeeExpensesBatch;
