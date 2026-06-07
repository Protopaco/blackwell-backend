import getClientById from '#db/client/getClientById.js';
import getPayPeriodById from '#db/payPeriod/getPayPeriodById.js';
import getPayrollConfig from '#db/payrollConfig/getPayrollConfig.js';
import getManifest from '#db/manifest/getManifest.js';
import saveManifest from '#db/manifest/saveManifest.js';
import sheetsAdapter from '#db/adapter/sheetsAdapter.js';
import { EmployeeStatus } from '#models/EmployeeStatus.js';
import Guid from '#models/Guid.js';
import { logger } from '#utils/logger.js';

const generateTimesheets = async (clientId: Guid, payPeriodId: Guid): Promise<void> => {
  const clientConfigFileId = process.env.CLIENT_CONFIG_FILE_ID;
  if (!clientConfigFileId) throw new Error('CLIENT_CONFIG_FILE_ID is not set');

  // Load client
  const client = await getClientById(clientConfigFileId, clientId);
  if (!client) throw new Error(`Client not found: ${clientId}`);

  // Load pay period
  const payPeriod = await getPayPeriodById(client.payPeriodRegistryFileId, payPeriodId);
  if (!payPeriod) throw new Error(`Pay period not found: ${payPeriodId}`);

  // Load all config in one batch call
  const payrollConfig = await getPayrollConfig(client.payrollConfigFileId);

  const activeEmployees = payrollConfig.employees.filter(
    (employee) => employee.status === EmployeeStatus.Active,
  );

  logger.info(`Generating timesheets for ${activeEmployees.length} employees`);

  for (const employee of activeEmployees) {
    // Skip if timesheet already exists for this pay period
    const existingManifest = await getManifest(employee.timesheetFileId, payPeriod.payPeriodName);
    if (existingManifest) {
      logger.info(`Timesheet already exists — skipping ${employee.firstName} ${employee.lastName}`);
      continue;
    }

    logger.info(`Generating timesheet for ${employee.firstName} ${employee.lastName}`);

    // TODO: build timesheet structure in memory
    // TODO: write timesheet in one batch call
    // TODO: build manifest
    // TODO: save manifest

    logger.info(`Timesheet generated for ${employee.firstName} ${employee.lastName}`);
  }
};

export default generateTimesheets;
