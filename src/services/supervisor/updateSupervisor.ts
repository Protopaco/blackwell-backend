import writeSupervisors from '#db/supervisor/writeSupervisors.js';
import getClientById from '#services/client/getClientById.js';
import payrollConfigCache from '#utils/caches/payrollConfigCache.js';
import Supervisor from '#models/Supervisor.js';
import { logger } from '#utils/logger.js';
import { NotFoundError } from '#utils/errors.js';

// Overwrites a supervisor record in the client's PayrollConfig.
const updateSupervisor = async (clientId: string, updatedSupervisor: Supervisor): Promise<void> => {
  logger.info(`updateSupervisor clientId=${clientId} supervisorId=${updatedSupervisor.supervisorId}`);

  const client = await getClientById(clientId);
  if (!client) throw new NotFoundError(`Client not found: ${clientId}`);

  await writeSupervisors(client.payrollConfigFileId, updatedSupervisor);
  payrollConfigCache.delete(client.payrollConfigFileId);
};

export default updateSupervisor;
