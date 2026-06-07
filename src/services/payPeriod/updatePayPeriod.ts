import writePayPeriod from '#db/payPeriod/writePayPeriod.js';
import PayPeriod from '#models/PayPeriod.js';
import { logger } from '#utils/logger.js';

const updatePayPeriod = async (
  payPeriodRegistryFileId: string,
  updatedPayPeriod: PayPeriod,
): Promise<void> => {
  logger.info(`updatePayPeriod payPeriodId=${updatedPayPeriod.payPeriodId}`);
  await writePayPeriod(payPeriodRegistryFileId, updatedPayPeriod);
};

export default updatePayPeriod;
