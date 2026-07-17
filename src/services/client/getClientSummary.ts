import getClientById from '#services/client/getClientById.js';
import readPayrollConfig from '#db/payrollConfig/readPayrollConfig.js';
import { EmployeeStatus } from '#models/EmployeeStatus.js';
import { TimesheetFolderStatus } from '#models/TimesheetFolderStatus.js';
import ClientSummary from '#models/ClientSummary.js';
import { logger } from '#utils/logger.js';
import { NotFoundError } from '#utils/errors.js';
import getPayPeriods from '#services/payPeriod/getPayPeriods.js';
import { PayPeriodStatus } from '#models/PayPeriodStatus.js';
import buildPayPeriodResponse from '#services/payPeriod/buildPayPeriodResponse.js';

// Composes a client's payroll config into a summary for the Client Summary landing page.
// employees and timesheetFolders are filtered to active-only for dashboard cards; inactive records
// remain available through their dedicated endpoints.
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
  const activeTimesheetFolders = payrollConfig.timesheetFolders.filter(
    (timesheetFolder) => timesheetFolder.status === TimesheetFolderStatus.Active,
  );

  return {
    employees: activeEmployees,
    supervisors: payrollConfig.supervisors,
    activities: payrollConfig.activities,
    fundingSources: payrollConfig.fundingSources,
    holidays: payrollConfig.holidays,
    timesheetFolders: activeTimesheetFolders,
    settings: payrollConfig.settings,
    payPeriods: nonClosedPayPeriods,
  };
};

export default getClientSummary;
