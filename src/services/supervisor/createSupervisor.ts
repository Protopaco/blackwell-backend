import appendSupervisor from '#db/supervisor/appendSupervisor.js';
import getClientById from '#services/client/getClientById.js';
import payrollConfigCache from '#utils/caches/payrollConfigCache.js';
import Supervisor from '#models/Supervisor.js';
import { logger } from '#utils/logger.js';
import { NotFoundError } from '#utils/errors.js';

// Assigns a new UUID and appends a supervisor to the client's PayrollConfig.
const createSupervisor = async (
  clientId: string,
  supervisor: Omit<Supervisor, 'supervisorId'>,
): Promise<void> => {
  logger.info(`createSupervisor clientId=${clientId}`);

  const client = await getClientById(clientId);
  if (!client) throw new NotFoundError(`Client not found: ${clientId}`);

  const newSupervisor: Supervisor = {
    ...supervisor,
    supervisorId: crypto.randomUUID(),
  };

  await appendSupervisor(client.payrollConfigFileId, newSupervisor);
  payrollConfigCache.delete(client.payrollConfigFileId);
};

export default createSupervisor;
