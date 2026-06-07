import readClients from '#db/client/readClients.js';
import Client from '#models/Client.js';
import { logger } from '#utils/logger.js';

const getClients = async (): Promise<Client[]> => {
  logger.info('getClients');
  return readClients();
};

export default getClients;
