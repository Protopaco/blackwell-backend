import Activity from '#models/Activity.js';
import { PayRate, isFlatRate } from '#models/PayRate.js';
import { PayrollCategory } from '#models/PayrollCategory.js';

const TIME_OFF_CATEGORIES = [
  PayrollCategory.ETO,
  PayrollCategory.PTO,
  PayrollCategory.STO,
];

interface SortedActivities {
  workActivities: Activity[];
  timeOffActivities: Activity[];
  flatRateActivities: Activity[];
}

// Splits a flat activity list into work, time-off, and flat-rate buckets, each sorted alphabetically.
// Used by generateTimesheets to determine row order on the timesheet.
const sortActivities = (activities: Activity[]): SortedActivities => {
  const workActivities: Activity[] = [];
  const timeOffActivities: Activity[] = [];
  const flatRateActivities: Activity[] = [];

  activities.forEach((activity) => {
    if (isFlatRate(activity.payRate)) {
      flatRateActivities.push(activity);
    } else if (TIME_OFF_CATEGORIES.includes(activity.payrollCategory as any)) {
      timeOffActivities.push(activity);
    } else {
      workActivities.push(activity);
    }
  });

  const alphabetical = (a: Activity, b: Activity) =>
    a.activityName.localeCompare(b.activityName);

  return {
    workActivities: workActivities.sort(alphabetical),
    timeOffActivities: timeOffActivities.sort(alphabetical),
    flatRateActivities: flatRateActivities.sort(alphabetical),
  };
};

export type { SortedActivities };
export default sortActivities;
