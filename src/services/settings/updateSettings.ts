import writeSettings from '#db/settings/writeSettings.js';
import getClientById from '#services/client/getClientById.js';
import payrollConfigCache from '#utils/caches/payrollConfigCache.js';
import Settings from '#models/Settings.js';
import { logger } from '#utils/logger.js';
import { NotFoundError } from '#utils/errors.js';

// Overwrites the client's Settings record in PayrollConfig.
const updateSettings = async (clientId: string, settings: Settings): Promise<void> => {
  logger.info(`updateSettings clientId=${clientId}`);

  const client = await getClientById(clientId);
  if (!client) throw new NotFoundError(`Client not found: ${clientId}`);

  await writeSettings(client.payrollConfigFileId, settings);
  payrollConfigCache.delete(client.payrollConfigFileId);
};

export default updateSettings;
