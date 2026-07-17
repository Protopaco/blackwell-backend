import createPayPeriod from '#services/payPeriod/createPayPeriod.js';
import getNextPayPeriod from '#services/payPeriod/getNextPayPeriod.js';

const createPendingPayPeriod = async (clientId: string): Promise<void> => {
  const nextPayPeriod = await getNextPayPeriod(clientId);
  await createPayPeriod(clientId, nextPayPeriod);
};

export default createPendingPayPeriod;
