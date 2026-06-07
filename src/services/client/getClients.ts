import getClientsDb from '#db/client/getClients.js';
import Client from '#models/Client.js';

const getClients = async (): Promise<Client[]> => {
  const clientConfigFileId = process.env.CLIENT_CONFIG_FILE_ID;
  if (!clientConfigFileId) throw new Error('CLIENT_CONFIG_FILE_ID is not set');

  return getClientsDb(clientConfigFileId);
};

export default getClients;
