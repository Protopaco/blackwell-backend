import Client from '#models/Client.js';
import closePayPeriod from '#services/payPeriod/closePayPeriod.js';
import createProcessedPayPeriod from './createProcessedPayPeriod.js';

const createClosedPayPeriod = async (client: Client): Promise<void> => {
  const processedPayPeriod = await createProcessedPayPeriod(client);
  await closePayPeriod(client.clientId, processedPayPeriod.payPeriodId);
};

export default createClosedPayPeriod;
