import getPayPeriodById from '#services/payPeriod/getPayPeriodById.js';
import updatePayPeriod from '#services/payPeriod/updatePayPeriod.js';
import { PayPeriodStatus } from '#models/PayPeriodStatus.js';
import { logger } from '#utils/logger.js';

const closePayPeriod = async (clientId: string, payPeriodId: string): Promise<void> => {
  logger.info(`closePayPeriod clientId=${clientId} payPeriodId=${payPeriodId}`);

  const payPeriod = await getPayPeriodById(clientId, payPeriodId);
  if (!payPeriod) throw new Error(`Pay period not found: ${payPeriodId}`);

  if (payPeriod.status === PayPeriodStatus.Closed) {
    logger.info(`closePayPeriod: pay period ${payPeriodId} is already Closed — no-op`);
    return;
  }

  await updatePayPeriod(clientId, { ...payPeriod, status: PayPeriodStatus.Closed });
  logger.info(`closePayPeriod: pay period ${payPeriodId} status updated to Closed`);
};

export default closePayPeriod;
