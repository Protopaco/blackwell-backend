import getPayPeriodById from '#services/payPeriod/getPayPeriodById.js';
import updatePayPeriod from '#services/payPeriod/updatePayPeriod.js';
import { PayPeriodStatus } from '#models/PayPeriodStatus.js';
import { logger } from '#utils/logger.js';
import { UnprocessableError } from '#utils/errors.js';

const closePayPeriod = async (clientId: string, payPeriodId: string): Promise<void> => {
  logger.info(`closePayPeriod clientId=${clientId} payPeriodId=${payPeriodId}`);

  const payPeriod = await getPayPeriodById(clientId, payPeriodId);

  if (payPeriod.status === PayPeriodStatus.Closed) {
    logger.info(`closePayPeriod: pay period ${payPeriodId} is already Closed — no-op`);
    return;
  }

  if (payPeriod.status !== PayPeriodStatus.Allocated) {
    throw new UnprocessableError(
      `Cannot close pay period ${payPeriodId} with status ${payPeriod.status}. Must be Allocated.`,
    );
  }

  await updatePayPeriod(clientId, { ...payPeriod, status: PayPeriodStatus.Closed });
  logger.info(`closePayPeriod: pay period ${payPeriodId} status updated to Closed`);
};

export default closePayPeriod;
