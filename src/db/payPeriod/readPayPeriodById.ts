import getPayPeriods from './readPayPeriods.js';
import PayPeriod from '#models/PayPeriod.js';

const readPayPeriodById = async (payPeriodRegistryFileId: string, payPeriodId: string): Promise<PayPeriod | null> => {
  const payPeriods = await getPayPeriods(payPeriodRegistryFileId);
  return payPeriods.find((payPeriod) => payPeriod.payPeriodId === payPeriodId) ?? null;
};

export default readPayPeriodById;
