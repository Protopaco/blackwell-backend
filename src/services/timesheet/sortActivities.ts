import Activity from '#models/Activity.js';
import EmployeeActivityRateInput from '#models/EmployeeActivityRateInput.js';
import { EmployeeActivityPayRateType } from '#models/EmployeeActivityPayRateType.js';
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

// Splits a flat activity list into work, time off, and flat-rate buckets, each sorted alphabetically —
// flat-rate is determined per employeeActivityRates' payRateType (FlatRate), since that's a per-employee
// bridge-row concern, not a property of Activity itself. Hourly and Salary activities (both hour-tracked
// on the timesheet) land in workActivities unless they're a time-off category. Used by generateTimesheets
// to determine row order on one employee's timesheet.
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
