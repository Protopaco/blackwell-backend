import Activity from '#models/Activity.js';
import ActivityGroup from '#models/ActivityGroup.js';
import SortedActivities from '#models/SortedActivities.js';
import EmployeeActivityRateInput from '#models/EmployeeActivityRateInput.js';
import { EmployeeActivityPayRateType } from '#models/EmployeeActivityPayRateType.js';
import { PayrollCategory } from '#models/PayrollCategory.js';

const TIME_OFF_CATEGORIES = [
  PayrollCategory.ETO,
  PayrollCategory.PTO,
  PayrollCategory.STO,
];

// Orders a list of activities into groups: ungrouped activities first (by their own sortOrder) as a
// single groupLabel-null entry, then named groups alphabetically by groupLabel, with each group's
// activities ordered by their own sortOrder. The ungrouped entry is omitted when empty. Exported so
// buildWeek can re-run this same ordering across a combined list spanning multiple sortActivities buckets.
const groupActivities = (activities: Activity[]): ActivityGroup[] => {
  const bySortOrder = (a: Activity, b: Activity) => a.sortOrder - b.sortOrder;

  const ungroupedActivities = activities
    .filter((activity) => activity.groupLabel === null)
    .sort(bySortOrder);

  const groupedActivitiesByLabel = new Map<string, Activity[]>();
  activities
    .filter((activity) => activity.groupLabel !== null)
    .forEach((activity) => {
      const groupLabel = activity.groupLabel as string;
      const existingGroup = groupedActivitiesByLabel.get(groupLabel) ?? [];
      existingGroup.push(activity);
      groupedActivitiesByLabel.set(groupLabel, existingGroup);
    });

  const namedGroups: ActivityGroup[] = Array.from(groupedActivitiesByLabel.entries())
    .sort(([firstGroupLabel], [secondGroupLabel]) => firstGroupLabel.localeCompare(secondGroupLabel))
    .map(([groupLabel, groupActivities]) => ({
      groupLabel,
      activities: groupActivities.sort(bySortOrder),
    }));

  return ungroupedActivities.length > 0
    ? [{ groupLabel: null, activities: ungroupedActivities }, ...namedGroups]
    : namedGroups;
};

// Splits a flat activity list into work, time off, and flat-rate buckets, then orders each bucket into
// groups (see groupBucket) — flat-rate is determined per employeeActivityRates' payRateType (FlatRate),
// since that's a per-employee bridge-row concern, not a property of Activity itself. Hourly and Salary
// activities (both hour-tracked on the timesheet) land in workActivities unless they're a time-off
// category. Used by generateTimesheets to determine row order on one employee's timesheet.
const sortActivities = (activities: Activity[], employeeActivityRates: EmployeeActivityRateInput[]): SortedActivities => {
  const payRateTypeByActivityId = new Map(
    employeeActivityRates.map((activityRate) => [activityRate.activityId, activityRate.payRateType]),
  );

  const workActivities: Activity[] = [];
  const timeOffActivities: Activity[] = [];
  const flatRateActivities: Activity[] = [];

  activities.forEach((activity) => {
    if (payRateTypeByActivityId.get(activity.activityId) === EmployeeActivityPayRateType.FlatRate) {
      flatRateActivities.push(activity);
    } else if (TIME_OFF_CATEGORIES.includes(activity.payrollCategory as any)) {
      timeOffActivities.push(activity);
    } else {
      workActivities.push(activity);
    }
  });

  return {
    workActivities: groupActivities(workActivities),
    timeOffActivities: groupActivities(timeOffActivities),
    flatRateActivities: groupActivities(flatRateActivities),
    payRateTypeByActivityId,
  };
};

export { groupActivities };
export default sortActivities;
