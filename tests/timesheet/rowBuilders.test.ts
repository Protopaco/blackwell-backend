import { describe, it, expect } from 'vitest';
import Activity from '../../src/models/Activity.js';
import { PayRate } from '../../src/models/PayRate.js';
import { PayrollCategory } from '../../src/models/PayrollCategory.js';
import Holiday from '../../src/models/Holiday.js';
import {
  colLetter,
  buildHeaderRow,
  buildEmployeeRow,
  buildDividerRow,
  buildHolidayRow,
  buildDayRow,
  buildDateRow,
  buildActivityRow,
  buildDailyTotalRow,
  buildSummaryRow,
  buildSignatureRow,
} from '../../src/services/timesheet/rowBuilders.js';

const makeActivity = (activityName: string): Activity => ({
  activityId: crypto.randomUUID(),
  activityName,
  trackSeparately: false,
  payrollCategory: PayrollCategory.Base,
  fundingSources: [],
  payRate: PayRate.Base,
});

const makeHoliday = (date: string, name: string): Holiday => ({
  holidayId: crypto.randomUUID(),
  holidayName: name,
  holidayDate: date,
});

const makeDates = (isoStrings: string[]): Date[] =>
  isoStrings.map((s) => new Date(`${s}T12:00:00Z`));

const WEEK_DATES = makeDates([
  '2026-06-01', '2026-06-02', '2026-06-03', '2026-06-04',
  '2026-06-05', '2026-06-06', '2026-06-07',
]);

describe('colLetter', () => {
  it('converts 0 to A', () => expect(colLetter(0)).toBe('A'));
  it('converts 1 to B', () => expect(colLetter(1)).toBe('B'));
  it('converts 25 to Z', () => expect(colLetter(25)).toBe('Z'));
  it('converts 26 to AA', () => expect(colLetter(26)).toBe('AA'));
  it('converts 27 to AB', () => expect(colLetter(27)).toBe('AB'));
  it('converts 51 to AZ', () => expect(colLetter(51)).toBe('AZ'));
  it('converts 52 to BA', () => expect(colLetter(52)).toBe('BA'));
});

describe('buildHeaderRow', () => {
  it('returns pay period label and name', () => {
    expect(buildHeaderRow('6/1 - 6/14')).toEqual(['Pay Period:', '6/1 - 6/14']);
  });
});

describe('buildEmployeeRow', () => {
  it('combines first and last name, includes position', () => {
    expect(buildEmployeeRow('Jane', 'Smith', 'Director')).toEqual(['Jane Smith', 'Director']);
  });
});

describe('buildDividerRow', () => {
  it('returns an empty array', () => {
    expect(buildDividerRow()).toEqual([]);
  });
});

describe('buildHolidayRow', () => {
  it('places holiday name in the correct date column', () => {
    const holidays = [makeHoliday('2026-06-04', 'Independence Day')];
    const row = buildHolidayRow(WEEK_DATES, holidays);

    expect(row[0]).toBe(''); // label column empty
    expect(row[4]).toBe('Independence Day'); // 2026-06-04 is index 3 in dates → col index 4
  });

  it('leaves non-holiday columns empty', () => {
    const holidays = [makeHoliday('2026-06-04', 'Independence Day')];
    const row = buildHolidayRow(WEEK_DATES, holidays);

    expect(row[1]).toBe('');
    expect(row[2]).toBe('');
    expect(row[3]).toBe('');
    expect(row[5]).toBe('');
  });

  it('returns all empty cells when no holidays fall in the week', () => {
    const row = buildHolidayRow(WEEK_DATES, []);
    expect(row).toHaveLength(8);
    expect(row.every((cell) => cell === '')).toBe(true);
  });

  it('handles multiple holidays in the same week', () => {
    const holidays = [
      makeHoliday('2026-06-01', 'Holiday A'),
      makeHoliday('2026-06-07', 'Holiday B'),
    ];
    const row = buildHolidayRow(WEEK_DATES, holidays);
    expect(row[1]).toBe('Holiday A');
    expect(row[7]).toBe('Holiday B');
  });
});

describe('buildDayRow', () => {
  it('starts with an empty label column', () => {
    const row = buildDayRow(WEEK_DATES);
    expect(row[0]).toBe('');
  });

  it('returns correct day names for a Mon-Sun week', () => {
    const row = buildDayRow(WEEK_DATES);
    expect(row).toEqual(['', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
  });
});

describe('buildDateRow', () => {
  it('starts with an empty label column', () => {
    const row = buildDateRow(WEEK_DATES);
    expect(row[0]).toBe('');
  });

  it('formats dates as M/D without leading zeros', () => {
    const row = buildDateRow(WEEK_DATES);
    expect(row[1]).toBe('6/1');
    expect(row[7]).toBe('6/7');
  });
});

describe('buildActivityRow', () => {
  it('puts the activity name in the label column', () => {
    const row = buildActivityRow(makeActivity('Programs'), 7);
    expect(row[0]).toBe('Programs');
  });

  it('fills day columns with empty strings for data entry', () => {
    const row = buildActivityRow(makeActivity('Programs'), 7);
    expect(row).toHaveLength(8);
    expect(row.slice(1).every((cell) => cell === '')).toBe(true);
  });
});

describe('buildDailyTotalRow', () => {
  it('puts Daily Total label in column A', () => {
    const row = buildDailyTotalRow(WEEK_DATES, 4, 8, 9);
    expect(row[0]).toBe('Daily Total');
  });

  it('generates a SUM formula for each day column', () => {
    const row = buildDailyTotalRow(WEEK_DATES, 4, 8, 9);
    expect(row[1]).toBe('=SUM(B4:B8)');
    expect(row[2]).toBe('=SUM(C4:C8)');
    expect(row[7]).toBe('=SUM(H4:H8)');
  });

  it('appends a weekly total formula summing all day columns in this row', () => {
    const row = buildDailyTotalRow(WEEK_DATES, 4, 8, 9);
    expect(row[8]).toBe('=SUM(B9:H9)');
  });

  it('adjusts formulas when activity range changes', () => {
    const row = buildDailyTotalRow(WEEK_DATES, 10, 15, 16);
    expect(row[1]).toBe('=SUM(B10:B15)');
    expect(row[8]).toBe('=SUM(B16:H16)');
  });
});

describe('buildSummaryRow', () => {
  it('returns the label and formula', () => {
    expect(buildSummaryRow('Total Hours Worked', '=SUM(B4:H4)')).toEqual([
      'Total Hours Worked',
      '=SUM(B4:H4)',
    ]);
  });
});

describe('buildSignatureRow', () => {
  it('returns the label in the first column only', () => {
    expect(buildSignatureRow('Employee Signature:')).toEqual(['Employee Signature:']);
  });
});
