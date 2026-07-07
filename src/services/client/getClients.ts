import readClients from '#db/client/readClients.js';
import Client from '#models/Client.js';
import { logger } from '#utils/logger.js';

// Returns all clients from the cached client list — used by the GET /clients route.
const getClients = async (): Promise<Client[]> => {
  logger.info('getClients');
  return readClients();
};

export default getClients;
