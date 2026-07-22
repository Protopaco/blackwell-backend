import appendPayPeriod from '#db/payPeriod/appendPayPeriod.js';
import getClientById from '#services/client/getClientById.js';
import getNextPayPeriod from '#services/payPeriod/getNextPayPeriod.js';
import PayPeriod from '#models/PayPeriod.js';
import { logger } from '#utils/logger.js';
import { NotFoundError } from '#utils/errors.js';

// Computes the next pay period from the client's interval/history, assigns it a new UUID and creation date, and appends it to the client's pay period registry.
const createPayPeriod = async (clientId: string): Promise<void> => {
  logger.info(`createPayPeriod clientId=${clientId}`);

  const client = await getClientById(clientId);
  if (!client) throw new NotFoundError(`Client not found: ${clientId}`);

  const payPeriod = await getNextPayPeriod(clientId);

  const newPayPeriod: PayPeriod = {
    ...payPeriod,
    payPeriodId: crypto.randomUUID(),
    createdDate: new Date().toISOString().split('T')[0],
  };

  await appendPayPeriod(client.payPeriodRegistryFileId, newPayPeriod);
};

export default createPayPeriod;
