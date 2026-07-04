import readClientById from '#db/client/readClientById.js';
import readPayPeriodById from '#db/payPeriod/readPayPeriodById.js';
import readAdditionalExpensesTab from '#db/payrollReport/readAdditionalExpensesTab.js';
import AdditionalExpense from '#models/AdditionalExpense.js';
import Guid from '#models/Guid.js';
import { logger } from '#utils/logger.js';
import { NotFoundError } from '#utils/errors.js';

const getAdditionalExpenses = async (clientId: Guid, payPeriodId: Guid): Promise<AdditionalExpense[]> => {
  logger.info(`getAdditionalExpenses clientId=${clientId} payPeriodId=${payPeriodId}`);

  const client = await readClientById(clientId);
  if (!client) throw new NotFoundError(`Client not found: ${clientId}`);

  const payPeriod = await readPayPeriodById(client.payPeriodRegistryFileId, payPeriodId);
  if (!payPeriod) throw new NotFoundError(`Pay period not found: ${payPeriodId}`);

  if (!payPeriod.payrollReportFileId) return [];

  return readAdditionalExpensesTab(payPeriod.payrollReportFileId);
};

export default getAdditionalExpenses;
