import readPayrollConfig from '#db/payrollConfig/readPayrollConfig.js';
import getClientById from '#services/client/getClientById.js';
import TimesheetFolder from '#models/TimesheetFolder.js';
import { logger } from '#utils/logger.js';
import { NotFoundError } from '#utils/errors.js';

// Resolves the client's payrollConfigFileId and returns all timesheet folders via the cached PayrollConfig bundle.
const getTimesheetFolders = async (clientId: string): Promise<TimesheetFolder[]> => {
  logger.info(`getTimesheetFolders clientId=${clientId}`);

  const client = await getClientById(clientId);
  if (!client) throw new NotFoundError(`Client not found: ${clientId}`);

  const payrollConfig = await readPayrollConfig(client.payrollConfigFileId);
  return payrollConfig.timesheetFolders;
};

export default getTimesheetFolders;
