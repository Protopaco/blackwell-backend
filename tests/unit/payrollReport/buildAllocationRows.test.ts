import { describe, it, expect } from 'vitest';
import buildAllocationRows from '#services/payrollReport/buildAllocationRows.js';
import Employee from '#models/Employee.js';
import Activity, { ActivityFundingSource } from '#models/Activity.js';
import EmployeeExpense from '#models/EmployeeExpense.js';
import AdditionalExpense from '#models/AdditionalExpense.js';
import PayrollReportHoursRow from '#models/PayrollReportHoursRow.js';
import { PayRate } from '#models/PayRate.js';
import { PayrollCategory } from '#models/PayrollCategory.js';
import { EmployeeStatus } from '#models/EmployeeStatus.js';

// ─── Factories ────────────────────────────────────────────────────────────────

const makeEmployee = (overrides: Partial<Employee> = {}): Employee => ({
  employeeId: crypto.randomUUID(),
  firstName: 'Jane',
  lastName: 'Smith',
  position: 'Coordinator',
  hourlyPayRate1: 20.00,
  hourlyPayRate2: 25.00,
  flatPayRate1: 100.00,
  flatPayRate2: 150.00,
  holidayPayRate: 30.00,
  email: 'jane@example.com',
  status: EmployeeStatus.Active,
  timesheetFileLink: '',
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
  trackSeparately: false,
  payrollCategory: PayrollCategory.Regular,
  payRate: PayRate.HourlyPayRate1,
  fundingSources,
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

const makeExpense = (employeeId: string, totalExpense: number | null, activeThisPayPeriod = true): EmployeeExpense => ({
  employeeId,
  employeeName: 'Jane Smith',
  activeThisPayPeriod,
  totalExpense,
});

const makeAdditional = (expenseName: string, amount: number): AdditionalExpense => ({
  expenseName,
  amount,
});

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('buildAllocationRows', () => {
  describe('basic allocation', () => {
    it('returns one row for a single funding source', () => {
      const employee = makeEmployee({ hourlyPayRate1: 20 });
      const activity = makeActivity('Programs', [{ fundingSourceName: 'Grant A', percentage: 100 }]);
      const hoursRows = [makeHoursRow(employee.employeeId, 'Programs', 8)];
      const expenses = [makeExpense(employee.employeeId, 2400)];
      const activityMap = new Map([[activity.activityName, activity]]);
      const employeeMap = new Map([[employee.employeeId, employee]]);

      const rows = buildAllocationRows(hoursRows, expenses, [], activityMap, employeeMap);

      expect(rows).toHaveLength(1);
      expect(rows[0].fundingSourceName).toBe('Grant A');
      expect(rows[0].wagesAllocation).toBe(2400);
      expect(rows[0].additionalExpenses).toBe(0);
      expect(rows[0].total).toBe(2400);
    });

    it('splits a single employee across two funding sources by hours proportion', () => {
      const employee = makeEmployee({ hourlyPayRate1: 20 });
      // Activity A: 100% Grant A. Activity B: 100% Grant B.
      // 6 hrs on A, 4 hrs on B → Grant A = 60%, Grant B = 40%
      const activityA = makeActivity('Activity A', [{ fundingSourceName: 'Grant A', percentage: 100 }]);
      const activityB = makeActivity('Activity B', [{ fundingSourceName: 'Grant B', percentage: 100 }]);
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

      const rows = buildAllocationRows(hoursRows, expenses, [], activityMap, employeeMap);

      expect(rows).toHaveLength(2);
      const grantA = rows.find((r) => r.fundingSourceName === 'Grant A')!;
      const grantB = rows.find((r) => r.fundingSourceName === 'Grant B')!;
      expect(grantA.wagesAllocation).toBe(600);
      expect(grantB.wagesAllocation).toBe(400);
    });

    it('splits a single activity across two funding sources by percentage', () => {
      const employee = makeEmployee({ hourlyPayRate1: 20 });
      // One activity split 60% Grant A / 40% Grant B
      const activity = makeActivity('Programs', [
        { fundingSourceName: 'Grant A', percentage: 60 },
        { fundingSourceName: 'Grant B', percentage: 40 },
      ]);
      const hoursRows = [makeHoursRow(employee.employeeId, 'Programs', 10)];
      const expenses = [makeExpense(employee.employeeId, 1000)];
      const activityMap = new Map([[activity.activityName, activity]]);
      const employeeMap = new Map([[employee.employeeId, employee]]);

      const rows = buildAllocationRows(hoursRows, expenses, [], activityMap, employeeMap);

      expect(rows).toHaveLength(2);
      const grantA = rows.find((r) => r.fundingSourceName === 'Grant A')!;
      const grantB = rows.find((r) => r.fundingSourceName === 'Grant B')!;
      expect(grantA.wagesAllocation).toBe(600);
      expect(grantB.wagesAllocation).toBe(400);
    });
  });

  describe('multiple employees', () => {
    it('sums allocations across employees for the same funding source', () => {
      const emp1 = makeEmployee({ hourlyPayRate1: 20 });
      const emp2 = makeEmployee({ hourlyPayRate1: 20 });
      const activity = makeActivity('Programs', [{ fundingSourceName: 'Grant A', percentage: 100 }]);
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

      const rows = buildAllocationRows(hoursRows, expenses, [], activityMap, employeeMap);

      expect(rows).toHaveLength(1);
      expect(rows[0].wagesAllocation).toBe(3000);
    });

    it('uses each employee\'s individual hours to compute their proportion when they work different activities', () => {
      // emp1: 10 hrs on Grant A activity → 100% Grant A → $1000 to Grant A
      // emp2: 5 hrs on Grant A, 5 hrs on Grant B → 50/50 → $500 Grant A, $500 Grant B
      const emp1 = makeEmployee({ hourlyPayRate1: 20 });
      const emp2 = makeEmployee({ hourlyPayRate1: 20 });
      const activityA = makeActivity('Activity A', [{ fundingSourceName: 'Grant A', percentage: 100 }]);
      const activityB = makeActivity('Activity B', [{ fundingSourceName: 'Grant B', percentage: 100 }]);
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

      const rows = buildAllocationRows(hoursRows, expenses, [], activityMap, employeeMap);

      const grantA = rows.find((r) => r.fundingSourceName === 'Grant A')!;
      const grantB = rows.find((r) => r.fundingSourceName === 'Grant B')!;
      expect(grantA.wagesAllocation).toBe(1500);
      expect(grantB.wagesAllocation).toBe(500);
    });

    it('pay rates do not affect proportions when all activities use the same rate type', () => {
      // emp1 has rate $10, emp2 has rate $40 — but same activity proportions
      // Grant A gets 100% of both employees' expenses
      const emp1 = makeEmployee({ hourlyPayRate1: 10 });
      const emp2 = makeEmployee({ hourlyPayRate1: 40 });
      const activity = makeActivity('Programs', [{ fundingSourceName: 'Grant A', percentage: 100 }]);
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

      const rows = buildAllocationRows(hoursRows, expenses, [], activityMap, employeeMap);

      expect(rows).toHaveLength(1);
      expect(rows[0].wagesAllocation).toBe(4200);
    });

    it('uses each employee\'s own pay rate to weight proportions across activities', () => {
      // emp1: rate $10. 4 hrs on Grant A ($40), 4 hrs on Grant B ($40) → 50% each
      // emp2: rate $20. 8 hrs on Grant A ($160), 2 hrs on Grant B ($40) → 80% / 20%
      const emp1 = makeEmployee({ hourlyPayRate1: 10 });
      const emp2 = makeEmployee({ hourlyPayRate1: 20 });
      const activityA = makeActivity('Activity A', [{ fundingSourceName: 'Grant A', percentage: 100 }]);
      const activityB = makeActivity('Activity B', [{ fundingSourceName: 'Grant B', percentage: 100 }]);
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

      const rows = buildAllocationRows(hoursRows, expenses, [], activityMap, employeeMap);

      // emp1: 50% each → $500 Grant A, $500 Grant B
      // emp2: 80% / 20% → $800 Grant A, $200 Grant B
      const grantA = rows.find((r) => r.fundingSourceName === 'Grant A')!;
      const grantB = rows.find((r) => r.fundingSourceName === 'Grant B')!;
      expect(grantA.wagesAllocation).toBe(1300);
      expect(grantB.wagesAllocation).toBe(700);
    });
  });

  describe('filtering active employees', () => {
    it('excludes employees where activeThisPayPeriod is false', () => {
      const activeEmployee = makeEmployee();
      const inactiveEmployee = makeEmployee();
      const activity = makeActivity('Programs', [{ fundingSourceName: 'Grant A', percentage: 100 }]);
      const hoursRows = [
        makeHoursRow(activeEmployee.employeeId, 'Programs', 8),
        makeHoursRow(inactiveEmployee.employeeId, 'Programs', 8),
      ];
      const expenses = [
        makeExpense(activeEmployee.employeeId, 1000),
        makeExpense(inactiveEmployee.employeeId, 1000, false),
      ];
      const activityMap = new Map([[activity.activityName, activity]]);
      const employeeMap = new Map([
        [activeEmployee.employeeId, activeEmployee],
        [inactiveEmployee.employeeId, inactiveEmployee],
      ]);

      const rows = buildAllocationRows(hoursRows, expenses, [], activityMap, employeeMap);

      expect(rows).toHaveLength(1);
      expect(rows[0].wagesAllocation).toBe(1000);
    });

    it('excludes employees where totalExpense is null', () => {
      const employee = makeEmployee();
      const activity = makeActivity('Programs', [{ fundingSourceName: 'Grant A', percentage: 100 }]);
      const hoursRows = [makeHoursRow(employee.employeeId, 'Programs', 8)];
      const expenses = [makeExpense(employee.employeeId, null)];
      const activityMap = new Map([[activity.activityName, activity]]);
      const employeeMap = new Map([[employee.employeeId, employee]]);

      const rows = buildAllocationRows(hoursRows, expenses, [], activityMap, employeeMap);

      expect(rows).toHaveLength(0);
    });

    it('excludes employees who have no hours in current_hours (totalWeightedCost = 0)', () => {
      const employee = makeEmployee();
      const activity = makeActivity('Programs', [{ fundingSourceName: 'Grant A', percentage: 100 }]);
      const expenses = [makeExpense(employee.employeeId, 1000)];
      const activityMap = new Map([[activity.activityName, activity]]);
      const employeeMap = new Map([[employee.employeeId, employee]]);

      // No hours rows at all
      const rows = buildAllocationRows([], expenses, [], activityMap, employeeMap);

      expect(rows).toHaveLength(0);
    });
  });

  describe('additional expenses', () => {
    it('distributes additional expenses by funding source wage share', () => {
      const employee = makeEmployee({ hourlyPayRate1: 20 });
      const activityA = makeActivity('Activity A', [{ fundingSourceName: 'Grant A', percentage: 100 }]);
      const activityB = makeActivity('Activity B', [{ fundingSourceName: 'Grant B', percentage: 100 }]);
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

      const rows = buildAllocationRows(hoursRows, expenses, additionalExpenses, activityMap, employeeMap);

      const grantA = rows.find((r) => r.fundingSourceName === 'Grant A')!;
      const grantB = rows.find((r) => r.fundingSourceName === 'Grant B')!;
      // wages: $750 / $250. shares: 75% / 25%. additional: $300 / $100
      expect(grantA.additionalExpenses).toBe(300);
      expect(grantB.additionalExpenses).toBe(100);
      expect(grantA.total).toBe(1050);
      expect(grantB.total).toBe(350);
    });

    it('distributes multiple additional expense items combined', () => {
      const employee = makeEmployee({ hourlyPayRate1: 20 });
      const activity = makeActivity('Programs', [{ fundingSourceName: 'Grant A', percentage: 100 }]);
      const hoursRows = [makeHoursRow(employee.employeeId, 'Programs', 8)];
      const expenses = [makeExpense(employee.employeeId, 1000)];
      const additionalExpenses = [
        makeAdditional('HSA', 200),
        makeAdditional('Dental', 100),
        makeAdditional('Vision', 50),
      ];
      const activityMap = new Map([[activity.activityName, activity]]);
      const employeeMap = new Map([[employee.employeeId, employee]]);

      const rows = buildAllocationRows(hoursRows, expenses, additionalExpenses, activityMap, employeeMap);

      expect(rows[0].additionalExpenses).toBe(350);
      expect(rows[0].total).toBe(1350);
    });

    it('sets additionalExpenses to 0 when additional expenses list is empty', () => {
      const employee = makeEmployee();
      const activity = makeActivity('Programs', [{ fundingSourceName: 'Grant A', percentage: 100 }]);
      const hoursRows = [makeHoursRow(employee.employeeId, 'Programs', 8)];
      const expenses = [makeExpense(employee.employeeId, 1000)];
      const activityMap = new Map([[activity.activityName, activity]]);
      const employeeMap = new Map([[employee.employeeId, employee]]);

      const rows = buildAllocationRows(hoursRows, expenses, [], activityMap, employeeMap);

      expect(rows[0].additionalExpenses).toBe(0);
      expect(rows[0].total).toBe(rows[0].wagesAllocation);
    });
  });

  describe('pay rate types', () => {
    it('uses hourlyPayRate2 when activity payRate is HourlyPayRate2', () => {
      // Two activities: one HourlyPayRate1 ($10), one HourlyPayRate2 ($30)
      // Same hours → different weighted costs → different proportions
      const employee = makeEmployee({ hourlyPayRate1: 10, hourlyPayRate2: 30 });
      const activityA = makeActivity('Activity A', [{ fundingSourceName: 'Grant A', percentage: 100 }], { payRate: PayRate.HourlyPayRate1 });
      const activityB = makeActivity('Activity B', [{ fundingSourceName: 'Grant B', percentage: 100 }], { payRate: PayRate.HourlyPayRate2 });
      // 4 hrs × $10 = $40 (Grant A), 4 hrs × $30 = $120 (Grant B) → 25% / 75%
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

      const rows = buildAllocationRows(hoursRows, expenses, [], activityMap, employeeMap);

      const grantA = rows.find((r) => r.fundingSourceName === 'Grant A')!;
      const grantB = rows.find((r) => r.fundingSourceName === 'Grant B')!;
      expect(grantA.wagesAllocation).toBe(250);
      expect(grantB.wagesAllocation).toBe(750);
    });

    it('uses flatPayRate1 when activity payRate is FlatPayRate1', () => {
      const employee = makeEmployee({ hourlyPayRate1: 20, flatPayRate1: 50 });
      const activityA = makeActivity('Hourly Activity', [{ fundingSourceName: 'Grant A', percentage: 100 }], { payRate: PayRate.HourlyPayRate1 });
      const activityB = makeActivity('Flat Activity', [{ fundingSourceName: 'Grant B', percentage: 100 }], { payRate: PayRate.FlatPayRate1 });
      // 4 hrs × $20 = $80 (Grant A), 4 hrs × $50 = $200 (Grant B) → 28.57% / 71.43%
      const hoursRows = [
        makeHoursRow(employee.employeeId, 'Hourly Activity', 4),
        makeHoursRow(employee.employeeId, 'Flat Activity', 4),
      ];
      const expenses = [makeExpense(employee.employeeId, 2800)];
      const activityMap = new Map([
        [activityA.activityName, activityA],
        [activityB.activityName, activityB],
      ]);
      const employeeMap = new Map([[employee.employeeId, employee]]);

      const rows = buildAllocationRows(hoursRows, expenses, [], activityMap, employeeMap);

      // $80 / ($80 + $200) = 2/7 → $800. $200 / $280 = 5/7 → $2000
      const grantA = rows.find((r) => r.fundingSourceName === 'Grant A')!;
      const grantB = rows.find((r) => r.fundingSourceName === 'Grant B')!;
      expect(grantA.wagesAllocation).toBe(800);
      expect(grantB.wagesAllocation).toBe(2000);
    });
  });

  describe('edge cases', () => {
    it('returns empty array when there are no active employees with expenses', () => {
      const rows = buildAllocationRows([], [], [], new Map(), new Map());
      expect(rows).toHaveLength(0);
    });

    it('returns empty array when all employees are inactive', () => {
      const employee = makeEmployee();
      const activity = makeActivity('Programs', [{ fundingSourceName: 'Grant A', percentage: 100 }]);
      const hoursRows = [makeHoursRow(employee.employeeId, 'Programs', 8)];
      const expenses = [makeExpense(employee.employeeId, 1000, false)];
      const activityMap = new Map([[activity.activityName, activity]]);
      const employeeMap = new Map([[employee.employeeId, employee]]);

      const rows = buildAllocationRows(hoursRows, expenses, [], activityMap, employeeMap);

      expect(rows).toHaveLength(0);
    });

    it('skips unknown activities gracefully', () => {
      const employee = makeEmployee();
      const activity = makeActivity('Known Activity', [{ fundingSourceName: 'Grant A', percentage: 100 }]);
      const hoursRows = [
        makeHoursRow(employee.employeeId, 'Known Activity', 8),
        makeHoursRow(employee.employeeId, 'Unknown Activity', 4),
      ];
      const expenses = [makeExpense(employee.employeeId, 1000)];
      const activityMap = new Map([[activity.activityName, activity]]);
      const employeeMap = new Map([[employee.employeeId, employee]]);

      // Should still produce a result based on known activity rows only
      const rows = buildAllocationRows(hoursRows, expenses, [], activityMap, employeeMap);

      expect(rows).toHaveLength(1);
      expect(rows[0].wagesAllocation).toBe(1000);
    });

    it('skips employees not in the payroll config employeeMap', () => {
      const employee = makeEmployee();
      const activity = makeActivity('Programs', [{ fundingSourceName: 'Grant A', percentage: 100 }]);
      const hoursRows = [makeHoursRow(employee.employeeId, 'Programs', 8)];
      const expenses = [makeExpense(employee.employeeId, 1000)];
      const activityMap = new Map([[activity.activityName, activity]]);

      // Empty employeeMap — employee not found
      const rows = buildAllocationRows(hoursRows, expenses, [], activityMap, new Map());

      expect(rows).toHaveLength(0);
    });

    it('rounds output values to 2 decimal places', () => {
      // 1 employee, 2 activities, 1/3 + 2/3 split → produces repeating decimals
      const employee = makeEmployee({ hourlyPayRate1: 10 });
      const activityA = makeActivity('Activity A', [{ fundingSourceName: 'Grant A', percentage: 100 }]);
      const activityB = makeActivity('Activity B', [{ fundingSourceName: 'Grant B', percentage: 100 }]);
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

      const rows = buildAllocationRows(hoursRows, expenses, [], activityMap, employeeMap);

      // sorted descending: Grant B (2 hrs, 66.67) first, Grant A (1 hr, 33.33) last (gets remainder)
      const grantA = rows.find((r) => r.fundingSourceName === 'Grant A')!;
      const grantB = rows.find((r) => r.fundingSourceName === 'Grant B')!;
      expect(grantB.wagesAllocation).toBe(66.67);
      expect(grantA.wagesAllocation).toBe(33.33);
      expect(grantA.wagesAllocation + grantB.wagesAllocation).toBe(100);
    });

    it('last row absorbs remainder so wagesAllocation always sums to total employee expenses (3-way equal split)', () => {
      // $100 split 1/3 each → naive rounding gives $99.99; remainder fix gives $100.00
      const employee = makeEmployee({ hourlyPayRate1: 10 });
      const activityA = makeActivity('Activity A', [{ fundingSourceName: 'Grant A', percentage: 100 }]);
      const activityB = makeActivity('Activity B', [{ fundingSourceName: 'Grant B', percentage: 100 }]);
      const activityC = makeActivity('Activity C', [{ fundingSourceName: 'Grant C', percentage: 100 }]);
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

      const rows = buildAllocationRows(hoursRows, expenses, [], activityMap, employeeMap);

      const wagesSum = rows.reduce((sum, row) => sum + row.wagesAllocation, 0);
      expect(wagesSum).toBe(100);
    });

    it('last row absorbs remainder so additionalExpenses always sums to total additional (3-way equal split)', () => {
      const employee = makeEmployee({ hourlyPayRate1: 10 });
      const activityA = makeActivity('Activity A', [{ fundingSourceName: 'Grant A', percentage: 100 }]);
      const activityB = makeActivity('Activity B', [{ fundingSourceName: 'Grant B', percentage: 100 }]);
      const activityC = makeActivity('Activity C', [{ fundingSourceName: 'Grant C', percentage: 100 }]);
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

      const rows = buildAllocationRows(hoursRows, expenses, additionalExpenses, activityMap, employeeMap);

      const additionalSum = rows.reduce((sum, row) => sum + row.additionalExpenses, 0);
      expect(additionalSum).toBe(100);
    });

    it('total equals wagesAllocation + additionalExpenses for each row', () => {
      const employee = makeEmployee({ hourlyPayRate1: 20 });
      const activityA = makeActivity('Activity A', [{ fundingSourceName: 'Grant A', percentage: 100 }]);
      const activityB = makeActivity('Activity B', [{ fundingSourceName: 'Grant B', percentage: 100 }]);
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

      const rows = buildAllocationRows(hoursRows, expenses, additionalExpenses, activityMap, employeeMap);

      for (const row of rows) {
        expect(row.total).toBe(
          Math.round((row.wagesAllocation + row.additionalExpenses) * 100) / 100,
        );
      }
    });

    it('sorts rows by wagesAllocation descending', () => {
      const employee = makeEmployee({ hourlyPayRate1: 20 });
      const activityA = makeActivity('Activity A', [{ fundingSourceName: 'Grant A', percentage: 100 }]);
      const activityB = makeActivity('Activity B', [{ fundingSourceName: 'Grant B', percentage: 100 }]);
      const activityC = makeActivity('Activity C', [{ fundingSourceName: 'Grant C', percentage: 100 }]);
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

      const rows = buildAllocationRows(hoursRows, expenses, [], activityMap, employeeMap);

      expect(rows[0].fundingSourceName).toBe('Grant B'); // 70%
      expect(rows[1].fundingSourceName).toBe('Grant A'); // 20%
      expect(rows[2].fundingSourceName).toBe('Grant C'); // 10%
    });
  });
});
