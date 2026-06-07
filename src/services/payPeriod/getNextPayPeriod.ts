import getPayPeriods from '#db/payPeriod/readPayPeriods.js';
import getSettings from '#db/settings/readSettings.js';
import PayPeriod from '#models/PayPeriod.js';
import { PayPeriodStatus } from '#models/PayPeriodStatus.js';
import { PayPeriodInterval } from '#models/PayPeriodInterval.js';

const INTERVAL_DAYS: Record<string, number> = {
  [PayPeriodInterval.Weekly]: 7,
  [PayPeriodInterval.BiWeekly]: 14,
};

const addDays = (dateStr: string, days: number): string => {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
};

const formatPayPeriodName = (startDate: string, endDate: string): string => {
  const start = startDate.split('-').slice(1).join('/');
  const end = endDate.split('-').slice(1).join('/');
  return `${start} - ${end}`;
};

const getNextPayPeriod = async (
  payrollConfigFileId: string,
  payPeriodRegistryFileId: string,
): Promise<PayPeriod> => {
  const [settings, payPeriods] = await Promise.all([
    getSettings(payrollConfigFileId),
    getPayPeriods(payPeriodRegistryFileId),
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
    status: PayPeriodStatus.Draft,
    startDate,
    endDate,
    createdDate: '',
  };
};

export default getNextPayPeriod;
