import getPayPeriods from '#services/payPeriod/getPayPeriods.js';
import getClientById from '#services/client/getClientById.js';
import readSettings from '#db/settings/readSettings.js';
import PayPeriod from '#models/PayPeriod.js';
import { PayPeriodStatus } from '#models/PayPeriodStatus.js';
import { PayPeriodInterval } from '#models/PayPeriodInterval.js';
import { logger } from '#utils/logger.js';

const INTERVAL_DAYS: Record<string, number> = {
  [PayPeriodInterval.Weekly]: 7,
  [PayPeriodInterval.BiWeekly]: 14,
};

// Returns a new date string offset by the given number of days — used to compute pay period start/end dates.
const addDays = (dateStr: string, days: number): string => {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
};

// Formats a pay period name from two ISO date strings as "MM/DD - MM/DD".
const formatPayPeriodName = (startDate: string, endDate: string): string => {
  const start = startDate.split('-').slice(1).join('/');
  const end = endDate.split('-').slice(1).join('/');
  return `${start} - ${end}`;
};

// Computes the next unsaved pay period based on the client's interval setting and the most recent existing pay period end date.
// Used by the GET /payPeriod/next route to pre-populate the create form.
const getNextPayPeriod = async (clientId: string): Promise<PayPeriod | null> => {
  logger.info(`getNextPayPeriod clientId=${clientId}`);

  const client = await getClientById(clientId);
  if (!client) return null;

  const [settings, payPeriods] = await Promise.all([
    readSettings(client.payrollConfigFileId),
    getPayPeriods(clientId),
  ]);

  const intervalDays = INTERVAL_DAYS[settings.payPeriodInterval];
  if (!intervalDays) throw new Error(`Unsupported pay period interval: ${settings.payPeriodInterval}`);

  let startDate: string;
  let endDate: string;

  if (payPeriods.length === 0) {
    startDate = settings.payPeriodStartDate;
    endDate = addDays(startDate, intervalDays - 1);
  } else {
    const latest = payPeriods.reduce((latestSoFar, current) =>
      current.endDate > latestSoFar.endDate ? current : latestSoFar,
    );
    startDate = addDays(latest.endDate, 1);
    endDate = addDays(startDate, intervalDays - 1);
  }

  return {
    payPeriodId: '',
    payPeriodName: formatPayPeriodName(startDate, endDate),
    status: PayPeriodStatus.Pending,
    startDate,
    endDate,
    createdDate: '',
    payrollReportFileId: '',
  };
};

export default getNextPayPeriod;
