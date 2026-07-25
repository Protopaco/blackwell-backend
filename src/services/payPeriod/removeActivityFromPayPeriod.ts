import getPayPeriodById from '#services/payPeriod/getPayPeriodById.js';
import assertPayPeriodNotLocked from '#services/payPeriod/assertPayPeriodNotLocked.js';
import readActivityById from '#db/activity/readActivityById.js';
import deleteActivityRow from '#db/activity/deleteActivityRow.js';
import payPeriodConfigSnapshotCache from '#utils/caches/payPeriodConfigSnapshotCache.js';
import Guid from '#models/Guid.js';
import { logger } from '#utils/logger.js';
import { NotFoundError } from '#utils/errors.js';

// Removes an activity from a pay period's snapshot (hard delete — Activity has no soft-delete status,
// unlike Employee). Blocked once the first timesheet has been generated for this pay period (status !==
// Pending), since generateTimesheets.ts bakes which activities exist into the timesheet's rows/columns.
const removeActivityFromPayPeriod = async (
  clientId: Guid,
  payPeriodId: Guid,
  activityId: Guid,
): Promise<void> => {
  logger.info(`removeActivityFromPayPeriod clientId=${clientId} payPeriodId=${payPeriodId} activityId=${activityId}`);

  const payPeriod = await getPayPeriodById(clientId, payPeriodId);

  assertPayPeriodNotLocked(payPeriod, 'remove an activity from this pay period');

  const snapshotActivity = await readActivityById(payPeriod.payrollReportFileId, activityId);
  if (!snapshotActivity) throw new NotFoundError(`Activity not found on this pay period: ${activityId}`);

  await deleteActivityRow(payPeriod.payrollReportFileId, activityId);

  payPeriodConfigSnapshotCache.delete(payPeriod.payrollReportFileId);
};

export default removeActivityFromPayPeriod;
