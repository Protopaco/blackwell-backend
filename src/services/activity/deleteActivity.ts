import deleteActivityRow from '#db/activity/deleteActivityRow.js';
import getClientById from '#services/client/getClientById.js';
import payrollConfigCache from '#utils/caches/payrollConfigCache.js';
import { logger } from '#utils/logger.js';
import { NotFoundError } from '#utils/errors.js';

// Deletes an activity from the client's PayrollConfig.
const deleteActivity = async (clientId: string, activityId: string): Promise<void> => {
  logger.info(`deleteActivity clientId=${clientId} activityId=${activityId}`);

  const client = await getClientById(clientId);
  if (!client) throw new NotFoundError(`Client not found: ${clientId}`);

  await deleteActivityRow(client.payrollConfigFileId, activityId);
  payrollConfigCache.delete(client.payrollConfigFileId);
};

export default deleteActivity;
