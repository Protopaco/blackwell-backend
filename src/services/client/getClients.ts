import readClients from '#db/client/readClients.js';
import Client from '#models/Client.js';

const getClients = async (): Promise<Client[]> => {
  return readClients();
};

export default getClients;
