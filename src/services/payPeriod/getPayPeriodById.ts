import readPayPeriodById from '#db/payPeriod/readPayPeriodById.js';
import getClientById from '#services/client/getClientById.js';
import PayPeriod from '#models/PayPeriod.js';
import { logger } from '#utils/logger.js';

const getPayPeriodById = async (clientId: string, payPeriodId: string): Promise<PayPeriod | null> => {
  logger.info(`getPayPeriodById clientId=${clientId} payPeriodId=${payPeriodId}`);
  const client = await getClientById(clientId);
  if (!client) return null;

  return readPayPeriodById(client.payPeriodRegistryFileId, payPeriodId);
};

export default getPayPeriodById;
