import writeClients from '#db/client/writeClients.js';
import getClientById from '#services/client/getClientById.js';
import clientsCache from '#utils/caches/clientsCache.js';
import Client from '#models/Client.js';
import ClientUpdateRequest from '#models/ClientUpdateRequest.js';
import { logger } from '#utils/logger.js';
import { NotFoundError } from '#utils/errors.js';

// Updates only status/clientName/clientCode on an existing client — every other field (folder/file IDs)
// is set once at creation and never editable through this path.
const updateClient = async (clientId: string, update: ClientUpdateRequest): Promise<void> => {
  logger.info(`updateClient clientId=${clientId}`);

  const client = await getClientById(clientId);
  if (!client) throw new NotFoundError(`Client not found: ${clientId}`);

  const updatedClient: Client = {
    ...client,
    status: update.status ?? client.status,
    clientName: update.clientName ?? client.clientName,
    clientCode: update.clientCode ?? client.clientCode,
  };

  await writeClients(updatedClient);

  const clientConfigFileId = process.env.CLIENT_CONFIG_FILE_ID;
  if (clientConfigFileId) clientsCache.delete(clientConfigFileId);
};

export default updateClient;
