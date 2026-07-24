import getPayPeriodById from '#services/payPeriod/getPayPeriodById.js';
import readActivityById from '#db/activity/readActivityById.js';
import writeActivities from '#db/activity/writeActivities.js';
import readFundingSources from '#db/fundingSource/readFundingSources.js';
import validateActivityFundingSources from '#services/activity/validateActivityFundingSources.js';
import applyFundingSourceRemainder from '#services/activity/applyFundingSourceRemainder.js';
import payPeriodConfigSnapshotCache from '#utils/caches/payPeriodConfigSnapshotCache.js';
import { PayPeriodStatus } from '#models/PayPeriodStatus.js';
import Activity from '#models/Activity.js';
import Guid from '#models/Guid.js';
import { logger } from '#utils/logger.js';
import { NotFoundError, UnprocessableError } from '#utils/errors.js';

// Two independent locks on a snapshot Activity:
// - Structural fields (activityName, trackSeparately, payrollCategory, payRate, flatRateAmount) are baked
//   into timesheet rows/columns at generation time, so they lock the same moment presence does (status
//   !== Pending).
// - fundingSources percentages only affect payroll/allocation report math, recomputed fresh on every
//   report generation, so they stay editable through Processed and lock once the allocation report has
//   been generated (status === Allocated or Closed).
const updateActivityOnPayPeriod = async (
  clientId: Guid,
  payPeriodId: Guid,
  updatedActivity: Activity,
): Promise<void> => {
  logger.info(`updateActivityOnPayPeriod clientId=${clientId} payPeriodId=${payPeriodId} activityId=${updatedActivity.activityId}`);

  if (updatedActivity.fundingSources.length > 3) {
    throw new UnprocessableError('An activity cannot have more than 3 funding sources');
  }

  const payPeriod = await getPayPeriodById(clientId, payPeriodId);

  const existingActivity = await readActivityById(payPeriod.payrollReportFileId, updatedActivity.activityId);
  if (!existingActivity) throw new NotFoundError(`Activity not found on this pay period: ${updatedActivity.activityId}`);

  const structuralFieldsChanged =
    existingActivity.activityName !== updatedActivity.activityName ||
    existingActivity.trackSeparately !== updatedActivity.trackSeparately ||
    existingActivity.payrollCategory !== updatedActivity.payrollCategory ||
    existingActivity.payRate !== updatedActivity.payRate ||
    existingActivity.flatRateAmount !== updatedActivity.flatRateAmount;

  if (structuralFieldsChanged && payPeriod.status !== PayPeriodStatus.Pending) {
    throw new UnprocessableError(
      'Cannot change activity name, category, pay rate, or tracking on this pay period — a timesheet has already been generated.',
    );
  }

  const fundingSourcesChanged =
    JSON.stringify(existingActivity.fundingSources) !== JSON.stringify(updatedActivity.fundingSources);

  if (
    fundingSourcesChanged &&
    (payPeriod.status === PayPeriodStatus.Allocated || payPeriod.status === PayPeriodStatus.Closed)
  ) {
    throw new UnprocessableError(
      'Cannot change funding source allocations on this pay period — the allocation report has already been generated.',
    );
  }

  const snapshotFundingSources = await readFundingSources(payPeriod.payrollReportFileId);
  validateActivityFundingSources(updatedActivity.fundingSources, snapshotFundingSources);

  const activityWithRemainder: Activity = {
    ...updatedActivity,
    fundingSources: applyFundingSourceRemainder(updatedActivity.fundingSources),
  };

  await writeActivities(payPeriod.payrollReportFileId, activityWithRemainder);

  payPeriodConfigSnapshotCache.delete(payPeriod.payrollReportFileId);
};

export default updateActivityOnPayPeriod;
