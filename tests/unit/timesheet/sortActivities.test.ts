import { describe, it, expect } from 'vitest';
import sortActivities from '#services/timesheet/sortActivities.js';
import Activity from '#models/Activity.js';
import EmployeeActivityRateInput from '#models/EmployeeActivityRateInput.js';
import { PayrollCategory } from '#models/PayrollCategory.js';

const makeActivity = (
  activityName: string,
  payrollCategory: string,
  groupLabel: string | null = null,
  sortOrder = 0,
): Activity => ({
  activityId: crypto.randomUUID(),
  activityName,
  payrollCategory: payrollCategory as any,
  groupLabel,
  sortOrder,
  fundingSources: [],
});

const makeActivityRate = (
  activityId: string,
  payRateType: EmployeeActivityRateInput['payRateType'],
): EmployeeActivityRateInput => ({
  activityId,
  payRateType,
  payRate: 20,
  holidayPayRate: 25,
});

const programs = makeActivity('Programs', PayrollCategory.Regular, null, 2);
const admin = makeActivity('Admin', PayrollCategory.Regular, null, 0);
const management = makeActivity('Management', PayrollCategory.Regular, null, 1);
const pto = makeActivity('PTO', PayrollCategory.PTO, null, 1);
const eto = makeActivity('ETO', PayrollCategory.ETO, null, 0);
const sto = makeActivity('STO', PayrollCategory.STO, null, 2);
const onCall = makeActivity('On-Call', PayrollCategory.Regular, null, 0);
const weekendCoverage = makeActivity('Weekend Coverage', PayrollCategory.Regular, null, 1);

const mockActivities: Activity[] = [programs, admin, management, pto, eto, sto, onCall, weekendCoverage];

const mockActivityRates: EmployeeActivityRateInput[] = [
  makeActivityRate(programs.activityId, 'Hourly'),
  makeActivityRate(admin.activityId, 'Hourly'),
  makeActivityRate(management.activityId, 'Salary'),
  makeActivityRate(pto.activityId, 'Hourly'),
  makeActivityRate(eto.activityId, 'Hourly'),
  makeActivityRate(sto.activityId, 'Hourly'),
  makeActivityRate(onCall.activityId, 'FlatRate'),
  makeActivityRate(weekendCoverage.activityId, 'FlatRate'),
];

// Flattens a bucket's groups back into a single activityName list, in row order, for assertions that
// don't care about group boundaries.
const flattenNames = (groups: { activities: Activity[] }[]): string[] =>
  groups.flatMap((group) => group.activities.map((activity) => activity.activityName));

describe('sortActivities', () => {
  it('separates work, time off, and flat rate activities', () => {
    const { workActivities, timeOffActivities, flatRateActivities } = sortActivities(mockActivities, mockActivityRates);

    expect(flattenNames(workActivities)).toHaveLength(3);
    expect(flattenNames(timeOffActivities)).toHaveLength(3);
    expect(flattenNames(flatRateActivities)).toHaveLength(2);
  });

  it('orders ungrouped activities by their own sortOrder', () => {
    const { workActivities, timeOffActivities, flatRateActivities } = sortActivities(mockActivities, mockActivityRates);

    expect(flattenNames(workActivities)).toEqual(['Admin', 'Management', 'Programs']);
    expect(flattenNames(timeOffActivities)).toEqual(['ETO', 'PTO', 'STO']);
    expect(flattenNames(flatRateActivities)).toEqual(['On-Call', 'Weekend Coverage']);
  });

  it('puts Salary activities in the work group, alongside Hourly', () => {
    const { workActivities } = sortActivities(mockActivities, mockActivityRates);
    expect(flattenNames(workActivities)).toContain('Management');
  });

  it('puts FlatRate activities in the flat rate group regardless of payroll category', () => {
    const { flatRateActivities } = sortActivities(mockActivities, mockActivityRates);
    expect(flattenNames(flatRateActivities)).toEqual(
      expect.arrayContaining(['On-Call', 'Weekend Coverage']),
    );
  });

  it('puts ETO PTO STO in time off group', () => {
    const { timeOffActivities } = sortActivities(mockActivities, mockActivityRates);
    const categories = timeOffActivities.flatMap((group) => group.activities.map((activity) => activity.payrollCategory));
    expect(categories).toContain(PayrollCategory.ETO);
    expect(categories).toContain(PayrollCategory.PTO);
    expect(categories).toContain(PayrollCategory.STO);
  });

  it('handles empty activity list', () => {
    const { workActivities, timeOffActivities, flatRateActivities } = sortActivities([], []);
    expect(workActivities).toHaveLength(0);
    expect(timeOffActivities).toHaveLength(0);
    expect(flatRateActivities).toHaveLength(0);
  });

  describe('grouping', () => {
    it('puts ungrouped activities first, ordered by their own sortOrder, as a single groupLabel-null entry', () => {
      const activities = [
        makeActivity('Zeta', PayrollCategory.Regular, null, 1),
        makeActivity('Alpha', PayrollCategory.Regular, null, 0),
      ];
      const rates = activities.map((activity) => makeActivityRate(activity.activityId, 'Hourly'));

      const { workActivities } = sortActivities(activities, rates);

      expect(workActivities[0]).toEqual({
        groupLabel: null,
        activities: [activities[1], activities[0]],
      });
    });

    it('orders named groups alphabetically by groupLabel, after the ungrouped entry', () => {
      const ungrouped = makeActivity('Solo', PayrollCategory.Regular, null, 0);
      const zGroupMember = makeActivity('Z Member', PayrollCategory.Regular, 'Zeta Group', 0);
      const aGroupMember = makeActivity('A Member', PayrollCategory.Regular, 'Alpha Group', 0);
      const activities = [zGroupMember, ungrouped, aGroupMember];
      const rates = activities.map((activity) => makeActivityRate(activity.activityId, 'Hourly'));

      const { workActivities } = sortActivities(activities, rates);

      expect(workActivities.map((group) => group.groupLabel)).toEqual([null, 'Alpha Group', 'Zeta Group']);
    });

    it('orders activities within a named group by their own sortOrder', () => {
      const second = makeActivity('Second', PayrollCategory.Regular, 'Group', 1);
      const first = makeActivity('First', PayrollCategory.Regular, 'Group', 0);
      const activities = [second, first];
      const rates = activities.map((activity) => makeActivityRate(activity.activityId, 'Hourly'));

      const { workActivities } = sortActivities(activities, rates);

      expect(workActivities).toEqual([
        { groupLabel: 'Group', activities: [first, second] },
      ]);
    });

    it('omits the ungrouped entry entirely when every activity in the bucket is grouped', () => {
      const activities = [makeActivity('Member', PayrollCategory.Regular, 'Group', 0)];
      const rates = activities.map((activity) => makeActivityRate(activity.activityId, 'Hourly'));

      const { workActivities } = sortActivities(activities, rates);

      expect(workActivities.map((group) => group.groupLabel)).toEqual(['Group']);
    });
  });
});
