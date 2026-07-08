import getPayPeriodById from '#services/payPeriod/getPayPeriodById.js';
import readAdditionalExpensesTab from '#db/payrollReport/readAdditionalExpensesTab.js';
import AdditionalExpense from '#models/AdditionalExpense.js';
import Guid from '#models/Guid.js';
import { logger } from '#utils/logger.js';

const getAdditionalExpenses = async (clientId: Guid, payPeriodId: Guid): Promise<AdditionalExpense[]> => {
  logger.info(`getAdditionalExpenses clientId=${clientId} payPeriodId=${payPeriodId}`);

  const payPeriod = await getPayPeriodById(clientId, payPeriodId);

  if (!payPeriod.payrollReportFileId) return [];

  return (await readAdditionalExpensesTab(payPeriod.payrollReportFileId)) ?? [];
};

export default getAdditionalExpenses;
