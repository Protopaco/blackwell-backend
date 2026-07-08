import readClientById from '#db/client/readClientById.js';
import readPayPeriodById from '#db/payPeriod/readPayPeriodById.js';
import Client from '#models/Client.js';
import PayPeriod from '#models/PayPeriod.js';
import Guid from '#models/Guid.js';
import { NotFoundError } from '#utils/errors.js';

interface ClientAndPayPeriod {
  client: Client;
  payPeriod: PayPeriod;
}

// Resolves a client + pay period pair from their IDs in one call — the clientId -> client ->
// payPeriodRegistryFileId -> payPeriod chain. The single place this lookup lives; getPayPeriodById
// wraps this for callers that only need the payPeriod. Use this one directly when the caller also
// needs client fields (payrollConfigFileId, payrollReportFolderId, timesheetsFolderId, etc.).
const getClientAndPayPeriod = async (clientId: Guid, payPeriodId: Guid): Promise<ClientAndPayPeriod> => {
  const client = await readClientById(clientId);
  if (!client) throw new NotFoundError(`Client not found: ${clientId}`);

  const payPeriod = await readPayPeriodById(client.payPeriodRegistryFileId, payPeriodId);
  if (!payPeriod) throw new NotFoundError(`Pay period not found: ${payPeriodId}`);

  return { client, payPeriod };
};

export default getClientAndPayPeriod;
