import Client from '#models/Client.js';
import { UnprocessableError } from '#utils/errors.js';

const validateClientCodeIsUnique = (clients: Client[], clientCode: string): void => {
  const existingClient = clients.find((client) => client.clientCode === clientCode);

  if (existingClient) {
    throw new UnprocessableError(`Client code already exists: ${clientCode}`);
  }
};

export default validateClientCodeIsUnique;
