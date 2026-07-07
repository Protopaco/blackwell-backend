import readTab from '#db/adapter/readTab.js';
import { CLIENTS_TAB } from '#config/constants.js';
import Client from '#models/Client.js';
import clientsCache from '#utils/caches/clientsCache.js';
import mapClient from '#db/client/mapClient.js';

// Reads all clients from the central client config sheet (CLIENT_CONFIG_FILE_ID env var), cached for 5 minutes.
const readClients = async (): Promise<Client[]> => {
  const clientConfigFileId = process.env.CLIENT_CONFIG_FILE_ID;
  if (!clientConfigFileId) throw new Error('CLIENT_CONFIG_FILE_ID is not set');

  const cached = clientsCache.get(clientConfigFileId);
  if (cached) return cached;

  const rows = await readTab(clientConfigFileId, CLIENTS_TAB);
  const clients = rows.map(mapClient);
  clientsCache.set(clientConfigFileId, clients);
  return clients;
};

export default readClients;
