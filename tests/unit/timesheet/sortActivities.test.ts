import { describe, it, expect } from 'vitest';
import sortActivities from '#services/timesheet/sortActivities.js';
import Activity from '#models/Activity.js';
import { PayrollCategory } from '#models/PayrollCategory.js';

const makeActivity = (
  activityName: string,
  payrollCategory: string,
): Activity => ({
  activityId: crypto.randomUUID(),
  activityName,
  trackSeparately: false,
  payrollCategory: payrollCategory as any,
  fundingSources: [],
});

const mockActivities: Activity[] = [
  makeActivity('Programs', PayrollCategory.Regular),
  makeActivity('Admin', PayrollCategory.Regular),
  makeActivity('Management', PayrollCategory.Regular),
  makeActivity('PTO', PayrollCategory.PTO),
  makeActivity('ETO', PayrollCategory.ETO),
  makeActivity('STO', PayrollCategory.STO),
  makeActivity('On-Call', PayrollCategory.Regular),
  makeActivity('Weekend Coverage', PayrollCategory.Regular),
];

describe('sortActivities', () => {
  // NOTE — flat-rate detection is a shim (always empty) as of [052]; flatRateActivities can no longer be
  // populated here since flat-rate is now a per-(employee, activity) bridge-row concept. Revisit once
  // [055] rewires this. Every non-time-off activity currently lands in workActivities.
  it('separates work and time off activities', () => {
    const { workActivities, timeOffActivities, flatRateActivities } = sortActivities(mockActivities);

    expect(workActivities).toHaveLength(5);
    expect(timeOffActivities).toHaveLength(3);
    expect(flatRateActivities).toHaveLength(0);
  });

  it('sorts each group alphabetically', () => {
    const { workActivities, timeOffActivities } = sortActivities(mockActivities);

    expect(workActivities.map((a) => a.activityName)).toEqual([
      'Admin', 'Management', 'On-Call', 'Programs', 'Weekend Coverage',
    ]);
    expect(timeOffActivities.map((a) => a.activityName)).toEqual(['ETO', 'PTO', 'STO']);
  });

  it('puts ETO PTO STO in time off group', () => {
    const { timeOffActivities } = sortActivities(mockActivities);
    const categories = timeOffActivities.map((a) => a.payrollCategory);
    expect(categories).toContain(PayrollCategory.ETO);
    expect(categories).toContain(PayrollCategory.PTO);
    expect(categories).toContain(PayrollCategory.STO);
  });

  it('handles empty activity list', () => {
    const { workActivities, timeOffActivities, flatRateActivities } = sortActivities([]);
    expect(workActivities).toHaveLength(0);
    expect(timeOffActivities).toHaveLength(0);
    expect(flatRateActivities).toHaveLength(0);
  });
});
