import getPayPeriodById from '#services/payPeriod/getPayPeriodById.js';
import writeAdditionalExpensesTab from '#db/payrollReport/writeAdditionalExpensesTab.js';
import AdditionalExpense from '#models/AdditionalExpense.js';
import Guid from '#models/Guid.js';
import { logger } from '#utils/logger.js';
import { NotFoundError } from '#utils/errors.js';

const updateAdditionalExpenses = async (
  clientId: Guid,
  payPeriodId: Guid,
  expenses: AdditionalExpense[],
): Promise<void> => {
  logger.info(`updateAdditionalExpenses clientId=${clientId} payPeriodId=${payPeriodId} count=${expenses.length}`);

  const payPeriod = await getPayPeriodById(clientId, payPeriodId);
  if (!payPeriod.payrollReportFileId) throw new NotFoundError(`No payroll report file exists for pay period: ${payPeriodId}`);

  await writeAdditionalExpensesTab(payPeriod.payrollReportFileId, expenses);
  logger.info(`updateAdditionalExpenses: complete for pay period ${payPeriodId}`);
};

export default updateAdditionalExpenses;
