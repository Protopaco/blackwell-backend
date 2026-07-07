import readClients from '#db/client/readClients.js';
import Client from '#models/Client.js';

// Looks up a single client by ID from the cached client list — returns null if not found.
const readClientById = async (clientId: string): Promise<Client | null> => {
  const clients = await readClients();
  return clients.find((client) => client.clientId === clientId) ?? null;
};

export default readClientById;
