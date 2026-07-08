import getPayPeriodById from '#services/payPeriod/getPayPeriodById.js';
import readEmployeeExpensesTab from '#db/payrollReport/readEmployeeExpensesTab.js';
import EmployeeExpense from '#models/EmployeeExpense.js';
import Guid from '#models/Guid.js';
import { logger } from '#utils/logger.js';

const getEmployeeExpenses = async (clientId: Guid, payPeriodId: Guid): Promise<EmployeeExpense[]> => {
  logger.info(`getEmployeeExpenses clientId=${clientId} payPeriodId=${payPeriodId}`);

  const payPeriod = await getPayPeriodById(clientId, payPeriodId);

  if (!payPeriod.payrollReportFileId) return [];

  return (await readEmployeeExpensesTab(payPeriod.payrollReportFileId)) ?? [];
};

export default getEmployeeExpenses;
