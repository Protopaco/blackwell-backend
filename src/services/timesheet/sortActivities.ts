import Activity from '#models/Activity.js';
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

// SHIM — flat-rate detection (previously isFlatRate(activity.payRate)) was removed in [052]; flat-rate is
// now a per-(employee, activity) bridge-row concept, not a per-Activity one, so it can no longer be
// determined here. The real rewire is [055]'s scope — flatRateActivities is always empty until then, so
// every non-time-off activity lands in workActivities.
//
// Splits a flat activity list into work, time-off, and flat-rate buckets, each sorted alphabetically.
// Used by generateTimesheets to determine row order on the timesheet.
const sortActivities = (activities: Activity[]): SortedActivities => {
  const workActivities: Activity[] = [];
  const timeOffActivities: Activity[] = [];
  const flatRateActivities: Activity[] = [];

  activities.forEach((activity) => {
    if (TIME_OFF_CATEGORIES.includes(activity.payrollCategory as any)) {
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
