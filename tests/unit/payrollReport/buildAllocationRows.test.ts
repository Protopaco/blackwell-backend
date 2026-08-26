import { describe, it, expect } from 'vitest';
import buildAllocationRows from '#services/payrollReport/buildAllocationRows.js';
import Employee from '#models/Employee.js';
import Activity, { ActivityFundingSource } from '#models/Activity.js';
import EmployeeActivityRateInput from '#models/EmployeeActivityRateInput.js';
import EmployeeExpense from '#models/EmployeeExpense.js';
import AdditionalExpense from '#models/AdditionalExpense.js';
import FundingSource from '#models/FundingSource.js';
import PayrollReportHoursRow from '#models/PayrollReportHoursRow.js';
import { PayrollCategory } from '#models/PayrollCategory.js';
import { EmployeeStatus } from '#models/EmployeeStatus.js';
import { EmployeeActivityPayRateType } from '#models/EmployeeActivityPayRateType.js';

// ─── Factories ────────────────────────────────────────────────────────────────

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
  fundingSources: ActivityFundingSource[],
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

// Default payRate of 1 keeps dollar cost equal to hours, so tests that only care about
// hours-based proportions don't need to reason about an arbitrary rate.
const makeActivityRate = (
  activityId: string,
  overrides: Partial<EmployeeActivityRateInput> = {},
): EmployeeActivityRateInput => ({
  activityId,
  payRateType: EmployeeActivityPayRateType.Hourly,
  payRate: 1,
  holidayPayRate: 1,
  ...overrides,
});

const makeHoursRow = (
  employeeId: string,
  activityName: string,
  hours: number,
  overrides: Partial<PayrollReportHoursRow> = {},
): PayrollReportHoursRow => ({
  GeneratedAt: '2026-01-01T00:00:00Z',
  EmployeeId: employeeId,
  EmployeeName: 'Jane Smith',
  ActivityName: activityName,
  PayrollCategory: 'Regular',
  Date: '2026-01-02',
  IsHoliday: 'FALSE',
  Hours: hours,
  ...overrides,
});

const makeExpense = (employeeId: string, wageExpense: number | null): EmployeeExpense => ({
  employeeId,
  employeeName: 'Jane Smith',
  wageExpense,
});

const makeAdditional = (expenseName: string, amount: number): AdditionalExpense => ({
  expenseName,
  amount,
});

const makeFundingSourceMap = (
  entries: [fundingSourceName: string, fringeRate: number | null][],
): Map<string, FundingSource> =>
  new Map(
    entries.map(([fundingSourceName, fringeRate]) => [
      fundingSourceName,
      { fundingSourceId: crypto.randomUUID(), fundingSourceName, fringeRate },
    ]),
  );

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('buildAllocationRows', () => {
  describe('basic allocation', () => {
    it('returns one row for a single funding source', () => {
      const activity = makeActivity('Programs', [{ fundingSourceName: 'Grant A', percentage: 100 }]);
      const employee = makeEmployee({ activityRates: [makeActivityRate(activity.activityId)] });
      const hoursRows = [makeHoursRow(employee.employeeId, 'Programs', 8)];
      const expenses = [makeExpense(employee.employeeId, 2400)];
      const activityMap = new Map([[activity.activityName, activity]]);
      const employeeMap = new Map([[employee.employeeId, employee]]);

      const rows = buildAllocationRows(hoursRows, expenses, [], activityMap, employeeMap, new Map());

      expect(rows).toHaveLength(1);
      expect(rows[0].fundingSourceName).toBe('Grant A');
      expect(rows[0].wagesAllocation).toBe(2400);
      expect(rows[0].additionalExpenses).toBe(0);
      expect(rows[0].total).toBe(2400);
    });

    it('splits a single employee across two funding sources by hours proportion', () => {
      // Activity A: 100% Grant A. Activity B: 100% Grant B.
      // 6 hrs on A, 4 hrs on B → Grant A = 60%, Grant B = 40%
      const activityA = makeActivity('Activity A', [{ fundingSourceName: 'Grant A', percentage: 100 }]);
      const activityB = makeActivity('Activity B', [{ fundingSourceName: 'Grant B', percentage: 100 }]);
      const employee = makeEmployee({
        activityRates: [makeActivityRate(activityA.activityId), makeActivityRate(activityB.activityId)],
      });
      const hoursRows = [
        makeHoursRow(employee.employeeId, 'Activity A', 6),
        makeHoursRow(employee.employeeId, 'Activity B', 4),
      ];
      const expenses = [makeExpense(employee.employeeId, 1000)];
      const activityMap = new Map([
        [activityA.activityName, activityA],
        [activityB.activityName, activityB],
      ]);
      const employeeMap = new Map([[employee.employeeId, employee]]);

      const rows = buildAllocationRows(hoursRows, expenses, [], activityMap, employeeMap, new Map());

      expect(rows).toHaveLength(2);
      const grantA = rows.find((r) => r.fundingSourceName === 'Grant A')!;
      const grantB = rows.find((r) => r.fundingSourceName === 'Grant B')!;
      expect(grantA.wagesAllocation).toBe(600);
      expect(grantB.wagesAllocation).toBe(400);
    });

    it('splits a single activity across two funding sources by percentage', () => {
      // One activity split 60% Grant A / 40% Grant B
      const activity = makeActivity('Programs', [
        { fundingSourceName: 'Grant A', percentage: 60 },
        { fundingSourceName: 'Grant B', percentage: 40 },
      ]);
      const employee = makeEmployee({ activityRates: [makeActivityRate(activity.activityId)] });
      const hoursRows = [makeHoursRow(employee.employeeId, 'Programs', 10)];
      const expenses = [makeExpense(employee.employeeId, 1000)];
      const activityMap = new Map([[activity.activityName, activity]]);
      const employeeMap = new Map([[employee.employeeId, employee]]);

      const rows = buildAllocationRows(hoursRows, expenses, [], activityMap, employeeMap, new Map());

      expect(rows).toHaveLength(2);
      const grantA = rows.find((r) => r.fundingSourceName === 'Grant A')!;
      const grantB = rows.find((r) => r.fundingSourceName === 'Grant B')!;
      expect(grantA.wagesAllocation).toBe(600);
      expect(grantB.wagesAllocation).toBe(400);
    });
  });

  describe('multiple employees', () => {
    it('sums allocations across employees for the same funding source', () => {
      const activity = makeActivity('Programs', [{ fundingSourceName: 'Grant A', percentage: 100 }]);
      const emp1 = makeEmployee({ activityRates: [makeActivityRate(activity.activityId)] });
      const emp2 = makeEmployee({ activityRates: [makeActivityRate(activity.activityId)] });
      const hoursRows = [
        makeHoursRow(emp1.employeeId, 'Programs', 8),
        makeHoursRow(emp2.employeeId, 'Programs', 8),
      ];
      const expenses = [
        makeExpense(emp1.employeeId, 1000),
        makeExpense(emp2.employeeId, 2000),
      ];
      const activityMap = new Map([[activity.activityName, activity]]);
      const employeeMap = new Map([
        [emp1.employeeId, emp1],
        [emp2.employeeId, emp2],
      ]);

      const rows = buildAllocationRows(hoursRows, expenses, [], activityMap, employeeMap, new Map());

      expect(rows).toHaveLength(1);
      expect(rows[0].wagesAllocation).toBe(3000);
    });

    it('uses each employee\'s individual hours to compute their proportion when they work different activities', () => {
      // emp1: 10 hrs on Grant A activity → 100% Grant A → $1000 to Grant A
      // emp2: 5 hrs on Grant A, 5 hrs on Grant B → 50/50 → $500 Grant A, $500 Grant B
      const activityA = makeActivity('Activity A', [{ fundingSourceName: 'Grant A', percentage: 100 }]);
      const activityB = makeActivity('Activity B', [{ fundingSourceName: 'Grant B', percentage: 100 }]);
      const emp1 = makeEmployee({ activityRates: [makeActivityRate(activityA.activityId)] });
      const emp2 = makeEmployee({
        activityRates: [makeActivityRate(activityA.activityId), makeActivityRate(activityB.activityId)],
      });
      const hoursRows = [
        makeHoursRow(emp1.employeeId, 'Activity A', 10),
        makeHoursRow(emp2.employeeId, 'Activity A', 5),
        makeHoursRow(emp2.employeeId, 'Activity B', 5),
      ];
      const expenses = [
        makeExpense(emp1.employeeId, 1000),
        makeExpense(emp2.employeeId, 1000),
      ];
      const activityMap = new Map([
        [activityA.activityName, activityA],
        [activityB.activityName, activityB],
      ]);
      const employeeMap = new Map([
        [emp1.employeeId, emp1],
        [emp2.employeeId, emp2],
      ]);

      const rows = buildAllocationRows(hoursRows, expenses, [], activityMap, employeeMap, new Map());

      const grantA = rows.find((r) => r.fundingSourceName === 'Grant A')!;
      const grantB = rows.find((r) => r.fundingSourceName === 'Grant B')!;
      expect(grantA.wagesAllocation).toBe(1500);
      expect(grantB.wagesAllocation).toBe(500);
    });

    it('pay rates do not affect proportions when all activities use the same rate type', () => {
      // emp1 has rate $10, emp2 has rate $40 — but same activity proportions
      // Grant A gets 100% of both employees' expenses
      const activity = makeActivity('Programs', [{ fundingSourceName: 'Grant A', percentage: 100 }]);
      const emp1 = makeEmployee({ activityRates: [makeActivityRate(activity.activityId, { payRate: 10 })] });
      const emp2 = makeEmployee({ activityRates: [makeActivityRate(activity.activityId, { payRate: 40 })] });
      const hoursRows = [
        makeHoursRow(emp1.employeeId, 'Programs', 8),
        makeHoursRow(emp2.employeeId, 'Programs', 8),
      ];
      const expenses = [
        makeExpense(emp1.employeeId, 1200),
        makeExpense(emp2.employeeId, 3000),
      ];
      const activityMap = new Map([[activity.activityName, activity]]);
      const employeeMap = new Map([
        [emp1.employeeId, emp1],
        [emp2.employeeId, emp2],
      ]);

      const rows = buildAllocationRows(hoursRows, expenses, [], activityMap, employeeMap, new Map());

      expect(rows).toHaveLength(1);
      expect(rows[0].wagesAllocation).toBe(4200);
    });

    it('uses each employee\'s own pay rate to weight proportions across activities', () => {
      // emp1: rate $10. 4 hrs on Grant A ($40), 4 hrs on Grant B ($40) → 50% each
      // emp2: rate $20. 8 hrs on Grant A ($160), 2 hrs on Grant B ($40) → 80% / 20%
      const activityA = makeActivity('Activity A', [{ fundingSourceName: 'Grant A', percentage: 100 }]);
      const activityB = makeActivity('Activity B', [{ fundingSourceName: 'Grant B', percentage: 100 }]);
      const emp1 = makeEmployee({
        activityRates: [
          makeActivityRate(activityA.activityId, { payRate: 10 }),
          makeActivityRate(activityB.activityId, { payRate: 10 }),
        ],
      });
      const emp2 = makeEmployee({
        activityRates: [
          makeActivityRate(activityA.activityId, { payRate: 20 }),
          makeActivityRate(activityB.activityId, { payRate: 20 }),
        ],
      });
      const hoursRows = [
        makeHoursRow(emp1.employeeId, 'Activity A', 4),
        makeHoursRow(emp1.employeeId, 'Activity B', 4),
        makeHoursRow(emp2.employeeId, 'Activity A', 8),
        makeHoursRow(emp2.employeeId, 'Activity B', 2),
      ];
      const expenses = [
        makeExpense(emp1.employeeId, 1000),
        makeExpense(emp2.employeeId, 1000),
      ];
      const activityMap = new Map([
        [activityA.activityName, activityA],
        [activityB.activityName, activityB],
      ]);
      const employeeMap = new Map([
        [emp1.employeeId, emp1],
        [emp2.employeeId, emp2],
      ]);

      const rows = buildAllocationRows(hoursRows, expenses, [], activityMap, employeeMap, new Map());

      // emp1: 50% each → $500 Grant A, $500 Grant B
      // emp2: 80% / 20% → $800 Grant A, $200 Grant B
      const grantA = rows.find((r) => r.fundingSourceName === 'Grant A')!;
      const grantB = rows.find((r) => r.fundingSourceName === 'Grant B')!;
      expect(grantA.wagesAllocation).toBe(1300);
      expect(grantB.wagesAllocation).toBe(700);
    });
  });

  describe('filtering active employees', () => {
    it('excludes employees where wageExpense is null', () => {
      const activity = makeActivity('Programs', [{ fundingSourceName: 'Grant A', percentage: 100 }]);
      const employee = makeEmployee({ activityRates: [makeActivityRate(activity.activityId)] });
      const hoursRows = [makeHoursRow(employee.employeeId, 'Programs', 8)];
      const expenses = [makeExpense(employee.employeeId, null)];
      const activityMap = new Map([[activity.activityName, activity]]);
      const employeeMap = new Map([[employee.employeeId, employee]]);

      const rows = buildAllocationRows(hoursRows, expenses, [], activityMap, employeeMap, new Map());

      expect(rows).toHaveLength(0);
    });

    it('excludes employees who have no hours in current_hours (totalWeightedCost = 0)', () => {
      const activity = makeActivity('Programs', [{ fundingSourceName: 'Grant A', percentage: 100 }]);
      const employee = makeEmployee({ activityRates: [makeActivityRate(activity.activityId)] });
      const expenses = [makeExpense(employee.employeeId, 1000)];
      const activityMap = new Map([[activity.activityName, activity]]);
      const employeeMap = new Map([[employee.employeeId, employee]]);

      // No hours rows at all
      const rows = buildAllocationRows([], expenses, [], activityMap, employeeMap, new Map());

      expect(rows).toHaveLength(0);
    });
  });

  describe('additional expenses', () => {
    it('distributes additional expenses by funding source wage share', () => {
      const activityA = makeActivity('Activity A', [{ fundingSourceName: 'Grant A', percentage: 100 }]);
      const activityB = makeActivity('Activity B', [{ fundingSourceName: 'Grant B', percentage: 100 }]);
      const employee = makeEmployee({
        activityRates: [makeActivityRate(activityA.activityId), makeActivityRate(activityB.activityId)],
      });
      // 75% hours on A, 25% on B → wages: $750 / $250
      const hoursRows = [
        makeHoursRow(employee.employeeId, 'Activity A', 6),
        makeHoursRow(employee.employeeId, 'Activity B', 2),
      ];
      const expenses = [makeExpense(employee.employeeId, 1000)];
      const additionalExpenses = [makeAdditional('HSA', 400)];
      const activityMap = new Map([
        [activityA.activityName, activityA],
        [activityB.activityName, activityB],
      ]);
      const employeeMap = new Map([[employee.employeeId, employee]]);

      const rows = buildAllocationRows(hoursRows, expenses, additionalExpenses, activityMap, employeeMap, new Map());

      const grantA = rows.find((r) => r.fundingSourceName === 'Grant A')!;
      const grantB = rows.find((r) => r.fundingSourceName === 'Grant B')!;
      // wages: $750 / $250. shares: 75% / 25%. additional: $300 / $100
      expect(grantA.additionalExpenses).toBe(300);
      expect(grantB.additionalExpenses).toBe(100);
      expect(grantA.total).toBe(1050);
      expect(grantB.total).toBe(350);
    });

    it('distributes multiple additional expense items combined', () => {
      const activity = makeActivity('Programs', [{ fundingSourceName: 'Grant A', percentage: 100 }]);
      const employee = makeEmployee({ activityRates: [makeActivityRate(activity.activityId)] });
      const hoursRows = [makeHoursRow(employee.employeeId, 'Programs', 8)];
      const expenses = [makeExpense(employee.employeeId, 1000)];
      const additionalExpenses = [
        makeAdditional('HSA', 200),
        makeAdditional('Dental', 100),
        makeAdditional('Vision', 50),
      ];
      const activityMap = new Map([[activity.activityName, activity]]);
      const employeeMap = new Map([[employee.employeeId, employee]]);

      const rows = buildAllocationRows(hoursRows, expenses, additionalExpenses, activityMap, employeeMap, new Map());

      expect(rows[0].additionalExpenses).toBe(350);
      expect(rows[0].total).toBe(1350);
    });

    it('sets additionalExpenses to 0 when additional expenses list is empty', () => {
      const activity = makeActivity('Programs', [{ fundingSourceName: 'Grant A', percentage: 100 }]);
      const employee = makeEmployee({ activityRates: [makeActivityRate(activity.activityId)] });
      const hoursRows = [makeHoursRow(employee.employeeId, 'Programs', 8)];
      const expenses = [makeExpense(employee.employeeId, 1000)];
      const activityMap = new Map([[activity.activityName, activity]]);
      const employeeMap = new Map([[employee.employeeId, employee]]);

      const rows = buildAllocationRows(hoursRows, expenses, [], activityMap, employeeMap, new Map());

      expect(rows[0].additionalExpenses).toBe(0);
      expect(rows[0].total).toBe(rows[0].wagesAllocation);
    });
  });

  describe('pay rate types', () => {
    it('uses the bridge row\'s payRate per activity to weight proportions', () => {
      // Activity A bridge row: $10/hr. Activity B bridge row: $30/hr.
      // 4 hrs × $10 = $40 (Grant A), 4 hrs × $30 = $120 (Grant B) → 25% / 75%
      const activityA = makeActivity('Activity A', [{ fundingSourceName: 'Grant A', percentage: 100 }]);
      const activityB = makeActivity('Activity B', [{ fundingSourceName: 'Grant B', percentage: 100 }]);
      const employee = makeEmployee({
        activityRates: [
          makeActivityRate(activityA.activityId, { payRate: 10 }),
          makeActivityRate(activityB.activityId, { payRate: 30 }),
        ],
      });
      const hoursRows = [
        makeHoursRow(employee.employeeId, 'Activity A', 4),
        makeHoursRow(employee.employeeId, 'Activity B', 4),
      ];
      const expenses = [makeExpense(employee.employeeId, 1000)];
      const activityMap = new Map([
        [activityA.activityName, activityA],
        [activityB.activityName, activityB],
      ]);
      const employeeMap = new Map([[employee.employeeId, employee]]);

      const rows = buildAllocationRows(hoursRows, expenses, [], activityMap, employeeMap, new Map());

      const grantA = rows.find((r) => r.fundingSourceName === 'Grant A')!;
      const grantB = rows.find((r) => r.fundingSourceName === 'Grant B')!;
      expect(grantA.wagesAllocation).toBe(250);
      expect(grantB.wagesAllocation).toBe(750);
    });

    it('resolves FlatRate bridge rows using their payRate, not $0', () => {
      const activityA = makeActivity('Hourly Activity', [{ fundingSourceName: 'Grant A', percentage: 100 }]);
      // 2 flat-rate shifts (row.Hours holds the quantity, not a duration) at $150/shift = $300
      const activityB = makeActivity('Flat Activity', [{ fundingSourceName: 'Grant B', percentage: 100 }]);
      const employee = makeEmployee({
        activityRates: [
          makeActivityRate(activityA.activityId, { payRate: 20 }),
          makeActivityRate(activityB.activityId, {
            payRateType: EmployeeActivityPayRateType.FlatRate,
            payRate: 150,
          }),
        ],
      });
      const hoursRows = [
        makeHoursRow(employee.employeeId, 'Hourly Activity', 4),
        makeHoursRow(employee.employeeId, 'Flat Activity', 2),
      ];
      // Grant A: 4 hrs × $20 = $80. Grant B: 2 shifts × $150 = $300. Total weighted cost = $380.
      const expenses = [makeExpense(employee.employeeId, 3800)];
      const activityMap = new Map([
        [activityA.activityName, activityA],
        [activityB.activityName, activityB],
      ]);
      const employeeMap = new Map([[employee.employeeId, employee]]);

      const rows = buildAllocationRows(hoursRows, expenses, [], activityMap, employeeMap, new Map());

      const grantA = rows.find((r) => r.fundingSourceName === 'Grant A')!;
      const grantB = rows.find((r) => r.fundingSourceName === 'Grant B')!;
      expect(grantA.wagesAllocation).toBe(800);
      expect(grantB.wagesAllocation).toBe(3000);
    });

    it('uses the bridge row\'s holidayPayRate instead of payRate when the hours row is flagged as a holiday', () => {
      const activity = makeActivity('Programs', [{ fundingSourceName: 'Grant A', percentage: 100 }]);
      const employee = makeEmployee({
        activityRates: [makeActivityRate(activity.activityId, { payRate: 20, holidayPayRate: 30 })],
      });
      const hoursRows = [makeHoursRow(employee.employeeId, 'Programs', 8, { IsHoliday: 'TRUE' })];
      // 8 hrs × $30 holiday rate = $240
      const expenses = [makeExpense(employee.employeeId, 240)];
      const activityMap = new Map([[activity.activityName, activity]]);
      const employeeMap = new Map([[employee.employeeId, employee]]);

      const rows = buildAllocationRows(hoursRows, expenses, [], activityMap, employeeMap, new Map());

      expect(rows).toHaveLength(1);
      expect(rows[0].wagesAllocation).toBe(240);
    });

    it('excludes an activity\'s contribution when the employee has no bridge row for it', () => {
      const activityA = makeActivity('Known Activity', [{ fundingSourceName: 'Grant A', percentage: 100 }]);
      const activityB = makeActivity('Unassigned Activity', [{ fundingSourceName: 'Grant B', percentage: 100 }]);
      // Employee only has a bridge row for Known Activity — Unassigned Activity resolves to $0 and
      // contributes nothing to the weighted cost, so all of the expense lands on Grant A.
      const employee = makeEmployee({ activityRates: [makeActivityRate(activityA.activityId, { payRate: 10 })] });
      const hoursRows = [
        makeHoursRow(employee.employeeId, 'Known Activity', 8),
        makeHoursRow(employee.employeeId, 'Unassigned Activity', 8),
      ];
      const expenses = [makeExpense(employee.employeeId, 1000)];
      const activityMap = new Map([
        [activityA.activityName, activityA],
        [activityB.activityName, activityB],
      ]);
      const employeeMap = new Map([[employee.employeeId, employee]]);

      const rows = buildAllocationRows(hoursRows, expenses, [], activityMap, employeeMap, new Map());

      const grantA = rows.find((r) => r.fundingSourceName === 'Grant A')!;
      const grantB = rows.find((r) => r.fundingSourceName === 'Grant B')!;
      expect(grantA.wagesAllocation).toBe(1000);
      expect(grantB.wagesAllocation).toBe(0);
    });

    it('distributes salaryAmount across a single salary-type activity by effective hourly rate', () => {
      // salaryAmount $2000 ÷ 40 hrs = $50/hr effective rate → 40 hrs × $50 = $2000 weighted cost,
      // all to Grant A, so wagesAllocation matches totalExpense exactly.
      const activity = makeActivity('Programs', [{ fundingSourceName: 'Grant A', percentage: 100 }]);
      const employee = makeEmployee({
        salaryAmount: 2000,
        activityRates: [makeActivityRate(activity.activityId, { payRateType: EmployeeActivityPayRateType.Salary })],
      });
      const hoursRows = [makeHoursRow(employee.employeeId, 'Programs', 40)];
      const expenses = [makeExpense(employee.employeeId, 2000)];
      const activityMap = new Map([[activity.activityName, activity]]);
      const employeeMap = new Map([[employee.employeeId, employee]]);

      const rows = buildAllocationRows(hoursRows, expenses, [], activityMap, employeeMap, new Map());

      expect(rows).toHaveLength(1);
      expect(rows[0].fundingSourceName).toBe('Grant A');
      expect(rows[0].wagesAllocation).toBe(2000);
    });

    it('splits salaryAmount across two salary-type activities by their hours proportion', () => {
      // salaryAmount $3000 ÷ 30 total salary hours = $100/hr effective rate
      // Activity A: 20 hrs × $100 = $2000. Activity B: 10 hrs × $100 = $1000. → 2/3 vs 1/3
      const activityA = makeActivity('Activity A', [{ fundingSourceName: 'Grant A', percentage: 100 }]);
      const activityB = makeActivity('Activity B', [{ fundingSourceName: 'Grant B', percentage: 100 }]);
      const employee = makeEmployee({
        salaryAmount: 3000,
        activityRates: [
          makeActivityRate(activityA.activityId, { payRateType: EmployeeActivityPayRateType.Salary }),
          makeActivityRate(activityB.activityId, { payRateType: EmployeeActivityPayRateType.Salary }),
        ],
      });
      const hoursRows = [
        makeHoursRow(employee.employeeId, 'Activity A', 20),
        makeHoursRow(employee.employeeId, 'Activity B', 10),
      ];
      const expenses = [makeExpense(employee.employeeId, 3000)];
      const activityMap = new Map([
        [activityA.activityName, activityA],
        [activityB.activityName, activityB],
      ]);
      const employeeMap = new Map([[employee.employeeId, employee]]);

      const rows = buildAllocationRows(hoursRows, expenses, [], activityMap, employeeMap, new Map());

      const grantA = rows.find((r) => r.fundingSourceName === 'Grant A')!;
      const grantB = rows.find((r) => r.fundingSourceName === 'Grant B')!;
      expect(grantA.wagesAllocation).toBe(2000);
      expect(grantB.wagesAllocation).toBe(1000);
    });

    it('calculates a salaried employee\'s hourly activity independently, additive on top of the salary split', () => {
      // Salary: $1000 ÷ 20 hrs = $50/hr effective rate → 20 hrs × $50 = $1000 weighted cost on Grant A.
      // Separately, an hourly on-call activity: 5 hrs × $30/hr = $150 weighted cost on Grant B.
      // Total weighted cost = $1150 → Grant A gets 1000/1150, Grant B gets 150/1150 of the $1150 expense.
      const salaryActivity = makeActivity('Salaried Work', [{ fundingSourceName: 'Grant A', percentage: 100 }]);
      const onCallActivity = makeActivity('On-Call', [{ fundingSourceName: 'Grant B', percentage: 100 }]);
      const employee = makeEmployee({
        salaryAmount: 1000,
        activityRates: [
          makeActivityRate(salaryActivity.activityId, { payRateType: EmployeeActivityPayRateType.Salary }),
          makeActivityRate(onCallActivity.activityId, { payRate: 30 }),
        ],
      });
      const hoursRows = [
        makeHoursRow(employee.employeeId, 'Salaried Work', 20),
        makeHoursRow(employee.employeeId, 'On-Call', 5),
      ];
      const expenses = [makeExpense(employee.employeeId, 1150)];
      const activityMap = new Map([
        [salaryActivity.activityName, salaryActivity],
        [onCallActivity.activityName, onCallActivity],
      ]);
      const employeeMap = new Map([[employee.employeeId, employee]]);

      const rows = buildAllocationRows(hoursRows, expenses, [], activityMap, employeeMap, new Map());

      const grantA = rows.find((r) => r.fundingSourceName === 'Grant A')!;
      const grantB = rows.find((r) => r.fundingSourceName === 'Grant B')!;
      expect(grantA.wagesAllocation).toBe(1000);
      expect(grantB.wagesAllocation).toBe(150);
    });

    it('resolves to a $0 effective rate when the employee has no hours logged against their salary-type activities', () => {
      const activity = makeActivity('Programs', [{ fundingSourceName: 'Grant A', percentage: 100 }]);
      const employee = makeEmployee({
        salaryAmount: 2000,
        activityRates: [makeActivityRate(activity.activityId, { payRateType: EmployeeActivityPayRateType.Salary })],
      });
      const expenses = [makeExpense(employee.employeeId, 2000)];
      const activityMap = new Map([[activity.activityName, activity]]);
      const employeeMap = new Map([[employee.employeeId, employee]]);

      // No hours rows at all → salaryHours is 0 → totalWeightedCost is 0 → employee excluded
      const rows = buildAllocationRows([], expenses, [], activityMap, employeeMap, new Map());

      expect(rows).toHaveLength(0);
    });
  });

  describe('edge cases', () => {
    it('returns empty array when there are no active employees with expenses', () => {
      const rows = buildAllocationRows([], [], [], new Map(), new Map(), new Map());
      expect(rows).toHaveLength(0);
    });

    it('skips unknown activities gracefully', () => {
      const activity = makeActivity('Known Activity', [{ fundingSourceName: 'Grant A', percentage: 100 }]);
      const employee = makeEmployee({ activityRates: [makeActivityRate(activity.activityId)] });
      const hoursRows = [
        makeHoursRow(employee.employeeId, 'Known Activity', 8),
        makeHoursRow(employee.employeeId, 'Unknown Activity', 4),
      ];
      const expenses = [makeExpense(employee.employeeId, 1000)];
      const activityMap = new Map([[activity.activityName, activity]]);
      const employeeMap = new Map([[employee.employeeId, employee]]);

      // Should still produce a result based on known activity rows only
      const rows = buildAllocationRows(hoursRows, expenses, [], activityMap, employeeMap, new Map());

      expect(rows).toHaveLength(1);
      expect(rows[0].wagesAllocation).toBe(1000);
    });

    it('skips employees not in the payroll config employeeMap', () => {
      const activity = makeActivity('Programs', [{ fundingSourceName: 'Grant A', percentage: 100 }]);
      const employee = makeEmployee({ activityRates: [makeActivityRate(activity.activityId)] });
      const hoursRows = [makeHoursRow(employee.employeeId, 'Programs', 8)];
      const expenses = [makeExpense(employee.employeeId, 1000)];
      const activityMap = new Map([[activity.activityName, activity]]);

      // Empty employeeMap — employee not found
      const rows = buildAllocationRows(hoursRows, expenses, [], activityMap, new Map(), new Map());

      expect(rows).toHaveLength(0);
    });

    it('rounds output values to 2 decimal places', () => {
      // 1 employee, 2 activities, 1/3 + 2/3 split → produces repeating decimals
      const activityA = makeActivity('Activity A', [{ fundingSourceName: 'Grant A', percentage: 100 }]);
      const activityB = makeActivity('Activity B', [{ fundingSourceName: 'Grant B', percentage: 100 }]);
      const employee = makeEmployee({
        activityRates: [makeActivityRate(activityA.activityId), makeActivityRate(activityB.activityId)],
      });
      const hoursRows = [
        makeHoursRow(employee.employeeId, 'Activity A', 1),
        makeHoursRow(employee.employeeId, 'Activity B', 2),
      ];
      const expenses = [makeExpense(employee.employeeId, 100)];
      const activityMap = new Map([
        [activityA.activityName, activityA],
        [activityB.activityName, activityB],
      ]);
      const employeeMap = new Map([[employee.employeeId, employee]]);

      const rows = buildAllocationRows(hoursRows, expenses, [], activityMap, employeeMap, new Map());

      // sorted descending: Grant B (2 hrs, 66.67) first, Grant A (1 hr, 33.33) last (gets remainder)
      const grantA = rows.find((r) => r.fundingSourceName === 'Grant A')!;
      const grantB = rows.find((r) => r.fundingSourceName === 'Grant B')!;
      expect(grantB.wagesAllocation).toBe(66.67);
      expect(grantA.wagesAllocation).toBe(33.33);
      expect(grantA.wagesAllocation + grantB.wagesAllocation).toBe(100);
    });

    it('last row absorbs remainder so wagesAllocation always sums to total employee expenses (3-way equal split)', () => {
      // $100 split 1/3 each → naive rounding gives $99.99; remainder fix gives $100.00
      const activityA = makeActivity('Activity A', [{ fundingSourceName: 'Grant A', percentage: 100 }]);
      const activityB = makeActivity('Activity B', [{ fundingSourceName: 'Grant B', percentage: 100 }]);
      const activityC = makeActivity('Activity C', [{ fundingSourceName: 'Grant C', percentage: 100 }]);
      const employee = makeEmployee({
        activityRates: [
          makeActivityRate(activityA.activityId),
          makeActivityRate(activityB.activityId),
          makeActivityRate(activityC.activityId),
        ],
      });
      const hoursRows = [
        makeHoursRow(employee.employeeId, 'Activity A', 1),
        makeHoursRow(employee.employeeId, 'Activity B', 1),
        makeHoursRow(employee.employeeId, 'Activity C', 1),
      ];
      const expenses = [makeExpense(employee.employeeId, 100)];
      const activityMap = new Map([
        [activityA.activityName, activityA],
        [activityB.activityName, activityB],
        [activityC.activityName, activityC],
      ]);
      const employeeMap = new Map([[employee.employeeId, employee]]);

      const rows = buildAllocationRows(hoursRows, expenses, [], activityMap, employeeMap, new Map());

      const wagesSum = rows.reduce((sum, row) => sum + row.wagesAllocation, 0);
      expect(wagesSum).toBe(100);
    });

    it('last row absorbs remainder so additionalExpenses always sums to total additional (3-way equal split)', () => {
      const activityA = makeActivity('Activity A', [{ fundingSourceName: 'Grant A', percentage: 100 }]);
      const activityB = makeActivity('Activity B', [{ fundingSourceName: 'Grant B', percentage: 100 }]);
      const activityC = makeActivity('Activity C', [{ fundingSourceName: 'Grant C', percentage: 100 }]);
      const employee = makeEmployee({
        activityRates: [
          makeActivityRate(activityA.activityId),
          makeActivityRate(activityB.activityId),
          makeActivityRate(activityC.activityId),
        ],
      });
      const hoursRows = [
        makeHoursRow(employee.employeeId, 'Activity A', 1),
        makeHoursRow(employee.employeeId, 'Activity B', 1),
        makeHoursRow(employee.employeeId, 'Activity C', 1),
      ];
      const expenses = [makeExpense(employee.employeeId, 300)];
      const additionalExpenses = [makeAdditional('HSA', 100)];
      const activityMap = new Map([
        [activityA.activityName, activityA],
        [activityB.activityName, activityB],
        [activityC.activityName, activityC],
      ]);
      const employeeMap = new Map([[employee.employeeId, employee]]);

      const rows = buildAllocationRows(hoursRows, expenses, additionalExpenses, activityMap, employeeMap, new Map());

      const additionalSum = rows.reduce((sum, row) => sum + row.additionalExpenses, 0);
      expect(additionalSum).toBe(100);
    });

    it('total equals wagesAllocation + additionalExpenses for each row', () => {
      const activityA = makeActivity('Activity A', [{ fundingSourceName: 'Grant A', percentage: 100 }]);
      const activityB = makeActivity('Activity B', [{ fundingSourceName: 'Grant B', percentage: 100 }]);
      const employee = makeEmployee({
        activityRates: [makeActivityRate(activityA.activityId), makeActivityRate(activityB.activityId)],
      });
      const hoursRows = [
        makeHoursRow(employee.employeeId, 'Activity A', 6),
        makeHoursRow(employee.employeeId, 'Activity B', 4),
      ];
      const expenses = [makeExpense(employee.employeeId, 1000)];
      const additionalExpenses = [makeAdditional('HSA', 500)];
      const activityMap = new Map([
        [activityA.activityName, activityA],
        [activityB.activityName, activityB],
      ]);
      const employeeMap = new Map([[employee.employeeId, employee]]);

      const rows = buildAllocationRows(hoursRows, expenses, additionalExpenses, activityMap, employeeMap, new Map());

      for (const row of rows) {
        expect(row.total).toBe(Math.round((row.wagesAllocation + row.additionalExpenses) * 100) / 100);
      }
    });

    it('sorts rows by wagesAllocation descending', () => {
      const activityA = makeActivity('Activity A', [{ fundingSourceName: 'Grant A', percentage: 100 }]);
      const activityB = makeActivity('Activity B', [{ fundingSourceName: 'Grant B', percentage: 100 }]);
      const activityC = makeActivity('Activity C', [{ fundingSourceName: 'Grant C', percentage: 100 }]);
      const employee = makeEmployee({
        activityRates: [
          makeActivityRate(activityA.activityId),
          makeActivityRate(activityB.activityId),
          makeActivityRate(activityC.activityId),
        ],
      });
      const hoursRows = [
        makeHoursRow(employee.employeeId, 'Activity A', 2),
        makeHoursRow(employee.employeeId, 'Activity B', 7),
        makeHoursRow(employee.employeeId, 'Activity C', 1),
      ];
      const expenses = [makeExpense(employee.employeeId, 1000)];
      const activityMap = new Map([
        [activityA.activityName, activityA],
        [activityB.activityName, activityB],
        [activityC.activityName, activityC],
      ]);
      const employeeMap = new Map([[employee.employeeId, employee]]);

      const rows = buildAllocationRows(hoursRows, expenses, [], activityMap, employeeMap, new Map());

      expect(rows[0].fundingSourceName).toBe('Grant B'); // 70%
      expect(rows[1].fundingSourceName).toBe('Grant A'); // 20%
      expect(rows[2].fundingSourceName).toBe('Grant C'); // 10%
    });
  });

  describe('hoursAllocation', () => {
    it('reports the raw hours worked for a single funding source', () => {
      const activity = makeActivity('Programs', [{ fundingSourceName: 'Grant A', percentage: 100 }]);
      const employee = makeEmployee({ activityRates: [makeActivityRate(activity.activityId)] });
      const hoursRows = [makeHoursRow(employee.employeeId, 'Programs', 8)];
      const expenses = [makeExpense(employee.employeeId, 2400)];
      const activityMap = new Map([[activity.activityName, activity]]);
      const employeeMap = new Map([[employee.employeeId, employee]]);

      const rows = buildAllocationRows(hoursRows, expenses, [], activityMap, employeeMap, new Map());

      expect(rows).toHaveLength(1);
      expect(rows[0].hoursAllocation).toBe(8);
    });

    it('is unaffected by pay rate — hours reflect actual time worked, not weighted dollar cost', () => {
      // Same 4 hrs on each activity, but Activity B pays 3x as much. Wages split 25/75, hours stay 50/50.
      const activityA = makeActivity('Activity A', [{ fundingSourceName: 'Grant A', percentage: 100 }]);
      const activityB = makeActivity('Activity B', [{ fundingSourceName: 'Grant B', percentage: 100 }]);
      const employee = makeEmployee({
        activityRates: [
          makeActivityRate(activityA.activityId, { payRate: 10 }),
          makeActivityRate(activityB.activityId, { payRate: 30 }),
        ],
      });
      const hoursRows = [
        makeHoursRow(employee.employeeId, 'Activity A', 4),
        makeHoursRow(employee.employeeId, 'Activity B', 4),
      ];
      const expenses = [makeExpense(employee.employeeId, 160)];
      const activityMap = new Map([
        [activityA.activityName, activityA],
        [activityB.activityName, activityB],
      ]);
      const employeeMap = new Map([[employee.employeeId, employee]]);

      const rows = buildAllocationRows(hoursRows, expenses, [], activityMap, employeeMap, new Map());

      const grantA = rows.find((r) => r.fundingSourceName === 'Grant A')!;
      const grantB = rows.find((r) => r.fundingSourceName === 'Grant B')!;
      expect(grantA.wagesAllocation).toBe(40);
      expect(grantB.wagesAllocation).toBe(120);
      expect(grantA.hoursAllocation).toBe(4);
      expect(grantB.hoursAllocation).toBe(4);
    });

    it('splits hours across funding sources by activity percentage, same as dollars', () => {
      const activity = makeActivity('Programs', [
        { fundingSourceName: 'Grant A', percentage: 60 },
        { fundingSourceName: 'Grant B', percentage: 40 },
      ]);
      const employee = makeEmployee({ activityRates: [makeActivityRate(activity.activityId)] });
      const hoursRows = [makeHoursRow(employee.employeeId, 'Programs', 10)];
      const expenses = [makeExpense(employee.employeeId, 1000)];
      const activityMap = new Map([[activity.activityName, activity]]);
      const employeeMap = new Map([[employee.employeeId, employee]]);

      const rows = buildAllocationRows(hoursRows, expenses, [], activityMap, employeeMap, new Map());

      const grantA = rows.find((r) => r.fundingSourceName === 'Grant A')!;
      const grantB = rows.find((r) => r.fundingSourceName === 'Grant B')!;
      expect(grantA.hoursAllocation).toBe(6);
      expect(grantB.hoursAllocation).toBe(4);
    });

    it('sums hoursAllocation across employees for the same funding source', () => {
      const activity = makeActivity('Programs', [{ fundingSourceName: 'Grant A', percentage: 100 }]);
      const emp1 = makeEmployee({ activityRates: [makeActivityRate(activity.activityId)] });
      const emp2 = makeEmployee({ activityRates: [makeActivityRate(activity.activityId)] });
      const hoursRows = [
        makeHoursRow(emp1.employeeId, 'Programs', 8),
        makeHoursRow(emp2.employeeId, 'Programs', 5),
      ];
      const expenses = [
        makeExpense(emp1.employeeId, 800),
        makeExpense(emp2.employeeId, 500),
      ];
      const activityMap = new Map([[activity.activityName, activity]]);
      const employeeMap = new Map([
        [emp1.employeeId, emp1],
        [emp2.employeeId, emp2],
      ]);

      const rows = buildAllocationRows(hoursRows, expenses, [], activityMap, employeeMap, new Map());

      expect(rows).toHaveLength(1);
      expect(rows[0].hoursAllocation).toBe(13);
    });

    it('excludes an employee\'s hours when they have no bridge row for the activity (contributes $0 and 0 hours to Grant B)', () => {
      const activityA = makeActivity('Known Activity', [{ fundingSourceName: 'Grant A', percentage: 100 }]);
      const activityB = makeActivity('Unassigned Activity', [{ fundingSourceName: 'Grant B', percentage: 100 }]);
      const employee = makeEmployee({ activityRates: [makeActivityRate(activityA.activityId, { payRate: 10 })] });
      const hoursRows = [
        makeHoursRow(employee.employeeId, 'Known Activity', 8),
        makeHoursRow(employee.employeeId, 'Unassigned Activity', 8),
      ];
      const expenses = [makeExpense(employee.employeeId, 1000)];
      const activityMap = new Map([
        [activityA.activityName, activityA],
        [activityB.activityName, activityB],
      ]);
      const employeeMap = new Map([[employee.employeeId, employee]]);

      const rows = buildAllocationRows(hoursRows, expenses, [], activityMap, employeeMap, new Map());

      // Unassigned Activity resolves to $0 rate, but its 8 hours are still real hours worked toward
      // Grant B — hours aren't zeroed out just because the dollar rate is $0.
      const grantA = rows.find((r) => r.fundingSourceName === 'Grant A')!;
      const grantB = rows.find((r) => r.fundingSourceName === 'Grant B')!;
      expect(grantA.hoursAllocation).toBe(8);
      expect(grantB.hoursAllocation).toBe(8);
    });

    it('last row absorbs remainder so hoursAllocation always sums to total hours worked (3-way split)', () => {
      const activityA = makeActivity('Activity A', [{ fundingSourceName: 'Grant A', percentage: 100 }]);
      const activityB = makeActivity('Activity B', [{ fundingSourceName: 'Grant B', percentage: 100 }]);
      const activityC = makeActivity('Activity C', [{ fundingSourceName: 'Grant C', percentage: 100 }]);
      const employee = makeEmployee({
        activityRates: [
          makeActivityRate(activityA.activityId),
          makeActivityRate(activityB.activityId),
          makeActivityRate(activityC.activityId),
        ],
      });
      const hoursRows = [
        makeHoursRow(employee.employeeId, 'Activity A', 1),
        makeHoursRow(employee.employeeId, 'Activity B', 1),
        makeHoursRow(employee.employeeId, 'Activity C', 1),
      ];
      const expenses = [makeExpense(employee.employeeId, 100)];
      const activityMap = new Map([
        [activityA.activityName, activityA],
        [activityB.activityName, activityB],
        [activityC.activityName, activityC],
      ]);
      const employeeMap = new Map([[employee.employeeId, employee]]);

      const rows = buildAllocationRows(hoursRows, expenses, [], activityMap, employeeMap, new Map());

      const hoursSum = rows.reduce((sum, row) => sum + row.hoursAllocation, 0);
      expect(hoursSum).toBe(3);
    });
  });

  describe('fringeAllocation', () => {
    it('applies the funding source\'s flat fringe rate to its own wagesAllocation', () => {
      // 25 hrs × $25/hr = $625 wages. 32% fringe → $200 fringe.
      const activity = makeActivity('Programs', [{ fundingSourceName: 'Grant A', percentage: 100 }]);
      const employee = makeEmployee({ activityRates: [makeActivityRate(activity.activityId, { payRate: 25 })] });
      const hoursRows = [makeHoursRow(employee.employeeId, 'Programs', 25)];
      const expenses = [makeExpense(employee.employeeId, 625)];
      const activityMap = new Map([[activity.activityName, activity]]);
      const employeeMap = new Map([[employee.employeeId, employee]]);
      const fundingSourceMap = makeFundingSourceMap([['Grant A', 32]]);

      const rows = buildAllocationRows(hoursRows, expenses, [], activityMap, employeeMap, fundingSourceMap);

      expect(rows).toHaveLength(1);
      expect(rows[0].wagesAllocation).toBe(625);
      expect(rows[0].fringeAllocation).toBe(200);
      expect(rows[0].total).toBe(825);
    });

    it('defaults to 0 fringe when the funding source has no configured fringeRate', () => {
      const activity = makeActivity('Programs', [{ fundingSourceName: 'Grant A', percentage: 100 }]);
      const employee = makeEmployee({ activityRates: [makeActivityRate(activity.activityId)] });
      const hoursRows = [makeHoursRow(employee.employeeId, 'Programs', 8)];
      const expenses = [makeExpense(employee.employeeId, 800)];
      const activityMap = new Map([[activity.activityName, activity]]);
      const employeeMap = new Map([[employee.employeeId, employee]]);
      const fundingSourceMap = makeFundingSourceMap([['Grant A', null]]);

      const rows = buildAllocationRows(hoursRows, expenses, [], activityMap, employeeMap, fundingSourceMap);

      expect(rows[0].fringeAllocation).toBe(0);
      expect(rows[0].total).toBe(800);
    });

    it('defaults to 0 fringe when the funding source is not in the map at all', () => {
      const activity = makeActivity('Programs', [{ fundingSourceName: 'Grant A', percentage: 100 }]);
      const employee = makeEmployee({ activityRates: [makeActivityRate(activity.activityId)] });
      const hoursRows = [makeHoursRow(employee.employeeId, 'Programs', 8)];
      const expenses = [makeExpense(employee.employeeId, 800)];
      const activityMap = new Map([[activity.activityName, activity]]);
      const employeeMap = new Map([[employee.employeeId, employee]]);

      const rows = buildAllocationRows(hoursRows, expenses, [], activityMap, employeeMap, new Map());

      expect(rows[0].fringeAllocation).toBe(0);
      expect(rows[0].total).toBe(800);
    });

    it('applies each funding source\'s own fringe rate independently when wages are split across sources', () => {
      // 60/40 hours split → $600 / $400 wages. Grant A fringe 20% → $120. Grant B fringe 50% → $200.
      const activityA = makeActivity('Activity A', [{ fundingSourceName: 'Grant A', percentage: 100 }]);
      const activityB = makeActivity('Activity B', [{ fundingSourceName: 'Grant B', percentage: 100 }]);
      const employee = makeEmployee({
        activityRates: [makeActivityRate(activityA.activityId), makeActivityRate(activityB.activityId)],
      });
      const hoursRows = [
        makeHoursRow(employee.employeeId, 'Activity A', 6),
        makeHoursRow(employee.employeeId, 'Activity B', 4),
      ];
      const expenses = [makeExpense(employee.employeeId, 1000)];
      const activityMap = new Map([
        [activityA.activityName, activityA],
        [activityB.activityName, activityB],
      ]);
      const employeeMap = new Map([[employee.employeeId, employee]]);
      const fundingSourceMap = makeFundingSourceMap([
        ['Grant A', 20],
        ['Grant B', 50],
      ]);

      const rows = buildAllocationRows(hoursRows, expenses, [], activityMap, employeeMap, fundingSourceMap);

      const grantA = rows.find((r) => r.fundingSourceName === 'Grant A')!;
      const grantB = rows.find((r) => r.fundingSourceName === 'Grant B')!;
      expect(grantA.wagesAllocation).toBe(600);
      expect(grantA.fringeAllocation).toBe(120);
      expect(grantA.total).toBe(720);
      expect(grantB.wagesAllocation).toBe(400);
      expect(grantB.fringeAllocation).toBe(200);
      expect(grantB.total).toBe(600);
    });

    it('folds fringeAllocation into total alongside wages and additionalExpenses', () => {
      const activity = makeActivity('Programs', [{ fundingSourceName: 'Grant A', percentage: 100 }]);
      const employee = makeEmployee({ activityRates: [makeActivityRate(activity.activityId)] });
      const hoursRows = [makeHoursRow(employee.employeeId, 'Programs', 8)];
      const expenses = [makeExpense(employee.employeeId, 800)];
      const additionalExpenses = [makeAdditional('HSA', 100)];
      const activityMap = new Map([[activity.activityName, activity]]);
      const employeeMap = new Map([[employee.employeeId, employee]]);
      const fundingSourceMap = makeFundingSourceMap([['Grant A', 25]]);

      const rows = buildAllocationRows(hoursRows, expenses, additionalExpenses, activityMap, employeeMap, fundingSourceMap);

      // wages 800, fringe 800 * 25% = 200, additional 100 → total 1100
      expect(rows[0].wagesAllocation).toBe(800);
      expect(rows[0].fringeAllocation).toBe(200);
      expect(rows[0].additionalExpenses).toBe(100);
      expect(rows[0].total).toBe(1100);
    });
  });
});
