import readPayrollConfig from '#db/payrollConfig/readPayrollConfig.js';
import getClientById from '#services/client/getClientById.js';
import Supervisor from '#models/Supervisor.js';
import { logger } from '#utils/logger.js';
import { NotFoundError } from '#utils/errors.js';

// Resolves the client's payrollConfigFileId and returns all supervisors via the cached PayrollConfig bundle.
const getSupervisors = async (clientId: string): Promise<Supervisor[]> => {
  logger.info(`getSupervisors clientId=${clientId}`);

  const client = await getClientById(clientId);
  if (!client) throw new NotFoundError(`Client not found: ${clientId}`);

  const payrollConfig = await readPayrollConfig(client.payrollConfigFileId);
  return payrollConfig.supervisors;
};

export default getSupervisors;
