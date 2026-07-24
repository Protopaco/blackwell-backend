import getClientAndPayPeriod from '#services/payPeriod/getClientAndPayPeriod.js';
import readFundingSourceById from '#db/fundingSource/readFundingSourceById.js';
import appendFundingSource from '#db/fundingSource/appendFundingSource.js';
import payPeriodConfigSnapshotCache from '#utils/caches/payPeriodConfigSnapshotCache.js';
import { PayPeriodStatus } from '#models/PayPeriodStatus.js';
import Guid from '#models/Guid.js';
import { logger } from '#utils/logger.js';
import { NotFoundError, UnprocessableError } from '#utils/errors.js';

// Copies a funding source's current PayrollConfig row into a pay period's report workbook snapshot.
// Presence is locked once the first timesheet has been generated for this pay period (status !==
// Pending) — same cutoff as Activity presence, so an Activity can never end up structurally referencing
// a funding source missing from the snapshot.
const addFundingSourceToPayPeriod = async (
  clientId: Guid,
  payPeriodId: Guid,
  fundingSourceId: Guid,
): Promise<void> => {
  logger.info(`addFundingSourceToPayPeriod clientId=${clientId} payPeriodId=${payPeriodId} fundingSourceId=${fundingSourceId}`);

  const { client, payPeriod } = await getClientAndPayPeriod(clientId, payPeriodId);

  if (payPeriod.status !== PayPeriodStatus.Pending) {
    throw new UnprocessableError(
      'Cannot add a funding source to this pay period — a timesheet has already been generated.',
    );
  }

  const sourceFundingSource = await readFundingSourceById(client.payrollConfigFileId, fundingSourceId);
  if (!sourceFundingSource) throw new NotFoundError(`Funding source not found: ${fundingSourceId}`);

  const existingSnapshotFundingSource = await readFundingSourceById(payPeriod.payrollReportFileId, fundingSourceId);
  if (existingSnapshotFundingSource) {
    throw new UnprocessableError(`Funding source is already on this pay period: ${fundingSourceId}`);
  }

  await appendFundingSource(payPeriod.payrollReportFileId, sourceFundingSource);

  payPeriodConfigSnapshotCache.delete(payPeriod.payrollReportFileId);
};

export default addFundingSourceToPayPeriod;
