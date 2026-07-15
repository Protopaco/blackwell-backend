import readPayPeriods from '#db/payPeriod/readPayPeriods.js';
import getClientById from '#services/client/getClientById.js';
import PayPeriod from '#models/PayPeriod.js';
import { logger } from '#utils/logger.js';
import { NotFoundError } from '#utils/errors.js';

// Resolves the client's pay period registry file and returns all pay periods for the current year.
const getPayPeriods = async (clientId: string): Promise<PayPeriod[]> => {
  logger.info(`getPayPeriods clientId=${clientId}`);
  const client = await getClientById(clientId);
  if (!client) throw new NotFoundError(`Client not found: ${clientId}`);

  return readPayPeriods(client.payPeriodRegistryFileId);
};

export default getPayPeriods;
