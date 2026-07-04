import readClientById from '#db/client/readClientById.js';
import readPayPeriodById from '#db/payPeriod/readPayPeriodById.js';
import readEmployeeExpensesTab from '#db/payrollReport/readEmployeeExpensesTab.js';
import EmployeeExpense from '#models/EmployeeExpense.js';
import Guid from '#models/Guid.js';
import { logger } from '#utils/logger.js';

const getEmployeeExpenses = async (clientId: Guid, payPeriodId: Guid): Promise<EmployeeExpense[] | null> => {
  logger.info(`getEmployeeExpenses clientId=${clientId} payPeriodId=${payPeriodId}`);

  const client = await readClientById(clientId);
  if (!client) return null;

  const payPeriod = await readPayPeriodById(client.payPeriodRegistryFileId, payPeriodId);
  if (!payPeriod) return null;

  if (!payPeriod.payrollReportFileId) return null;

  return readEmployeeExpensesTab(payPeriod.payrollReportFileId);
};

export default getEmployeeExpenses;
