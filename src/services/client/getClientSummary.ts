import getClientById from '#services/client/getClientById.js';
import readPayrollConfig from '#db/payrollConfig/readPayrollConfig.js';
import { EmployeeStatus } from '#models/EmployeeStatus.js';
import ClientSummary from '#models/ClientSummary.js';
import { logger } from '#utils/logger.js';
import { NotFoundError } from '#utils/errors.js';
import getPayPeriods from '#services/payPeriod/getPayPeriods.js';
import { PayPeriodStatus } from '#models/PayPeriodStatus.js';
import buildPayPeriodResponse from '#services/payPeriod/buildPayPeriodResponse.js';

// Composes a client's payroll config into a summary for the Client Summary landing page.
// employees is filtered to active-only — inactive employees are still available, unfiltered, via GET /employee/:clientId.
const getClientSummary = async (clientId: string): Promise<ClientSummary> => {
  logger.info(`getClientSummary clientId=${clientId}`);

  const client = await getClientById(clientId);
  if (!client) throw new NotFoundError(`Client not found: ${clientId}`);

  const payrollConfig = await readPayrollConfig(client.payrollConfigFileId);
  const payperiods = await getPayPeriods(clientId);

  const nonClosedPayPeriods = payperiods
    .filter((payperiod) => payperiod.status !== PayPeriodStatus.Closed)
    .map(buildPayPeriodResponse);

  const activeEmployees = payrollConfig.employees.filter(
    (employee) => employee.status === EmployeeStatus.Active,
  );

  return {
    employees: activeEmployees,
    supervisors: payrollConfig.supervisors,
    activities: payrollConfig.activities,
    fundingSources: payrollConfig.fundingSources,
    holidays: payrollConfig.holidays,
    settings: payrollConfig.settings,
    payPeriods: nonClosedPayPeriods,
  };
};

export default getClientSummary;
