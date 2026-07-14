import appendFundingSource from '#db/fundingSource/appendFundingSource.js';
import getClientById from '#services/client/getClientById.js';
import payrollConfigCache from '#utils/caches/payrollConfigCache.js';
import FundingSource from '#models/FundingSource.js';
import { logger } from '#utils/logger.js';
import { NotFoundError } from '#utils/errors.js';

// Assigns a new UUID and appends a funding source to the client's PayrollConfig.
const createFundingSource = async (
  clientId: string,
  fundingSource: Omit<FundingSource, 'fundingSourceId'>,
): Promise<void> => {
  logger.info(`createFundingSource clientId=${clientId}`);

  const client = await getClientById(clientId);
  if (!client) throw new NotFoundError(`Client not found: ${clientId}`);

  const newFundingSource: FundingSource = {
    ...fundingSource,
    fundingSourceId: crypto.randomUUID(),
  };

  await appendFundingSource(client.payrollConfigFileId, newFundingSource);
  payrollConfigCache.delete(client.payrollConfigFileId);
};

export default createFundingSource;
