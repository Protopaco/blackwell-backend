import appendActivity from '#db/activity/appendActivity.js';
import getClientById from '#services/client/getClientById.js';
import applyFundingSourceRemainder from '#services/activity/applyFundingSourceRemainder.js';
import payrollConfigCache from '#utils/caches/payrollConfigCache.js';
import Activity from '#models/Activity.js';
import { logger } from '#utils/logger.js';
import { NotFoundError, UnprocessableError } from '#utils/errors.js';

// Assigns a new UUID and appends an activity to the client's PayrollConfig.
const createActivity = async (
  clientId: string,
  activity: Omit<Activity, 'activityId'>,
): Promise<void> => {
  logger.info(`createActivity clientId=${clientId}`);

  if (activity.fundingSources.length > 3) {
    throw new UnprocessableError('An activity cannot have more than 3 funding sources');
  }

  const client = await getClientById(clientId);
  if (!client) throw new NotFoundError(`Client not found: ${clientId}`);

  const newActivity: Activity = {
    ...activity,
    activityId: crypto.randomUUID(),
    fundingSources: applyFundingSourceRemainder(activity.fundingSources),
  };

  await appendActivity(client.payrollConfigFileId, newActivity);
  payrollConfigCache.delete(client.payrollConfigFileId);
};

export default createActivity;
