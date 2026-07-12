import writeFundingSources from '#db/fundingSource/writeFundingSources.js';
import getClientById from '#services/client/getClientById.js';
import payrollConfigCache from '#utils/caches/payrollConfigCache.js';
import FundingSource from '#models/FundingSource.js';
import { logger } from '#utils/logger.js';
import { NotFoundError } from '#utils/errors.js';

// Overwrites a funding source record in the client's PayrollConfig.
const updateFundingSource = async (
  clientId: string,
  updatedFundingSource: FundingSource,
): Promise<void> => {
  logger.info(
    `updateFundingSource clientId=${clientId} fundingSourceId=${updatedFundingSource.fundingSourceId}`,
  );

  const client = await getClientById(clientId);
  if (!client) throw new NotFoundError(`Client not found: ${clientId}`);

  await writeFundingSources(client.payrollConfigFileId, updatedFundingSource);
  payrollConfigCache.delete(client.payrollConfigFileId);
};

export default updateFundingSource;
