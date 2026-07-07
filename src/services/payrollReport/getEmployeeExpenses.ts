import readClientById from '#db/client/readClientById.js';
import readPayPeriodById from '#db/payPeriod/readPayPeriodById.js';
import readEmployeeExpensesTab from '#db/payrollReport/readEmployeeExpensesTab.js';
import EmployeeExpense from '#models/EmployeeExpense.js';
import Guid from '#models/Guid.js';
import { logger } from '#utils/logger.js';
import { NotFoundError } from '#utils/errors.js';

const getEmployeeExpenses = async (clientId: Guid, payPeriodId: Guid): Promise<EmployeeExpense[]> => {
  logger.info(`getEmployeeExpenses clientId=${clientId} payPeriodId=${payPeriodId}`);

  const client = await readClientById(clientId);
  if (!client) throw new NotFoundError(`Client not found: ${clientId}`);

  const payPeriod = await readPayPeriodById(client.payPeriodRegistryFileId, payPeriodId);
  if (!payPeriod) throw new NotFoundError(`Pay period not found: ${payPeriodId}`);

  if (!payPeriod.payrollReportFileId) return [];

  return readEmployeeExpensesTab(payPeriod.payrollReportFileId);
};

export default getEmployeeExpenses;
