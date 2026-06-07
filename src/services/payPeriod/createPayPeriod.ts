import appendPayPeriod from '#db/payPeriod/appendPayPeriod.js';
import PayPeriod from '#models/PayPeriod.js';
import { logger } from '#utils/logger.js';

const createPayPeriod = async (
  payPeriodRegistryFileId: string,
  payPeriod: PayPeriod,
): Promise<void> => {
  logger.info(`createPayPeriod payPeriodRegistryFileId=${payPeriodRegistryFileId}`);

  const newPayPeriod: PayPeriod = {
    ...payPeriod,
    payPeriodId: crypto.randomUUID(),
    createdDate: new Date().toISOString().split('T')[0],
  };

  await appendPayPeriod(payPeriodRegistryFileId, newPayPeriod);
};

export default createPayPeriod;
