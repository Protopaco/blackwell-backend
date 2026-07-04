import readClientById from '#db/client/readClientById.js';
import readPayPeriodById from '#db/payPeriod/readPayPeriodById.js';
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

  const client = await readClientById(clientId);
  if (!client) throw new NotFoundError(`Client not found: ${clientId}`);

  const payPeriod = await readPayPeriodById(client.payPeriodRegistryFileId, payPeriodId);
  if (!payPeriod) throw new NotFoundError(`Pay period not found: ${payPeriodId}`);
  if (!payPeriod.payrollReportFileId) throw new NotFoundError(`No payroll report file exists for pay period: ${payPeriodId}`);

  await writeAdditionalExpensesTab(payPeriod.payrollReportFileId, expenses);
  logger.info(`updateAdditionalExpenses: complete for pay period ${payPeriodId}`);
};

export default updateAdditionalExpenses;
