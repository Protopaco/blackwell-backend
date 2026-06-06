import getPayPeriods from './getPayPeriods.js';
import PayPeriod from '#models/PayPeriod.js';

const getPayPeriodById = async (payPeriodRegistryFileId: string, payPeriodId: string): Promise<PayPeriod | null> => {
  const payPeriods = await getPayPeriods(payPeriodRegistryFileId);
  return payPeriods.find((payPeriod) => payPeriod.payPeriodId === payPeriodId) ?? null;
};

export default getPayPeriodById;
