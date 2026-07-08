import getClientAndPayPeriod from './getClientAndPayPeriod.js';
import PayPeriod from '#models/PayPeriod.js';
import { logger } from '#utils/logger.js';

const getPayPeriodById = async (clientId: string, payPeriodId: string): Promise<PayPeriod> => {
  logger.info(`getPayPeriodById clientId=${clientId} payPeriodId=${payPeriodId}`);

  const { payPeriod } = await getClientAndPayPeriod(clientId, payPeriodId);
  return payPeriod;
};

export default getPayPeriodById;
