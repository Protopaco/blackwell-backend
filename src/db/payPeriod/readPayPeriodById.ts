import getPayPeriods from './readPayPeriods.js';
import PayPeriod from '#models/PayPeriod.js';

// Reads all pay periods for the current year and returns the one matching the given ID, or null.
const readPayPeriodById = async (payPeriodRegistryFileId: string, payPeriodId: string): Promise<PayPeriod | null> => {
  const payPeriods = await getPayPeriods(payPeriodRegistryFileId);
  return payPeriods.find((payPeriod) => payPeriod.payPeriodId === payPeriodId) ?? null;
};

export default readPayPeriodById;
