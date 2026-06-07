import writePayPeriod from '#db/payPeriod/writePayPeriod.js';
import getClientById from '#services/client/getClientById.js';
import PayPeriod from '#models/PayPeriod.js';
import { logger } from '#utils/logger.js';

const updatePayPeriod = async (clientId: string, updatedPayPeriod: PayPeriod): Promise<void> => {
  logger.info(`updatePayPeriod clientId=${clientId} payPeriodId=${updatedPayPeriod.payPeriodId}`);

  const client = await getClientById(clientId);
  if (!client) throw new Error(`Client not found: ${clientId}`);

  await writePayPeriod(client.payPeriodRegistryFileId, updatedPayPeriod);
};

export default updatePayPeriod;
