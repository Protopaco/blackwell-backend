import Client from '#models/Client.js';
import { UnprocessableError } from '#utils/errors.js';

// Throws UnprocessableError if any other client already has the given clientCode. excludeClientId
// skips that client's own row, so updateClient can keep an unchanged code without tripping the check.
const validateClientCodeIsUnique = (clients: Client[], clientCode: string, excludeClientId?: string): void => {
  const existingClient = clients.find((client) => client.clientCode === clientCode && client.clientId !== excludeClientId);

  if (existingClient) {
    throw new UnprocessableError(`Client code already exists: ${clientCode}`);
  }
};

export default validateClientCodeIsUnique;
