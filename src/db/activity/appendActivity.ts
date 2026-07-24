import appendRow from '#db/adapter/appendRow.js';
import { ACTIVITIES_TAB, ACTIVITIES_HEADERS } from '#config/constants.js';
import Activity from '#models/Activity.js';
import flattenActivityFundingSources from '#db/activity/flattenActivityFundingSources.js';

// Appends a new activity row to the Activities tab.
const appendActivity = async (workbookId: string, activity: Activity): Promise<void> => {
  const row: Record<string, unknown> = {
    ActivityId: activity.activityId,
    ActivityName: activity.activityName,
    TrackSeparately: activity.trackSeparately,
    PayrollCategory: activity.payrollCategory,
    ...flattenActivityFundingSources(activity.fundingSources),
    PayRate: activity.payRate,
    FlatRateAmount: activity.flatRateAmount,
  };

  await appendRow(workbookId, ACTIVITIES_TAB, ACTIVITIES_HEADERS, row);
};

export default appendActivity;
