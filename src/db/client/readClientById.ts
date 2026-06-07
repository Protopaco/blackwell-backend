import readClients from '#db/client/readClients.js';
import Client from '#models/Client.js';

const readClientById = async (clientId: string): Promise<Client | null> => {
  const clients = await readClients();
  return clients.find((client) => client.clientId === clientId) ?? null;
};

export default readClientById;
