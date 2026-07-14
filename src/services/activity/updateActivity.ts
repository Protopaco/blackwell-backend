import writeActivities from '#db/activity/writeActivities.js';
import getClientById from '#services/client/getClientById.js';
import applyFundingSourceRemainder from '#services/activity/applyFundingSourceRemainder.js';
import payrollConfigCache from '#utils/caches/payrollConfigCache.js';
import Activity from '#models/Activity.js';
import { logger } from '#utils/logger.js';
import { NotFoundError, UnprocessableError } from '#utils/errors.js';

// Overwrites an activity record in the client's PayrollConfig.
const updateActivity = async (clientId: string, updatedActivity: Activity): Promise<void> => {
  logger.info(`updateActivity clientId=${clientId} activityId=${updatedActivity.activityId}`);

  if (updatedActivity.fundingSources.length > 3) {
    throw new UnprocessableError('An activity cannot have more than 3 funding sources');
  }

  const client = await getClientById(clientId);
  if (!client) throw new NotFoundError(`Client not found: ${clientId}`);

  const activityWithRemainder: Activity = {
    ...updatedActivity,
    fundingSources: applyFundingSourceRemainder(updatedActivity.fundingSources),
  };

  await writeActivities(client.payrollConfigFileId, activityWithRemainder);
  payrollConfigCache.delete(client.payrollConfigFileId);
};

export default updateActivity;
