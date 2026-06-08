import { describe, it, expect } from 'vitest';
import Activity from '../../src/models/Activity.js';
import Holiday from '../../src/models/Holiday.js';
import { PayRate } from '../../src/models/PayRate.js';
import { PayrollCategory } from '../../src/models/PayrollCategory.js';
import { SortedActivities } from '../../src/services/timesheet/sortActivities.js';
import buildWeek from '../../src/services/timesheet/buildWeek.js';

const makeActivity = (activityName: string, payRate: string = PayRate.Base, payrollCategory: string = PayrollCategory.Base): Activity => ({
  activityId: crypto.randomUUID(),
  activityName,
  trackSeparately: false,
  payrollCategory: payrollCategory as Activity['payrollCategory'],
  fundingSources: [],
  payRate: payRate as Activity['payRate'],
});

const makeHoliday = (date: string, name: string): Holiday => ({
  holidayId: crypto.randomUUID(),
  holidayName: name,
  holidayDate: date,
});

const WEEK_DATES = ['2026-06-01', '2026-06-02', '2026-06-03', '2026-06-04', '2026-06-05', '2026-06-06', '2026-06-07']
  .map((s) => new Date(`${s}T12:00:00Z`));

const noActivities: SortedActivities = {
  workActivities: [],
  timeOffActivities: [],
  flatRateActivities: [],
};

const workOnly: SortedActivities = {
  workActivities: [makeActivity('Admin'), makeActivity('Programs')],
  timeOffActivities: [],
  flatRateActivities: [],
};

const withTimeOff: SortedActivities = {
  workActivities: [makeActivity('Admin'), makeActivity('Programs')],
  timeOffActivities: [makeActivity('ETO', PayRate.Base, PayrollCategory.ETO), makeActivity('PTO', PayRate.Base, PayrollCategory.PTO)],
  flatRateActivities: [],
};

const withFlatRate: SortedActivities = {
  workActivities: [makeActivity('Admin'), makeActivity('Programs')],
  timeOffActivities: [makeActivity('ETO', PayRate.Base, PayrollCategory.ETO)],
  flatRateActivities: [makeActivity('On-Call', PayRate.FlatRate)],
};

describe('buildWeek — row count', () => {
  // Structure: 3 header rows + activities + 1 divider + 1 daily total = minimum 5 rows
  it('produces correct row count with no activities', () => {
    // holiday + day + date + divider + daily total = 5
    const { rows } = buildWeek(0, WEEK_DATES, noActivities, [], 1);
    expect(rows).toHaveLength(5);
  });

  it('produces correct row count with work activities only', () => {
    // holiday + day + date + 2 work + divider + daily total = 7
    const { rows } = buildWeek(0, WEEK_DATES, workOnly, [], 1);
    expect(rows).toHaveLength(7);
  });

  it('produces correct row count with work and time-off activities', () => {
    // holiday + day + date + 2 work + 2 timeoff + divider + daily total = 9
    const { rows } = buildWeek(0, WEEK_DATES, withTimeOff, [], 1);
    expect(rows).toHaveLength(9);
  });

  it('adds flat rate rows plus an extra divider when flat rate activities exist', () => {
    // holiday + day + date + 2 work + 1 timeoff + divider + 1 flatrate + divider + daily total = 10
    const { rows } = buildWeek(0, WEEK_DATES, withFlatRate, [], 1);
    expect(rows).toHaveLength(10);
  });
});

describe('buildWeek — manifest row numbers', () => {
  it('assigns correct row numbers when startRow is 1', () => {
    const { weekManifest } = buildWeek(0, WEEK_DATES, workOnly, [], 1);
    const rowNums = weekManifest.activityRows.map((activityRow) => activityRow.row);
    // holiday=1, day=2, date=3, Admin=4, Programs=5
    expect(rowNums).toEqual([4, 5]);
  });

  it('assigns correct row numbers when startRow is offset (second week)', () => {
    const firstWeekRowCount = buildWeek(0, WEEK_DATES, workOnly, [], 1).rows.length;
    const secondWeekStartRow = 1 + firstWeekRowCount;

    const { weekManifest } = buildWeek(1, WEEK_DATES, workOnly, [], secondWeekStartRow);
    const rowNums = weekManifest.activityRows.map((activityRow) => activityRow.row);

    expect(rowNums[0]).toBe(secondWeekStartRow + 3); // holiday + day + date then first activity
    expect(rowNums[1]).toBe(secondWeekStartRow + 4);
  });

  it('assigns correct row numbers for work, time-off, and flat rate activities', () => {
    const { weekManifest } = buildWeek(0, WEEK_DATES, withFlatRate, [], 1);
    const byName = Object.fromEntries(
      weekManifest.activityRows.map((activityRow) => [activityRow.activityName, activityRow.row]),
    );

    // holiday=1, day=2, date=3, Admin=4, Programs=5, ETO=6, divider=7, On-Call=8
    expect(byName['Admin']).toBe(4);
    expect(byName['Programs']).toBe(5);
    expect(byName['ETO']).toBe(6);
    expect(byName['On-Call']).toBe(8);
  });

  it('records the date row correctly', () => {
    const { weekManifest } = buildWeek(0, WEEK_DATES, workOnly, [], 4);
    // holiday=4, day=5, date=6
    expect(weekManifest.dateRow).toBe(6);
  });

  it('assigns correct 1-based column numbers to dates', () => {
    const { weekManifest } = buildWeek(0, WEEK_DATES, workOnly, [], 1);
    const columns = weekManifest.dates.map((dateEntry) => dateEntry.column);
    // A=1 is label, so days start at B=2
    expect(columns).toEqual([2, 3, 4, 5, 6, 7, 8]);
  });
});

describe('buildWeek — daily total formulas', () => {
  it('daily total row sums the hourly activity rows', () => {
    // startRow=1: holiday=1, day=2, date=3, Admin=4, Programs=5, divider=6, daily total=7
    const { rows } = buildWeek(0, WEEK_DATES, workOnly, [], 1);
    const dailyTotalRow = rows[rows.length - 1] as string[];

    expect(dailyTotalRow[0]).toBe('Daily Total');
    expect(dailyTotalRow[1]).toBe('=SUM(B4:B5)'); // first day col sums Admin and Programs
    expect(dailyTotalRow[7]).toBe('=SUM(H4:H5)'); // last day col
    expect(dailyTotalRow[8]).toBe('=SUM(B7:H7)'); // weekly total in row 7
  });

  it('daily total only sums hourly rows, not flat rate rows', () => {
    // startRow=1: holiday=1, day=2, date=3, Admin=4, Programs=5, ETO=6, divider=7, On-Call=8, divider=9, daily total=10
    const { rows } = buildWeek(0, WEEK_DATES, withFlatRate, [], 1);
    const dailyTotalRow = rows[rows.length - 1] as string[];

    // Should sum rows 4-6 (Admin, Programs, ETO) — not row 8 (On-Call)
    expect(dailyTotalRow[1]).toBe('=SUM(B4:B6)');
    expect(dailyTotalRow[8]).toBe('=SUM(B10:H10)');
  });
});

describe('buildWeek — holiday row', () => {
  it('places holiday name in the correct column', () => {
    const holidays = [makeHoliday('2026-06-04', 'Independence Day')];
    const { rows } = buildWeek(0, WEEK_DATES, workOnly, holidays, 1);
    const holidayRow = rows[0] as string[];

    // 2026-06-04 is the 4th date (index 3), so col index 4 (B=1, so day 4 = col index 4)
    expect(holidayRow[4]).toBe('Independence Day');
    expect(holidayRow[1]).toBe('');
    expect(holidayRow[7]).toBe('');
  });
});

describe('buildWeek — weekIndex', () => {
  it('records the weekIndex in the manifest', () => {
    const { weekManifest } = buildWeek(2, WEEK_DATES, workOnly, [], 1);
    expect(weekManifest.weekIndex).toBe(2);
  });
});
