import createPayPeriod from '#services/payPeriod/createPayPeriod.js';

const createPendingPayPeriod = async (clientId: string): Promise<void> => {
  await createPayPeriod(clientId);
};

export default createPendingPayPeriod;
