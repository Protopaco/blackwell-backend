import readPayPeriods from '#db/payPeriod/readPayPeriods.js';
import PayPeriod from '#models/PayPeriod.js';
import Client from '#models/Client.js';

const getInternalPayPeriodById = async (
  client: Client,
  payPeriodId: string,
): Promise<PayPeriod | undefined> => {
  const payPeriods = await readPayPeriods(client.payPeriodRegistryFileId);
  return payPeriods.find((payPeriod) => payPeriod.payPeriodId === payPeriodId);
};

export default getInternalPayPeriodById;
