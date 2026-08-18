import { describe, it, expect } from 'vitest';
import Activity from '#models/Activity.js';
import { PayrollCategory } from '#models/PayrollCategory.js';
import Holiday from '#models/Holiday.js';
import {
  colLetter,
  buildPayPeriodLabelRow,
  buildPayPeriodValueRow,
  buildEmployeeNameRow,
  buildPositionRow,
  buildDividerRow,
  buildHolidayRow,
  buildDayRow,
  buildDateRow,
  buildSectionLabelRow,
  buildActivityRow,
  buildClockInOutWeekLabelRow,
  buildClockInOutDayHeaderRow,
  buildClockInOutColumnHeaderRow,
  buildClockInOutSlotRow,
  buildClockInOutFlatRateSectionLabelRow,
  buildClockInOutFlatRateActivityRow,
  buildSummaryRow,
  buildSignatureRow,
} from '#services/timesheet/rowBuilders.js';

const makeActivity = (activityName: string): Activity => ({
  activityId: crypto.randomUUID(),
  activityName,
  payrollCategory: PayrollCategory.Regular,
  groupLabel: null,
  sortOrder: 0,
  fundingSources: [],
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

describe('buildPayPeriodLabelRow', () => {
  it('returns the pay period label', () => {
    expect(buildPayPeriodLabelRow()).toEqual(['Pay Period:']);
  });
});

describe('buildPayPeriodValueRow', () => {
  it('returns the pay period date range as a single-cell row', () => {
    expect(buildPayPeriodValueRow('6/1 - 6/14')).toEqual(['6/1 - 6/14']);
  });
});

describe('buildEmployeeNameRow', () => {
  it('combines first and last name', () => {
    expect(buildEmployeeNameRow('Jane', 'Smith')).toEqual(['Jane Smith']);
  });
});

describe('buildPositionRow', () => {
  it('returns the position as a single-cell row', () => {
    expect(buildPositionRow('Director')).toEqual(['Director']);
  });
});

describe('buildDividerRow', () => {
  it('returns an empty array', () => {
    expect(buildDividerRow()).toEqual([]);
  });
});

describe('buildHolidayRow', () => {
  it('leaves the label column empty when no weekLabel is passed', () => {
    const holidays = [makeHoliday('2026-06-04', 'Independence Day')];
    const row = buildHolidayRow(WEEK_DATES, holidays);

    expect(row[0]).toBe(''); // label column empty
    expect(row[4]).toBe('Independence Day'); // 2026-06-04 is index 3 in dates → col index 4
  });

  it('places the week label in the label column when passed', () => {
    const row = buildHolidayRow(WEEK_DATES, [], 'Week 6/1 - 6/7');
    expect(row[0]).toBe('Week 6/1 - 6/7');
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
    const row = buildDateRow(WEEK_DATES, 7);
    expect(row[0]).toBe('');
  });

  it('formats dates as M/D without leading zeros', () => {
    const row = buildDateRow(WEEK_DATES, 7);
    expect(row[1]).toBe('6/1');
    expect(row[7]).toBe('6/7');
  });

  it('puts "Total" in the weekly total column', () => {
    const row = buildDateRow(WEEK_DATES, 7);
    expect(row[row.length - 1]).toBe('Total');
  });
});

describe('buildSectionLabelRow', () => {
  it('puts the section label in column A and leaves the rest of the row blank', () => {
    const row = buildSectionLabelRow('Hourly', 7);
    expect(row).toEqual(['Hourly', '', '', '', '', '', '', '', '']);
  });

  it('supports the Flat Rate label too', () => {
    const row = buildSectionLabelRow('Flat Rate', 7);
    expect(row[0]).toBe('Flat Rate');
    expect(row[row.length - 1]).toBe('');
  });
});

describe('buildActivityRow', () => {
  it('puts the activity name in the label column', () => {
    const row = buildActivityRow(makeActivity('Programs'), 7, 9, 'hours');
    expect(row[0]).toBe('Programs');
  });

  it('fills day columns with empty strings for data entry', () => {
    const row = buildActivityRow(makeActivity('Programs'), 7, 9, 'hours');
    expect(row).toHaveLength(10);
    expect(row.slice(1, 8).every((cell) => cell === '')).toBe(true);
  });

  it('sums the row\'s own day columns in the weekly total column', () => {
    const row = buildActivityRow(makeActivity('Programs'), 7, 9, 'hours');
    expect(row[8]).toBe('=SUM(B9:H9)');
  });

  it('puts the unit label in the trailing column', () => {
    const row = buildActivityRow(makeActivity('Programs'), 7, 9, 'shifts');
    expect(row[9]).toBe('shifts');
  });
});


describe('buildClockInOutWeekLabelRow', () => {
  it('puts the week date-range label in the label column, scoped to just that week\'s 4 columns', () => {
    const row = buildClockInOutWeekLabelRow(WEEK_DATES);
    expect(row).toEqual(['Week 6/1 - 6/7', '', '', '']);
  });
});

describe('buildClockInOutDayHeaderRow', () => {
  it('combines day name and date in the label column, with the other 3 cells blank', () => {
    const row = buildClockInOutDayHeaderRow(new Date('2026-06-01T12:00:00Z'));
    expect(row).toEqual(['Mon 6/1', '', '', '']);
  });
});

describe('buildClockInOutColumnHeaderRow', () => {
  it('returns the Hourly/In/Out/Total column headers', () => {
    expect(buildClockInOutColumnHeaderRow()).toEqual(['Hourly', 'In', 'Out', 'Total']);
  });
});

describe('buildClockInOutSlotRow', () => {
  it('leaves the activity/In/Out cells blank for data entry', () => {
    const row = buildClockInOutSlotRow(10, 0);
    expect(row[0]).toBe('');
    expect(row[1]).toBe('');
    expect(row[2]).toBe('');
  });

  it('builds a display-only Total formula referencing its own row\'s In/Out cells, rounded to 15 min', () => {
    const row = buildClockInOutSlotRow(10, 0);
    expect(row[3]).toBe('=IF(OR(B10="",C10=""),"",MROUND((C10-B10)*24,0.25))');
  });

  it('adjusts the formula\'s row references when rowNumber changes', () => {
    const row = buildClockInOutSlotRow(42, 0);
    expect(row[3]).toBe('=IF(OR(B42="",C42=""),"",MROUND((C42-B42)*24,0.25))');
  });

  it('offsets the formula\'s column references when labelColumnIndex is non-zero (a later week\'s group)', () => {
    const row = buildClockInOutSlotRow(10, 5);
    expect(row[3]).toBe('=IF(OR(G10="",H10=""),"",MROUND((H10-G10)*24,0.25))');
  });
});

describe('buildClockInOutFlatRateSectionLabelRow', () => {
  it('returns the Flat Rate/Shifts/Total header, with the Out-column cell blank for the Shifts merge', () => {
    expect(buildClockInOutFlatRateSectionLabelRow()).toEqual(['Flat Rate', 'Shifts', '', 'Total']);
  });
});

describe('buildClockInOutFlatRateActivityRow', () => {
  it('puts the activity name in the label column and leaves Shifts blank for entry', () => {
    const row = buildClockInOutFlatRateActivityRow(makeActivity('On-Call'), 17, 0);
    expect(row[0]).toBe('On-Call');
    expect(row[1]).toBe('');
  });

  it('the Total cell just echoes the Shifts cell — no computation for flat-rate activities', () => {
    const row = buildClockInOutFlatRateActivityRow(makeActivity('On-Call'), 17, 0);
    expect(row[3]).toBe('=B17');
  });

  it('offsets the Total formula\'s column reference when labelColumnIndex is non-zero', () => {
    const row = buildClockInOutFlatRateActivityRow(makeActivity('On-Call'), 17, 5);
    expect(row[3]).toBe('=G17');
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
