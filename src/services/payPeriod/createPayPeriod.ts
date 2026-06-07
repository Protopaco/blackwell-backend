import savePayPeriod from '#db/payPeriod/appendPayPeriod.js';
import PayPeriod from '#models/PayPeriod.js';

const createPayPeriod = async (
  payPeriodRegistryFileId: string,
  payPeriod: PayPeriod,
): Promise<void> => {
  const newPayPeriod: PayPeriod = {
    ...payPeriod,
    payPeriodId: crypto.randomUUID(),
    createdDate: new Date().toISOString().split('T')[0],
  };

  await savePayPeriod(payPeriodRegistryFileId, newPayPeriod);
};

export default createPayPeriod;
