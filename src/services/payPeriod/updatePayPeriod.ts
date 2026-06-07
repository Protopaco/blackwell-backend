import updatePayPeriodDb from '#db/payPeriod/updatePayPeriod.js';
import PayPeriod from '#models/PayPeriod.js';

const updatePayPeriod = async (
  payPeriodRegistryFileId: string,
  updatedPayPeriod: PayPeriod,
): Promise<void> => {
  await updatePayPeriodDb(payPeriodRegistryFileId, updatedPayPeriod);
};

export default updatePayPeriod;
