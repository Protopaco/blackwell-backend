import getClients from './getClients.js';
import Client from '#models/Client.js';

const getClientById = async (clientConfigFileId: string, clientId: string): Promise<Client | null> => {
  const clients = await getClients(clientConfigFileId);
  return clients.find((client) => client.clientId === clientId) ?? null;
};

export default getClientById;
