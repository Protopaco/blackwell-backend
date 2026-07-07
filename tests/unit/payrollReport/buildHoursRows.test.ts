import { describe, it, expect } from 'vitest';
import buildHoursRows from '#services/payrollReport/buildHoursRows.js';
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

describe('buildHoursRows', () => {
  it('maps a single entry to a row with the given generatedAt', () => {
    const rows = buildHoursRows([baseEntry], '2026-06-15T00:00:00Z');
    expect(rows).toEqual([
      {
        GeneratedAt: '2026-06-15T00:00:00Z',
        EmployeeId: 'e1',
        EmployeeName: 'Jane Smith',
        ActivityName: 'Job Coaching',
        PayrollCategory: 'Regular',
        Date: '2026-06-01',
        IsHoliday: 'FALSE',
        Hours: 8,
      },
    ]);
  });

  it('converts isHoliday true to the string "TRUE"', () => {
    const rows = buildHoursRows([{ ...baseEntry, isHoliday: true }], '2026-06-15T00:00:00Z');
    expect(rows[0].IsHoliday).toBe('TRUE');
  });

  it('converts isHoliday false to the string "FALSE"', () => {
    const rows = buildHoursRows([{ ...baseEntry, isHoliday: false }], '2026-06-15T00:00:00Z');
    expect(rows[0].IsHoliday).toBe('FALSE');
  });

  it('maps multiple entries one-to-one, with no aggregation', () => {
    const rows = buildHoursRows(
      [baseEntry, { ...baseEntry, activityId: 'a2', activityName: 'Direct Support', hours: 4 }],
      '2026-06-15T00:00:00Z',
    );
    expect(rows).toHaveLength(2);
    expect(rows[1].ActivityName).toBe('Direct Support');
    expect(rows[1].Hours).toBe(4);
  });

  it('returns an empty array for no entries', () => {
    expect(buildHoursRows([], '2026-06-15T00:00:00Z')).toEqual([]);
  });
});
