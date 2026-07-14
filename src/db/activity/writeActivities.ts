import overwriteTabRows from '#db/adapter/overwriteTabRows.js';
import readActivities from '#db/activity/readActivities.js';
import flattenActivityFundingSources from '#db/activity/flattenActivityFundingSources.js';
import { ACTIVITIES_TAB, ACTIVITIES_HEADERS } from '#config/constants.js';
import Activity from '#models/Activity.js';
import { NotFoundError } from '#utils/errors.js';

// Overwrites all activity rows, updating the one matching the given activity.
const writeActivities = async (payrollConfigFileId: string, updatedActivity: Activity): Promise<void> => {
  const activities = await readActivities(payrollConfigFileId);

  const index = activities.findIndex((activity) => activity.activityId === updatedActivity.activityId);
  if (index === -1) throw new NotFoundError(`Activity not found: ${updatedActivity.activityId}`);

  activities[index] = updatedActivity;

  const rows = activities.map((activity) => ({
    ActivityId: activity.activityId,
    ActivityName: activity.activityName,
    TrackSeparately: activity.trackSeparately,
    PayrollCategory: activity.payrollCategory,
    ...flattenActivityFundingSources(activity.fundingSources),
    PayRate: activity.payRate,
    FlatRateAmount: activity.flatRateAmount,
  }));

  await overwriteTabRows(payrollConfigFileId, ACTIVITIES_TAB, ACTIVITIES_HEADERS, rows);
};

export default writeActivities;
