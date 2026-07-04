import writePayPeriod from '#db/payPeriod/writePayPeriod.js';
import getClientById from '#services/client/getClientById.js';
import PayPeriod from '#models/PayPeriod.js';
import { logger } from '#utils/logger.js';
import { NotFoundError } from '#utils/errors.js';

// Overwrites a pay period record in the registry — used when changing a pay period's status (e.g., Draft → Active).
const updatePayPeriod = async (clientId: string, updatedPayPeriod: PayPeriod): Promise<void> => {
  logger.info(`updatePayPeriod clientId=${clientId} payPeriodId=${updatedPayPeriod.payPeriodId}`);

  const client = await getClientById(clientId);
  if (!client) throw new NotFoundError(`Client not found: ${clientId}`);

  await writePayPeriod(client.payPeriodRegistryFileId, updatedPayPeriod);
};

export default updatePayPeriod;
