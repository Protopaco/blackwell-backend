import { describe, it, expect } from 'vitest';
import sortActivities from '#services/timesheet/sortActivities.js';
import Activity from '#models/Activity.js';
import { PayRate, isFlatRate } from '#models/PayRate.js';
import { PayrollCategory } from '#models/PayrollCategory.js';

const makeActivity = (
  activityName: string,
  payRate: string,
  payrollCategory: string,
): Activity => ({
  activityId: crypto.randomUUID(),
  activityName,
  trackSeparately: false,
  payrollCategory: payrollCategory as any,
  fundingSources: [],
  payRate: payRate as any,
});

const mockActivities: Activity[] = [
  makeActivity('Programs', PayRate.HourlyPayRate1, PayrollCategory.Regular),
  makeActivity('Admin', PayRate.HourlyPayRate1, PayrollCategory.Regular),
  makeActivity('Management', PayRate.HourlyPayRate2, PayrollCategory.Regular),
  makeActivity('PTO', PayRate.HourlyPayRate1, PayrollCategory.PTO),
  makeActivity('ETO', PayRate.HourlyPayRate1, PayrollCategory.ETO),
  makeActivity('STO', PayRate.HourlyPayRate1, PayrollCategory.STO),
  makeActivity('On-Call', PayRate.FlatPayRate1, PayrollCategory.Regular),
  makeActivity('Weekend Coverage', PayRate.FlatPayRate2, PayrollCategory.Regular),
];

describe('sortActivities', () => {
  it('separates work, time off, and flat rate activities', () => {
    const { workActivities, timeOffActivities, flatRateActivities } = sortActivities(mockActivities);

    expect(workActivities).toHaveLength(3);
    expect(timeOffActivities).toHaveLength(3);
    expect(flatRateActivities).toHaveLength(2);
  });

  it('sorts each group alphabetically', () => {
    const { workActivities, timeOffActivities, flatRateActivities } = sortActivities(mockActivities);

    expect(workActivities.map((a) => a.activityName)).toEqual(['Admin', 'Management', 'Programs']);
    expect(timeOffActivities.map((a) => a.activityName)).toEqual(['ETO', 'PTO', 'STO']);
    expect(flatRateActivities.map((a) => a.activityName)).toEqual(['On-Call', 'Weekend Coverage']);
  });

  it('puts flat rate activities in flat rate group regardless of payroll category', () => {
    const { flatRateActivities } = sortActivities(mockActivities);
    expect(flatRateActivities.every((a) => isFlatRate(a.payRate))).toBe(true);
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
