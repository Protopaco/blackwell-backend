import Client from '#models/Client.js';
import { UnprocessableError } from '#utils/errors.js';

// Throws UnprocessableError if any other client already has the given clientName. excludeClientId
// skips that client's own row, so updateClient can keep an unchanged name without tripping the check.
const validateClientNameIsUnique = (clients: Client[], clientName: string, excludeClientId?: string): void => {
  const existingClient = clients.find((client) => client.clientName === clientName && client.clientId !== excludeClientId);

  if (existingClient) {
    throw new UnprocessableError(`Client name already exists: ${clientName}`);
  }
};

export default validateClientNameIsUnique;
