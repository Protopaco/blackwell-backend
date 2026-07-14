import readPayrollConfig from '#db/payrollConfig/readPayrollConfig.js';
import getClientById from '#services/client/getClientById.js';
import Settings from '#models/Settings.js';
import { logger } from '#utils/logger.js';
import { NotFoundError } from '#utils/errors.js';

// Resolves the client's payrollConfigFileId and returns settings via the cached PayrollConfig bundle.
const getSettings = async (clientId: string): Promise<Settings> => {
  logger.info(`getSettings clientId=${clientId}`);

  const client = await getClientById(clientId);
  if (!client) throw new NotFoundError(`Client not found: ${clientId}`);

  const payrollConfig = await readPayrollConfig(client.payrollConfigFileId);
  return payrollConfig.settings;
};

export default getSettings;
