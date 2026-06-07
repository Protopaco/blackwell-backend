import readClientById from '#db/client/readClientById.js';
import Client from '#models/Client.js';

const getClientById = async (clientId: string): Promise<Client | null> => {
  return readClientById(clientId);
};

export default getClientById;
