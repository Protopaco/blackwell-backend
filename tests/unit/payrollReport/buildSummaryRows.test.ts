import { describe, it, expect } from 'vitest';
import buildSummaryRows from '#services/payrollReport/buildSummaryRows.js';
import TimesheetEntry from '#models/TimesheetEntry.js';

const baseEntry: TimesheetEntry = {
  employeeId: 'e1',
  employeeName: 'Jane Smith',
  activityId: 'a1',
  activityName: 'Job Coaching',
  payrollCategory: 'Regular',
  payRate: 'HourlyPayRate1',
  date: '2026-06-01',
  isHoliday: false,
  hours: 8,
};

describe('buildSummaryRows', () => {
  it('produces one summary row for a single entry', () => {
    const rows = buildSummaryRows([baseEntry], '2026-06-15T00:00:00Z');
    expect(rows).toEqual([
      {
        GeneratedAt: '2026-06-15T00:00:00Z',
        EmployeeId: 'e1',
        EmployeeName: 'Jane Smith',
        PayrollCategory: 'Regular',
        PayRate: 'HourlyPayRate1',
        IsHoliday: false,
        TotalHours: 8,
      },
    ]);
  });

  it('sums hours for entries sharing the same employee/category/rate/holiday key', () => {
    const rows = buildSummaryRows(
      [baseEntry, { ...baseEntry, activityId: 'a2', date: '2026-06-02', hours: 4 }],
      '2026-06-15T00:00:00Z',
    );
    expect(rows).toHaveLength(1);
    expect(rows[0].TotalHours).toBe(12);
  });

  it('keeps entries separate when the pay rate differs', () => {
    const rows = buildSummaryRows(
      [baseEntry, { ...baseEntry, payRate: 'HourlyPayRate2', hours: 4 }],
      '2026-06-15T00:00:00Z',
    );
    expect(rows).toHaveLength(2);
  });

  it('keeps entries separate when the holiday flag differs', () => {
    const rows = buildSummaryRows(
      [baseEntry, { ...baseEntry, isHoliday: true, hours: 4 }],
      '2026-06-15T00:00:00Z',
    );
    expect(rows).toHaveLength(2);
    expect(rows.find((row) => row.IsHoliday)?.TotalHours).toBe(4);
    expect(rows.find((row) => !row.IsHoliday)?.TotalHours).toBe(8);
  });

  it('keeps entries separate when the payroll category differs', () => {
    const rows = buildSummaryRows(
      [baseEntry, { ...baseEntry, payrollCategory: 'PTO', hours: 4 }],
      '2026-06-15T00:00:00Z',
    );
    expect(rows).toHaveLength(2);
  });

  it('returns an empty array for no entries', () => {
    expect(buildSummaryRows([], '2026-06-15T00:00:00Z')).toEqual([]);
  });
});
