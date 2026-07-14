import deleteFundingSourceRow from '#db/fundingSource/deleteFundingSourceRow.js';
import readPayrollConfig from '#db/payrollConfig/readPayrollConfig.js';
import getClientById from '#services/client/getClientById.js';
import payrollConfigCache from '#utils/caches/payrollConfigCache.js';
import { logger } from '#utils/logger.js';
import { NotFoundError, UnprocessableError } from '#utils/errors.js';

// Deletes a funding source from the client's PayrollConfig — rejected if any activity still references it.
const deleteFundingSource = async (clientId: string, fundingSourceId: string): Promise<void> => {
  logger.info(`deleteFundingSource clientId=${clientId} fundingSourceId=${fundingSourceId}`);

  const client = await getClientById(clientId);
  if (!client) throw new NotFoundError(`Client not found: ${clientId}`);

  const payrollConfig = await readPayrollConfig(client.payrollConfigFileId);
  const fundingSource = payrollConfig.fundingSources.find(
    (candidate) => candidate.fundingSourceId === fundingSourceId,
  );
  if (!fundingSource) throw new NotFoundError(`Funding source not found: ${fundingSourceId}`);

  const isReferenced = payrollConfig.activities.some((activity) =>
    activity.fundingSources.some(
      (activityFundingSource) => activityFundingSource.fundingSourceName === fundingSource.fundingSourceName,
    ),
  );
  if (isReferenced) {
    throw new UnprocessableError(
      `Funding source "${fundingSource.fundingSourceName}" is still referenced by one or more activities and cannot be deleted`,
    );
  }

  await deleteFundingSourceRow(client.payrollConfigFileId, fundingSourceId);
  payrollConfigCache.delete(client.payrollConfigFileId);
};

export default deleteFundingSource;
