import createPayPeriod from '#services/payPeriod/createPayPeriod.js';
import generateTimesheets from '#services/timesheet/generateTimesheets.js';
import getNextPayPeriod from '#services/payPeriod/getNextPayPeriod.js';
import getPayPeriods from '#services/payPeriod/getPayPeriods.js';

const createOpenPayPeriod = async (clientId: string): Promise<void> => {
  const nextPayPeriod = await getNextPayPeriod(clientId);
  await createPayPeriod(clientId, nextPayPeriod);

  const payPeriods = await getPayPeriods(clientId);
  const createdPayPeriod = payPeriods.find(
    (payPeriod) =>
      payPeriod.startDate === nextPayPeriod.startDate &&
      payPeriod.endDate === nextPayPeriod.endDate,
  );
  if (!createdPayPeriod) throw new Error('Early Client pay period was not created');

  await generateTimesheets(clientId, createdPayPeriod.payPeriodId);
};

export default createOpenPayPeriod;
