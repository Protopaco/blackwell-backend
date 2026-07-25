import flattenActivityFundingSources from './flattenActivityFundingSources.js';
import Activity from '#models/Activity.js';

// Maps an Activity back to a sheet-row object keyed by ACTIVITIES_HEADERS — the write-side inverse of mapActivity.ts.
const mapActivityRow = (activity: Activity): Record<string, unknown> => ({
  ActivityId: activity.activityId,
  ActivityName: activity.activityName,
  TrackSeparately: activity.trackSeparately,
  PayrollCategory: activity.payrollCategory,
  ...flattenActivityFundingSources(activity.fundingSources),
  PayRate: activity.payRate,
  FlatRateAmount: activity.flatRateAmount,
});

export default mapActivityRow;
