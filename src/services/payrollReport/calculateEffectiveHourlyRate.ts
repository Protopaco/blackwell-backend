import Employee from '#models/Employee.js';
import Activity from '#models/Activity.js';
import PayrollReportHoursRow from '#models/PayrollReportHoursRow.js';
import { EmployeeActivityPayRateType } from '#models/EmployeeActivityPayRateType.js';

// Computes a salaried employee's effective hourly rate for this pay period: their salaryAmount divided by
// the total hours logged against their salary-type bridge rows — called by buildAllocationRows. Returns 0
// when they have no salary-type hours this period — [058] validates that case doesn't reach report generation.
const calculateEffectiveHourlyRate = (
  employee: Employee,
  employeeHoursRows: PayrollReportHoursRow[],
  activityMap: Map<string, Activity>,
): number => {
  const salaryActivityIds = new Set(
    employee.activityRates
      .filter((activityRate) => activityRate.payRateType === EmployeeActivityPayRateType.Salary)
      .map((activityRate) => activityRate.activityId),
  );

  const salaryHours = employeeHoursRows.reduce((sum, row) => {
    const activity = activityMap.get(row.ActivityName);
    if (!activity || !salaryActivityIds.has(activity.activityId)) return sum;
    return sum + row.Hours;
  }, 0);

  return salaryHours > 0 ? employee.salaryAmount / salaryHours : 0;
};

export default calculateEffectiveHourlyRate;
