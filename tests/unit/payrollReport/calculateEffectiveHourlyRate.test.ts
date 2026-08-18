import { describe, it, expect } from 'vitest';
import calculateEffectiveHourlyRate from '#services/payrollReport/calculateEffectiveHourlyRate.js';
import Employee from '#models/Employee.js';
import Activity, { ActivityFundingSource } from '#models/Activity.js';
import EmployeeActivityRateInput from '#models/EmployeeActivityRateInput.js';
import PayrollReportHoursRow from '#models/PayrollReportHoursRow.js';
import { PayrollCategory } from '#models/PayrollCategory.js';
import { EmployeeStatus } from '#models/EmployeeStatus.js';
import { EmployeeActivityPayRateType } from '#models/EmployeeActivityPayRateType.js';

const makeEmployee = (overrides: Partial<Employee> = {}): Employee => ({
  employeeId: crypto.randomUUID(),
  firstName: 'Jane',
  lastName: 'Smith',
  position: 'Coordinator',
  salaryAmount: 0,
  activityRates: [],
  email: 'jane@example.com',
  status: EmployeeStatus.Active,
  timesheetFileId: '',
  ...overrides,
});

const makeActivity = (
  activityName: string,
  fundingSources: ActivityFundingSource[] = [],
  overrides: Partial<Activity> = {},
): Activity => ({
  activityId: crypto.randomUUID(),
  activityName,
  payrollCategory: PayrollCategory.Regular,
  groupLabel: null,
  sortOrder: 0,
  fundingSources,
  ...overrides,
});

const makeActivityRate = (
  activityId: string,
  overrides: Partial<EmployeeActivityRateInput> = {},
): EmployeeActivityRateInput => ({
  activityId,
  payRateType: EmployeeActivityPayRateType.Salary,
  payRate: 0,
  holidayPayRate: 0,
  ...overrides,
});

const makeHoursRow = (
  employeeId: string,
  activityName: string,
  hours: number,
): PayrollReportHoursRow => ({
  GeneratedAt: '2026-01-01T00:00:00Z',
  EmployeeId: employeeId,
  EmployeeName: 'Jane Smith',
  ActivityName: activityName,
  PayrollCategory: 'Regular',
  Date: '2026-01-02',
  IsHoliday: 'FALSE',
  Hours: hours,
});

describe('calculateEffectiveHourlyRate', () => {
  it('divides salaryAmount by hours logged against a single salary-type activity', () => {
    const activity = makeActivity('Programs');
    const employee = makeEmployee({
      salaryAmount: 2000,
      activityRates: [makeActivityRate(activity.activityId)],
    });
    const hoursRows = [makeHoursRow(employee.employeeId, 'Programs', 40)];
    const activityMap = new Map([[activity.activityName, activity]]);

    expect(calculateEffectiveHourlyRate(employee, hoursRows, activityMap)).toBe(50);
  });

  it('divides salaryAmount by the combined hours across multiple salary-type activities', () => {
    const activityA = makeActivity('Activity A');
    const activityB = makeActivity('Activity B');
    const employee = makeEmployee({
      salaryAmount: 3000,
      activityRates: [makeActivityRate(activityA.activityId), makeActivityRate(activityB.activityId)],
    });
    const hoursRows = [
      makeHoursRow(employee.employeeId, 'Activity A', 20),
      makeHoursRow(employee.employeeId, 'Activity B', 10),
    ];
    const activityMap = new Map([
      [activityA.activityName, activityA],
      [activityB.activityName, activityB],
    ]);

    expect(calculateEffectiveHourlyRate(employee, hoursRows, activityMap)).toBe(100);
  });

  it('ignores hours logged against non-salary-type activities', () => {
    const salaryActivity = makeActivity('Salaried Work');
    const hourlyActivity = makeActivity('On-Call');
    const employee = makeEmployee({
      salaryAmount: 1000,
      activityRates: [
        makeActivityRate(salaryActivity.activityId),
        makeActivityRate(hourlyActivity.activityId, { payRateType: EmployeeActivityPayRateType.Hourly }),
      ],
    });
    const hoursRows = [
      makeHoursRow(employee.employeeId, 'Salaried Work', 20),
      makeHoursRow(employee.employeeId, 'On-Call', 5),
    ];
    const activityMap = new Map([
      [salaryActivity.activityName, salaryActivity],
      [hourlyActivity.activityName, hourlyActivity],
    ]);

    expect(calculateEffectiveHourlyRate(employee, hoursRows, activityMap)).toBe(50);
  });

  it('returns 0 when the employee has no hours logged against any salary-type activity', () => {
    const activity = makeActivity('Programs');
    const employee = makeEmployee({
      salaryAmount: 2000,
      activityRates: [makeActivityRate(activity.activityId)],
    });
    const activityMap = new Map([[activity.activityName, activity]]);

    expect(calculateEffectiveHourlyRate(employee, [], activityMap)).toBe(0);
  });

  it('returns 0 when the employee has no salary-type bridge rows at all', () => {
    const activity = makeActivity('Programs');
    const employee = makeEmployee({
      salaryAmount: 2000,
      activityRates: [makeActivityRate(activity.activityId, { payRateType: EmployeeActivityPayRateType.Hourly })],
    });
    const hoursRows = [makeHoursRow(employee.employeeId, 'Programs', 40)];
    const activityMap = new Map([[activity.activityName, activity]]);

    expect(calculateEffectiveHourlyRate(employee, hoursRows, activityMap)).toBe(0);
  });

  it('ignores hours logged against unknown activities', () => {
    const activity = makeActivity('Programs');
    const employee = makeEmployee({
      salaryAmount: 1000,
      activityRates: [makeActivityRate(activity.activityId)],
    });
    const hoursRows = [
      makeHoursRow(employee.employeeId, 'Programs', 20),
      makeHoursRow(employee.employeeId, 'Unknown Activity', 20),
    ];
    const activityMap = new Map([[activity.activityName, activity]]);

    expect(calculateEffectiveHourlyRate(employee, hoursRows, activityMap)).toBe(50);
  });
});
