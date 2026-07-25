import getPayPeriodById from '#services/payPeriod/getPayPeriodById.js';
import readPayPeriodConfigSnapshot from '#db/payrollReport/readPayPeriodConfigSnapshot.js';
import PayPeriodConfigSnapshot from '#models/PayPeriodConfigSnapshot.js';
import { logger } from '#utils/logger.js';

// Single batched read backing the pay period page's Employees/Activities/FundingSources/Holidays tabs —
// one API call instead of four. Mirrors getClientSummary.ts's aggregation pattern.
const getPayPeriodConfig = async (clientId: string, payPeriodId: string): Promise<PayPeriodConfigSnapshot> => {
  logger.info(`getPayPeriodConfig clientId=${clientId} payPeriodId=${payPeriodId}`);

  const payPeriod = await getPayPeriodById(clientId, payPeriodId);
  return readPayPeriodConfigSnapshot(payPeriod.payrollReportFileId);
};

export default getPayPeriodConfig;
