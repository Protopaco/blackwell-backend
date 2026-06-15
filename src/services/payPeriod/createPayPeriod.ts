import appendPayPeriod from '#db/payPeriod/appendPayPeriod.js';
import getClientById from '#services/client/getClientById.js';
import PayPeriod from '#models/PayPeriod.js';
import { logger } from '#utils/logger.js';

// Assigns a new UUID and creation date to a pay period and appends it to the client's pay period registry.
const createPayPeriod = async (clientId: string, payPeriod: PayPeriod): Promise<void> => {
  logger.info(`createPayPeriod clientId=${clientId}`);

  const client = await getClientById(clientId);
  if (!client) throw new Error(`Client not found: ${clientId}`);

  const newPayPeriod: PayPeriod = {
    ...payPeriod,
    payPeriodId: crypto.randomUUID(),
    createdDate: new Date().toISOString().split('T')[0],
  };

  await appendPayPeriod(client.payPeriodRegistryFileId, newPayPeriod);
};

export default createPayPeriod;
