import Activity from '#models/Activity.js';
import Guid from '#models/Guid.js';
import { ActivityRowType } from '#models/TimesheetManifest.js';
import { EmployeeActivityPayRateType, EmployeeActivityPayRateTypeType } from '#models/EmployeeActivityPayRateType.js';
import { PayrollCategory } from '#models/PayrollCategory.js';

const TIME_OFF_CATEGORIES = [PayrollCategory.ETO, PayrollCategory.PTO, PayrollCategory.STO];

// Determines one activity's pay-type tag for its timesheet row: FlatRate activities are tagged FlatRate
// regardless of payrollCategory, time-off categories (ETO/PTO/STO) take the next priority, and everything
// else falls back to its own Hourly/Salary payRateType. Used by buildWeek to tag each row of the single
// combined activity block (see TimesheetManifest.ActivityRowType).
const getActivityRowType = (
  activity: Activity,
  payRateTypeByActivityId: Map<Guid, EmployeeActivityPayRateTypeType>,
): ActivityRowType => {
  const payRateType = payRateTypeByActivityId.get(activity.activityId);

  if (payRateType === EmployeeActivityPayRateType.FlatRate) return 'FlatRate';
  if (TIME_OFF_CATEGORIES.includes(activity.payrollCategory as any)) {
    return activity.payrollCategory as ActivityRowType;
  }
  return payRateType as ActivityRowType;
};

export default getActivityRowType;
