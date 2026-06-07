import readClientById from '#db/client/readClientById.js';
import Client from '#models/Client.js';
import { logger } from '#utils/logger.js';

const getClientById = async (clientId: string): Promise<Client | null> => {
  logger.info(`getClientById clientId=${clientId}`);
  return readClientById(clientId);
};

export default getClientById;
