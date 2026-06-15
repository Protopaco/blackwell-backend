import readPayPeriods from '#db/payPeriod/readPayPeriods.js';
import getClientById from '#services/client/getClientById.js';
import PayPeriod from '#models/PayPeriod.js';
import { logger } from '#utils/logger.js';

// Resolves the client's pay period registry file and returns all pay periods for the current year.
const getPayPeriods = async (clientId: string): Promise<PayPeriod[]> => {
  logger.info(`getPayPeriods clientId=${clientId}`);
  const client = await getClientById(clientId);
  if (!client) return [];

  return readPayPeriods(client.payPeriodRegistryFileId);
};

export default getPayPeriods;
