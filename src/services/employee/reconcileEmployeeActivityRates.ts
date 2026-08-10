import readEmployeeActivityRates from '#db/employeeActivityRate/readEmployeeActivityRates.js';
import clearTabContent from '#db/adapter/clearTabContent.js';
import writeEmployeeActivityRatesBulk from '#db/employeeActivityRate/writeEmployeeActivityRatesBulk.js';
import { EMPLOYEE_ACTIVITY_RATES_TAB } from '#config/constants.js';
import Activity from '#models/Activity.js';
import Employee from '#models/Employee.js';
import EmployeeActivityRateInput from '#models/EmployeeActivityRateInput.js';
import { UnprocessableError, NotFoundError } from '#utils/errors.js';

// Replaces one employee's rows in the EmployeeActivityRates bridge tab with the incoming activityRates
// array — called by updateEmployee. Rather than diffing append/update/delete per row, this rebuilds the
// employee's full row set in one pass: existing rows keep their id (matched by the input's id), new rows
// (no id) get one generated. The whole tab is cleared and rewritten in a single call so a shrinking row
// count (a row removed from the array) doesn't leave stale trailing rows behind. Rows are sorted by
// employeeId/activityId before writing so the tab stays grouped by employee for readability.
const reconcileEmployeeActivityRates = async (
  payrollConfigFileId: string,
  employee: Pick<Employee, 'employeeId' | 'firstName' | 'lastName'>,
  activityRates: EmployeeActivityRateInput[],
  activities: Activity[],
): Promise<void> => {
  const activityIds = new Set<string>();
  for (const activityRate of activityRates) {
    if (activityIds.has(activityRate.activityId)) {
      throw new UnprocessableError(`Duplicate activityId in activityRates: ${activityRate.activityId}`);
    }
    activityIds.add(activityRate.activityId);
    if (!activities.some((activity) => activity.activityId === activityRate.activityId)) {
      throw new NotFoundError(`Activity not found: ${activityRate.activityId}`);
    }
  }

  const existingRates = await readEmployeeActivityRates(payrollConfigFileId);
  const otherEmployeesRates = existingRates.filter((rate) => rate.employeeId !== employee.employeeId);

  const employeeName = `${employee.firstName} ${employee.lastName}`;
  const updatedEmployeeRates = activityRates.map((activityRate) => {
    const activity = activities.find((candidate) => candidate.activityId === activityRate.activityId)!;
    return {
      id: activityRate.id ?? crypto.randomUUID(),
      employeeId: employee.employeeId,
      employeeName,
      activityId: activityRate.activityId,
      activityName: activity.activityName,
      payRateType: activityRate.payRateType,
      payRate: activityRate.payRate,
      holidayPayRate: activityRate.holidayPayRate,
    };
  });

  const sortedRates = [...otherEmployeesRates, ...updatedEmployeeRates].sort(
    (a, b) => a.employeeId.localeCompare(b.employeeId) || a.activityId.localeCompare(b.activityId),
  );

  await clearTabContent(payrollConfigFileId, EMPLOYEE_ACTIVITY_RATES_TAB);
  await writeEmployeeActivityRatesBulk(payrollConfigFileId, sortedRates);
};

export default reconcileEmployeeActivityRates;
