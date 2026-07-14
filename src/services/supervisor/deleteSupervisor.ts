import deleteSupervisorRow from '#db/supervisor/deleteSupervisorRow.js';
import getClientById from '#services/client/getClientById.js';
import payrollConfigCache from '#utils/caches/payrollConfigCache.js';
import { logger } from '#utils/logger.js';
import { NotFoundError } from '#utils/errors.js';

// Deletes a supervisor from the client's PayrollConfig.
const deleteSupervisor = async (clientId: string, supervisorId: string): Promise<void> => {
  logger.info(`deleteSupervisor clientId=${clientId} supervisorId=${supervisorId}`);

  const client = await getClientById(clientId);
  if (!client) throw new NotFoundError(`Client not found: ${clientId}`);

  await deleteSupervisorRow(client.payrollConfigFileId, supervisorId);
  payrollConfigCache.delete(client.payrollConfigFileId);
};

export default deleteSupervisor;
