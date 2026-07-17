import Client from '#models/Client.js';
import PayPeriod from '#models/PayPeriod.js';
import generatePayrollReport from '#services/payrollReport/generatePayrollReport.js';
import createOpenPayPeriod from './createOpenPayPeriod.js';
import fillLateClientTimesheets from './fillLateClientTimesheets.js';

const createProcessedPayPeriod = async (client: Client): Promise<PayPeriod> => {
  const payPeriod = await createOpenPayPeriod(client.clientId);
  await fillLateClientTimesheets(client, payPeriod);
  await generatePayrollReport(client.clientId, payPeriod.payPeriodId);
  return payPeriod;
};

export default createProcessedPayPeriod;
