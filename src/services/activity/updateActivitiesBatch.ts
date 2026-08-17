import writeActivitiesBulk from '#db/activity/writeActivitiesBulk.js';
import readPayrollConfig from '#db/payrollConfig/readPayrollConfig.js';
import getClientById from '#services/client/getClientById.js';
import payrollConfigCache from '#utils/caches/payrollConfigCache.js';
import ActivityReorderUpdate from '#models/ActivityReorderUpdate.js';
import Guid from '#models/Guid.js';
import { logger } from '#utils/logger.js';
import { NotFoundError, UnprocessableError } from '#utils/errors.js';

// Overlays groupLabel/sortOrder onto multiple activities in one read-modify-write, instead of one
// readPayrollConfig/writeActivities round-trip per activity — used by a "Save All" reorder, which can
// touch every activity in a bucket at once. Rejects the whole batch (writes nothing) if any activityId
// doesn't match a known activity in the client's PayrollConfig.
const updateActivitiesBatch = async (clientId: Guid, updates: ActivityReorderUpdate[]): Promise<void> => {
  logger.info(`updateActivitiesBatch clientId=${clientId} count=${updates.length}`);

  const client = await getClientById(clientId);
  if (!client) throw new NotFoundError(`Client not found: ${clientId}`);

  const payrollConfig = await readPayrollConfig(client.payrollConfigFileId);
  const existingActivityIds = new Set(payrollConfig.activities.map((activity) => activity.activityId));

  const unknownActivityIds = updates
    .map((update) => update.activityId)
    .filter((activityId) => !existingActivityIds.has(activityId));
  if (unknownActivityIds.length > 0) {
    throw new UnprocessableError(
      `Unknown activityId(s) in activity batch: ${[...new Set(unknownActivityIds)].join(', ')}`,
    );
  }

  const updateByActivityId = new Map(updates.map((update) => [update.activityId, update]));
  const updatedActivities = payrollConfig.activities.map((activity) => {
    const update = updateByActivityId.get(activity.activityId);
    return update ? { ...activity, groupLabel: update.groupLabel, sortOrder: update.sortOrder } : activity;
  });

  await writeActivitiesBulk(client.payrollConfigFileId, updatedActivities);
  payrollConfigCache.delete(client.payrollConfigFileId);
  logger.info(`updateActivitiesBatch: complete for client ${clientId}`);
};

export default updateActivitiesBatch;
