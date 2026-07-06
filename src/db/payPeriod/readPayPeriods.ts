import readTab from '#db/adapter/readTab.js';
import PayPeriod from '#models/PayPeriod.js';
import payPeriodsCache from '#utils/caches/payPeriodsCache.js';
import mapPayPeriod from '#db/payPeriod/mapPayPeriod.js';

// Reads all pay periods for the current calendar year from the pay period registry file, cached for 5 minutes.
const readPayPeriods = async (payPeriodRegistryFileId: string): Promise<PayPeriod[]> => {
  const cached = payPeriodsCache.get(payPeriodRegistryFileId);
  if (cached) return cached;

  const currentYear = String(new Date().getFullYear());
  const rows = await readTab(payPeriodRegistryFileId, currentYear);
  const payPeriods = rows.map(mapPayPeriod);
  payPeriodsCache.set(payPeriodRegistryFileId, payPeriods);
  return payPeriods;
};

export default readPayPeriods;
