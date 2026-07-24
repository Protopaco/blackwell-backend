import getPayPeriodById from '#services/payPeriod/getPayPeriodById.js';
import assertPayPeriodNotLocked from '#services/payPeriod/assertPayPeriodNotLocked.js';
import readFundingSourceById from '#db/fundingSource/readFundingSourceById.js';
import deleteFundingSourceRow from '#db/fundingSource/deleteFundingSourceRow.js';
import readActivities from '#db/activity/readActivities.js';
import payPeriodConfigSnapshotCache from '#utils/caches/payPeriodConfigSnapshotCache.js';
import Guid from '#models/Guid.js';
import { logger } from '#utils/logger.js';
import { NotFoundError, UnprocessableError } from '#utils/errors.js';

// Removes a funding source from a pay period's snapshot (hard delete). Blocked once the first timesheet
// has been generated for this pay period (status !== Pending), same cutoff as Activity presence. Also
// blocked while any snapshot Activity still references this funding source — removing it out from under
// a referencing Activity would leave a dangling reference.
const removeFundingSourceFromPayPeriod = async (
  clientId: Guid,
  payPeriodId: Guid,
  fundingSourceId: Guid,
): Promise<void> => {
  logger.info(`removeFundingSourceFromPayPeriod clientId=${clientId} payPeriodId=${payPeriodId} fundingSourceId=${fundingSourceId}`);

  const payPeriod = await getPayPeriodById(clientId, payPeriodId);

  assertPayPeriodNotLocked(payPeriod, 'remove a funding source from this pay period');

  const snapshotFundingSource = await readFundingSourceById(payPeriod.payrollReportFileId, fundingSourceId);
  if (!snapshotFundingSource) {
    throw new NotFoundError(`Funding source not found on this pay period: ${fundingSourceId}`);
  }

  const snapshotActivities = await readActivities(payPeriod.payrollReportFileId);
  const referencingActivities = snapshotActivities.filter((activity) =>
    activity.fundingSources.some((fs) => fs.fundingSourceName === snapshotFundingSource.fundingSourceName),
  );
  if (referencingActivities.length > 0) {
    const names = referencingActivities.map((activity) => activity.activityName);
    throw new UnprocessableError(
      `Cannot remove funding source "${snapshotFundingSource.fundingSourceName}" — still referenced by activities on this pay period: ${names.join(', ')}`,
    );
  }

  await deleteFundingSourceRow(payPeriod.payrollReportFileId, fundingSourceId);

  payPeriodConfigSnapshotCache.delete(payPeriod.payrollReportFileId);
};

export default removeFundingSourceFromPayPeriod;
