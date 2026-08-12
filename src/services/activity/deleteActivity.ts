import deleteActivityRow from '#db/activity/deleteActivityRow.js';
import readEmployeeActivityRates from '#db/employeeActivityRate/readEmployeeActivityRates.js';
import clearTabContent from '#db/adapter/clearTabContent.js';
import writeEmployeeActivityRatesBulk from '#db/employeeActivityRate/writeEmployeeActivityRatesBulk.js';
import getClientById from '#services/client/getClientById.js';
import payrollConfigCache from '#utils/caches/payrollConfigCache.js';
import { EMPLOYEE_ACTIVITY_RATES_TAB } from '#config/constants.js';
import { logger } from '#utils/logger.js';
import { NotFoundError } from '#utils/errors.js';

// Deletes an activity from the client's PayrollConfig, then cascades the deletion to the
// EmployeeActivityRates bridge tab so no rows are left pointing at the removed activityId.
const deleteActivity = async (clientId: string, activityId: string): Promise<void> => {
  logger.info(`deleteActivity clientId=${clientId} activityId=${activityId}`);

  const client = await getClientById(clientId);
  if (!client) throw new NotFoundError(`Client not found: ${clientId}`);

  await deleteActivityRow(client.payrollConfigFileId, activityId);

  const existingRates = await readEmployeeActivityRates(client.payrollConfigFileId);
  const remainingRates = existingRates.filter((rate) => rate.activityId !== activityId);
  await clearTabContent(client.payrollConfigFileId, EMPLOYEE_ACTIVITY_RATES_TAB);
  await writeEmployeeActivityRatesBulk(client.payrollConfigFileId, remainingRates);

  payrollConfigCache.delete(client.payrollConfigFileId);
};

export default deleteActivity;
