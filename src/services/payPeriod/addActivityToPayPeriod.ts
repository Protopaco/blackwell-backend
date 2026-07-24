import getClientAndPayPeriod from '#services/payPeriod/getClientAndPayPeriod.js';
import assertPayPeriodNotLocked from '#services/payPeriod/assertPayPeriodNotLocked.js';
import readActivityById from '#db/activity/readActivityById.js';
import appendActivity from '#db/activity/appendActivity.js';
import readFundingSources from '#db/fundingSource/readFundingSources.js';
import validateActivityFundingSources from '#services/activity/validateActivityFundingSources.js';
import payPeriodConfigSnapshotCache from '#utils/caches/payPeriodConfigSnapshotCache.js';
import Guid from '#models/Guid.js';
import { logger } from '#utils/logger.js';
import { NotFoundError, UnprocessableError } from '#utils/errors.js';

// Copies an activity's current PayrollConfig row into a pay period's report workbook snapshot. Presence
// is locked once the first timesheet has been generated for this pay period (status !== Pending), since
// generateTimesheets.ts bakes which activities exist into the timesheet's rows/columns. Activities have
// no soft-delete status (unlike Employee), so this always appends a fresh row.
const addActivityToPayPeriod = async (
  clientId: Guid,
  payPeriodId: Guid,
  activityId: Guid,
): Promise<void> => {
  logger.info(`addActivityToPayPeriod clientId=${clientId} payPeriodId=${payPeriodId} activityId=${activityId}`);

  const { client, payPeriod } = await getClientAndPayPeriod(clientId, payPeriodId);

  assertPayPeriodNotLocked(payPeriod, 'add an activity to this pay period');

  const sourceActivity = await readActivityById(client.payrollConfigFileId, activityId);
  if (!sourceActivity) throw new NotFoundError(`Activity not found: ${activityId}`);

  const existingSnapshotActivity = await readActivityById(payPeriod.payrollReportFileId, activityId);
  if (existingSnapshotActivity) {
    throw new UnprocessableError(`Activity is already on this pay period: ${activityId}`);
  }

  const snapshotFundingSources = await readFundingSources(payPeriod.payrollReportFileId);
  validateActivityFundingSources(sourceActivity.fundingSources, snapshotFundingSources);

  await appendActivity(payPeriod.payrollReportFileId, sourceActivity);

  payPeriodConfigSnapshotCache.delete(payPeriod.payrollReportFileId);
};

export default addActivityToPayPeriod;
