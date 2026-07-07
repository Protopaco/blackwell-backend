import readPayPeriodById from '#db/payPeriod/readPayPeriodById.js';
import getClientById from '#services/client/getClientById.js';
import PayPeriod from '#models/PayPeriod.js';
import { logger } from '#utils/logger.js';
import { NotFoundError } from '#utils/errors.js';

const getPayPeriodById = async (clientId: string, payPeriodId: string): Promise<PayPeriod> => {
  logger.info(`getPayPeriodById clientId=${clientId} payPeriodId=${payPeriodId}`);

  const client = await getClientById(clientId);
  if (!client) throw new NotFoundError(`Client not found: ${clientId}`);

  const payPeriod = await readPayPeriodById(client.payPeriodRegistryFileId, payPeriodId);
  if (!payPeriod) throw new NotFoundError(`Pay period not found: ${payPeriodId}`);

  return payPeriod;
};

export default getPayPeriodById;
