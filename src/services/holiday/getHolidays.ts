import readPayrollConfig from '#db/payrollConfig/readPayrollConfig.js';
import getClientById from '#services/client/getClientById.js';
import Holiday from '#models/Holiday.js';
import { logger } from '#utils/logger.js';
import { NotFoundError } from '#utils/errors.js';

// Resolves the client's payrollConfigFileId and returns all holidays via the cached PayrollConfig bundle.
const getHolidays = async (clientId: string): Promise<Holiday[]> => {
  logger.info(`getHolidays clientId=${clientId}`);

  const client = await getClientById(clientId);
  if (!client) throw new NotFoundError(`Client not found: ${clientId}`);

  const payrollConfig = await readPayrollConfig(client.payrollConfigFileId);
  return payrollConfig.holidays;
};

export default getHolidays;
