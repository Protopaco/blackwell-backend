import { describe, it, expect } from 'vitest';
import sortActivities from '#services/timesheet/sortActivities.js';
import Activity from '#models/Activity.js';
import EmployeeActivityRateInput from '#models/EmployeeActivityRateInput.js';
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

const makeActivityRate = (
  activityId: string,
  payRateType: EmployeeActivityRateInput['payRateType'],
): EmployeeActivityRateInput => ({
  activityId,
  payRateType,
  payRate: 20,
  holidayPayRate: 25,
});

const programs = makeActivity('Programs', PayrollCategory.Regular);
const admin = makeActivity('Admin', PayrollCategory.Regular);
const management = makeActivity('Management', PayrollCategory.Regular);
const pto = makeActivity('PTO', PayrollCategory.PTO);
const eto = makeActivity('ETO', PayrollCategory.ETO);
const sto = makeActivity('STO', PayrollCategory.STO);
const onCall = makeActivity('On-Call', PayrollCategory.Regular);
const weekendCoverage = makeActivity('Weekend Coverage', PayrollCategory.Regular);

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

describe('sortActivities', () => {
  it('separates work, time off, and flat rate activities', () => {
    const { workActivities, timeOffActivities, flatRateActivities } = sortActivities(mockActivities, mockActivityRates);

    expect(workActivities).toHaveLength(3);
    expect(timeOffActivities).toHaveLength(3);
    expect(flatRateActivities).toHaveLength(2);
  });

  it('sorts each group alphabetically', () => {
    const { workActivities, timeOffActivities, flatRateActivities } = sortActivities(mockActivities, mockActivityRates);

    expect(workActivities.map((a) => a.activityName)).toEqual(['Admin', 'Management', 'Programs']);
    expect(timeOffActivities.map((a) => a.activityName)).toEqual(['ETO', 'PTO', 'STO']);
    expect(flatRateActivities.map((a) => a.activityName)).toEqual(['On-Call', 'Weekend Coverage']);
  });

  it('puts Salary activities in the work group, alongside Hourly', () => {
    const { workActivities } = sortActivities(mockActivities, mockActivityRates);
    expect(workActivities.map((a) => a.activityName)).toContain('Management');
  });

  it('puts FlatRate activities in the flat rate group regardless of payroll category', () => {
    const { flatRateActivities } = sortActivities(mockActivities, mockActivityRates);
    expect(flatRateActivities.map((a) => a.activityName)).toEqual(
      expect.arrayContaining(['On-Call', 'Weekend Coverage']),
    );
  });

  it('puts ETO PTO STO in time off group', () => {
    const { timeOffActivities } = sortActivities(mockActivities, mockActivityRates);
    const categories = timeOffActivities.map((a) => a.payrollCategory);
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
});
