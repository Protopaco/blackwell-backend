import Employee from '#models/Employee.js';
import Activity from '#models/Activity.js';
import AllocationReportRow from '#models/AllocationReportRow.js';
import AdditionalExpense from '#models/AdditionalExpense.js';
import EmployeeExpense from '#models/EmployeeExpense.js';
import PayrollReportHoursRow from '#models/PayrollReportHoursRow.js';
import { EmployeeActivityPayRateType } from '#models/EmployeeActivityPayRateType.js';
import { logger } from '#utils/logger.js';

// Looks up the employee's EmployeeActivityRates bridge row for this activity and returns the dollar rate
// to apply — the bridge row's holidayPayRate when isHoliday is true, otherwise its payRate. Returns 0 when
// the employee has no bridge row for the activity. Salary-type rows are left for [057] to handle and
// return 0 here.
const resolveDollarRate = (employee: Employee, activity: Activity, isHoliday: boolean): number => {
  const activityRate = employee.activityRates.find((rate) => rate.activityId === activity.activityId);
  if (!activityRate) return 0;
  if (activityRate.payRateType === EmployeeActivityPayRateType.Salary) return 0;
  return isHoliday ? activityRate.holidayPayRate : activityRate.payRate;
};

// Runs the full allocation calculation.
// Returns one AllocationReportRow per funding source, sorted by wagesAllocation descending.
const buildAllocationRows = (
  hoursRows: PayrollReportHoursRow[],
  employeeExpenses: EmployeeExpense[],
  additionalExpenses: AdditionalExpense[],
  activityMap: Map<string, Activity>,
  employeeMap: Map<string, Employee>,
): AllocationReportRow[] => {
  const wagesAllocationByFundingSource = new Map<string, number>();
  let processedWagesTotal = 0;

  const activeExpenses = employeeExpenses.filter((expense) => expense.totalExpense !== null);

  for (const expense of activeExpenses) {
    const employee = employeeMap.get(expense.employeeId);
    if (!employee) {
      logger.warn(`buildAllocationRows: employee not found in payroll config: ${expense.employeeId}`);
      continue;
    }

    const employeeHoursRows = hoursRows.filter((row) => row.EmployeeId === expense.employeeId);

    // Compute weighted cost per funding source for this employee
    const weightedCostByFundingSource = new Map<string, number>();
    let totalWeightedCost = 0;

    for (const row of employeeHoursRows) {
      const activity = activityMap.get(row.ActivityName);
      if (!activity) {
        logger.warn(`buildAllocationRows: activity not found in payroll config: ${row.ActivityName}`);
        continue;
      }

      const dollarRate = resolveDollarRate(employee, activity, row.IsHoliday === 'TRUE');
      const rowCost = row.Hours * dollarRate;

      for (const fundingSource of activity.fundingSources) {
        const contribution = rowCost * (fundingSource.percentage / 100);
        weightedCostByFundingSource.set(
          fundingSource.fundingSourceName,
          (weightedCostByFundingSource.get(fundingSource.fundingSourceName) ?? 0) + contribution,
        );
        totalWeightedCost += contribution;
      }
    }

    if (totalWeightedCost === 0) continue;

    // Apply proportions to employee's totalExpense
    const totalExpense = expense.totalExpense as number;
    for (const [fundingSourceName, weightedCost] of weightedCostByFundingSource) {
      const proportion = weightedCost / totalWeightedCost;
      wagesAllocationByFundingSource.set(
        fundingSourceName,
        (wagesAllocationByFundingSource.get(fundingSourceName) ?? 0) + proportion * totalExpense,
      );
    }
    processedWagesTotal += totalExpense;
  }

  if (wagesAllocationByFundingSource.size === 0) return [];

  const totalWagesAllocation = Array.from(wagesAllocationByFundingSource.values()).reduce(
    (sum, value) => sum + value,
    0,
  );
  const targetAdditionalTotal = additionalExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  const sortedEntries = Array.from(wagesAllocationByFundingSource.entries())
    .sort(([, a], [, b]) => b - a);

  // Round all rows except the last normally; the last row gets the remainder so
  // the sum of wagesAllocation across all rows always equals the exact sum of employee expenses.
  let accumulatedWages = 0;
  let accumulatedAdditional = 0;

  return sortedEntries.map(([fundingSourceName, wagesAllocation], index) => {
    const share = totalWagesAllocation > 0 ? wagesAllocation / totalWagesAllocation : 0;
    const isLast = index === sortedEntries.length - 1;

    const roundedWages = isLast
      ? Math.round((processedWagesTotal - accumulatedWages) * 100) / 100
      : Math.round(wagesAllocation * 100) / 100;

    const roundedAdditional = isLast
      ? Math.round((targetAdditionalTotal - accumulatedAdditional) * 100) / 100
      : Math.round(share * targetAdditionalTotal * 100) / 100;

    accumulatedWages += roundedWages;
    accumulatedAdditional += roundedAdditional;

    return {
      fundingSourceName,
      wagesAllocation: roundedWages,
      additionalExpenses: roundedAdditional,
      total: Math.round((roundedWages + roundedAdditional) * 100) / 100,
    };
  });
};

export default buildAllocationRows;
