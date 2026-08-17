import { describe, it, expect } from 'vitest';
import Activity from '#models/Activity.js';
import { PayrollCategory } from '#models/PayrollCategory.js';
import SortedActivities from '#models/SortedActivities.js';
import buildClockInOutTimesheet from '#services/timesheet/buildClockInOutTimesheet.js';
import { CLOCK_IN_OUT_SLOTS_PER_DAY } from '#config/constants.js';

const makeActivity = (activityName: string, payrollCategory: string = PayrollCategory.Regular): Activity => ({
  activityId: crypto.randomUUID(),
  activityName,
  trackSeparately: false,
  payrollCategory: payrollCategory as Activity['payrollCategory'],
  groupLabel: null,
  sortOrder: 0,
  fundingSources: [],
});

const makeDates = (isoStrings: string[]): Date[] => isoStrings.map((s) => new Date(`${s}T12:00:00Z`));

const WEEK_1_DATES = makeDates(['2026-06-01', '2026-06-02', '2026-06-03', '2026-06-04', '2026-06-05', '2026-06-06', '2026-06-07']);
const WEEK_2_DATES = makeDates(['2026-06-08', '2026-06-09', '2026-06-10', '2026-06-11', '2026-06-12', '2026-06-13', '2026-06-14']);

// One day block = day header row + column header row + CLOCK_IN_OUT_SLOTS_PER_DAY slot rows, with no
// Flat Rate section (workOnly has no flat-rate activities).
const DAY_BLOCK_SIZE = CLOCK_IN_OUT_SLOTS_PER_DAY + 2;

// withFlatRate's day block additionally carries a Flat Rate section label row plus one row per
// flat-rate activity (withFlatRate has exactly one: 'On-Call').
const DAY_BLOCK_SIZE_WITH_FLAT_RATE = DAY_BLOCK_SIZE + 2;

const workOnly: SortedActivities = {
  workActivities: [{ groupLabel: null, activities: [makeActivity('Admin'), makeActivity('Programs')] }],
  timeOffActivities: [],
  flatRateActivities: [],
  payRateTypeByActivityId: new Map(),
};

const withFlatRateAdmin = makeActivity('Admin');
const withFlatRateEto = makeActivity('ETO', PayrollCategory.ETO);
const withFlatRateOnCall = makeActivity('On-Call');
const withFlatRate: SortedActivities = {
  workActivities: [{ groupLabel: null, activities: [withFlatRateAdmin] }],
  timeOffActivities: [{ groupLabel: null, activities: [withFlatRateEto] }],
  flatRateActivities: [{ groupLabel: null, activities: [withFlatRateOnCall] }],
  payRateTypeByActivityId: new Map(),
};

// A blank break row separates each day's block from the next — one fewer break than there are days.
const breakRowCount = (dayCount: number): number => dayCount - 1;

describe('buildClockInOutTimesheet — row count', () => {
  it('produces one weekLabelRow plus one day block per day plus a break row between days (days shared across weeks, not duplicated per week)', () => {
    const { rows } = buildClockInOutTimesheet([WEEK_1_DATES, WEEK_2_DATES], workOnly, 1);
    expect(rows).toHaveLength(1 + WEEK_1_DATES.length * DAY_BLOCK_SIZE + breakRowCount(WEEK_1_DATES.length));
  });

  it('adds a Flat Rate section (sectionLabel + one row per activity) to every day\'s block when present', () => {
    const { rows } = buildClockInOutTimesheet([WEEK_1_DATES, WEEK_2_DATES], withFlatRate, 1);
    expect(rows).toHaveLength(
      1 + WEEK_1_DATES.length * DAY_BLOCK_SIZE_WITH_FLAT_RATE + breakRowCount(WEEK_1_DATES.length),
    );
  });

  it('every row spans both weeks\' columns plus a 1-column spacer between them', () => {
    const { rows } = buildClockInOutTimesheet([WEEK_1_DATES, WEEK_2_DATES], workOnly, 1);
    // 4 cols (week 1) + 1 spacer + 4 cols (week 2) = 9
    expect(rows[0]).toHaveLength(9);
    expect(rows.every((row) => row.length === 9)).toBe(true);
  });
});

describe('buildClockInOutTimesheet — week manifest', () => {
  it('assigns labelColumnIndex 0 to week 0 and 5 to week 1 (4-wide group + 1 spacer)', () => {
    const { clockInOutWeeks } = buildClockInOutTimesheet([WEEK_1_DATES, WEEK_2_DATES], workOnly, 1);
    expect(clockInOutWeeks[0].labelColumnIndex).toBe(0);
    expect(clockInOutWeeks[1].labelColumnIndex).toBe(5);
  });

  it('gives every week the same row numbers — only column position and content differ', () => {
    const { clockInOutWeeks } = buildClockInOutTimesheet([WEEK_1_DATES, WEEK_2_DATES], workOnly, 1);
    expect(clockInOutWeeks[0].weekLabelRow).toBe(clockInOutWeeks[1].weekLabelRow);
    expect(clockInOutWeeks[0].days[0].dayHeaderRow).toBe(clockInOutWeeks[1].days[0].dayHeaderRow);
    expect(clockInOutWeeks[0].days[0].slotRows.map((s) => s.row)).toEqual(
      clockInOutWeeks[1].days[0].slotRows.map((s) => s.row),
    );
  });

  it('records each week\'s own dates on its days, even though row numbers are shared', () => {
    const { clockInOutWeeks } = buildClockInOutTimesheet([WEEK_1_DATES, WEEK_2_DATES], workOnly, 1);
    expect(clockInOutWeeks[0].days[0].date).toBe('2026-06-01');
    expect(clockInOutWeeks[1].days[0].date).toBe('2026-06-08');
  });

  it('lays out weekLabelRow=1, then day 0 header=2, columnHeader=3, slots=4..9', () => {
    const { clockInOutWeeks } = buildClockInOutTimesheet([WEEK_1_DATES, WEEK_2_DATES], workOnly, 1);
    const day0 = clockInOutWeeks[0].days[0];
    expect(clockInOutWeeks[0].weekLabelRow).toBe(1);
    expect(day0.dayHeaderRow).toBe(2);
    expect(day0.columnHeaderRow).toBe(3);
    expect(day0.slotRows.map((s) => s.row)).toEqual([4, 5, 6, 7, 8, 9]);
  });
});

describe('buildClockInOutTimesheet — row content', () => {
  it('writes each week\'s own label content into its own column range, separated by a blank spacer column', () => {
    const { rows } = buildClockInOutTimesheet([WEEK_1_DATES, WEEK_2_DATES], workOnly, 1);
    const weekLabelRow = rows[0] as string[];
    expect(weekLabelRow[0]).toBe('Week 6/1 - 6/7');
    expect(weekLabelRow[4]).toBe(''); // spacer column between week groups
    expect(weekLabelRow[5]).toBe('Week 6/8 - 6/14');
  });

  it('writes each week\'s own day-specific header content at the same row', () => {
    const { rows, clockInOutWeeks } = buildClockInOutTimesheet([WEEK_1_DATES, WEEK_2_DATES], workOnly, 1);
    const dayHeaderRow = rows[clockInOutWeeks[0].days[0].dayHeaderRow - 1] as string[];
    expect(dayHeaderRow[0]).toBe('Mon 6/1');
    expect(dayHeaderRow[5]).toBe('Mon 6/8');
  });

  it('writes the Hourly/In/Out/Total column headers for every week', () => {
    const { rows, clockInOutWeeks } = buildClockInOutTimesheet([WEEK_1_DATES, WEEK_2_DATES], workOnly, 1);
    const columnHeaderRow = rows[clockInOutWeeks[0].days[0].columnHeaderRow - 1] as string[];
    expect(columnHeaderRow.slice(0, 4)).toEqual(['Hourly', 'In', 'Out', 'Total']);
    expect(columnHeaderRow.slice(5, 9)).toEqual(['Hourly', 'In', 'Out', 'Total']);
  });

  it('a slot row\'s Total formula references its own week\'s In/Out columns', () => {
    const { rows, clockInOutWeeks } = buildClockInOutTimesheet([WEEK_1_DATES, WEEK_2_DATES], workOnly, 1);
    const slotRowNumber = clockInOutWeeks[0].days[0].slotRows[0].row;
    const slotRow = rows[slotRowNumber - 1] as string[];
    expect(slotRow[3]).toBe(`=IF(OR(B${slotRowNumber}="",C${slotRowNumber}=""),"",MROUND((C${slotRowNumber}-B${slotRowNumber})*24,0.25))`);
    expect(slotRow[8]).toBe(`=IF(OR(G${slotRowNumber}="",H${slotRowNumber}=""),"",MROUND((H${slotRowNumber}-G${slotRowNumber})*24,0.25))`);
  });
});

describe('buildClockInOutTimesheet — Flat Rate section', () => {
  it('places one row per flat-rate activity directly below each day\'s slot rows, with independent shift counts per week', () => {
    const { rows, clockInOutWeeks } = buildClockInOutTimesheet([WEEK_1_DATES, WEEK_2_DATES], withFlatRate, 1);
    const day0 = clockInOutWeeks[0].days[0];
    expect(day0.flatRateSectionLabelRow).toBeDefined();
    expect(day0.flatRateRows).toHaveLength(1);
    expect(day0.flatRateRows[0].activityName).toBe('On-Call');

    const lastSlotRow = day0.slotRows[day0.slotRows.length - 1].row;
    expect(day0.flatRateSectionLabelRow).toBe(lastSlotRow + 1);

    const flatRateActivityRowNumber = day0.flatRateRows[0].row;
    const flatRateActivityRow = rows[flatRateActivityRowNumber - 1] as string[];
    expect(flatRateActivityRow[0]).toBe('On-Call');
    expect(flatRateActivityRow[3]).toBe(`=B${flatRateActivityRowNumber}`);
    expect(flatRateActivityRow[8]).toBe(`=G${flatRateActivityRowNumber}`);
  });

  it('gives every day its own Flat Rate section, with the second day\'s rows starting after the first day\'s', () => {
    const { clockInOutWeeks } = buildClockInOutTimesheet([WEEK_1_DATES, WEEK_2_DATES], withFlatRate, 1);
    const [day0, day1] = clockInOutWeeks[0].days;
    expect(day1.flatRateSectionLabelRow).toBeDefined();
    expect(day1.flatRateSectionLabelRow).toBeGreaterThan(day0.flatRateRows[0].row);
  });

  it('leaves flatRateSectionLabelRow undefined and flatRateRows empty on every day with no flat-rate activities', () => {
    const { clockInOutWeeks } = buildClockInOutTimesheet([WEEK_1_DATES, WEEK_2_DATES], workOnly, 1);
    for (const day of clockInOutWeeks[0].days) {
      expect(day.flatRateSectionLabelRow).toBeUndefined();
      expect(day.flatRateRows).toEqual([]);
    }
  });
});

describe('buildClockInOutTimesheet — single-week pay period', () => {
  it('produces one column group with no spacer or second week', () => {
    const { rows, clockInOutWeeks } = buildClockInOutTimesheet([WEEK_1_DATES], workOnly, 1);
    expect(clockInOutWeeks).toHaveLength(1);
    expect(rows[0]).toHaveLength(4);
  });
});
