import { describe, it, expect } from 'vitest';
import Activity from '#models/Activity.js';
import Holiday from '#models/Holiday.js';
import { PayrollCategory } from '#models/PayrollCategory.js';
import { SortedActivities } from '#services/timesheet/sortActivities.js';
import buildWeek from '#services/timesheet/buildWeek.js';

const makeActivity = (activityName: string, payrollCategory: string = PayrollCategory.Regular): Activity => ({
  activityId: crypto.randomUUID(),
  activityName,
  trackSeparately: false,
  payrollCategory: payrollCategory as Activity['payrollCategory'],
  groupLabel: null,
  sortOrder: 0,
  fundingSources: [],
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
  timeOffActivities: [makeActivity('ETO', PayrollCategory.ETO), makeActivity('PTO', PayrollCategory.PTO)],
  flatRateActivities: [],
};

const withFlatRate: SortedActivities = {
  workActivities: [makeActivity('Admin'), makeActivity('Programs')],
  timeOffActivities: [makeActivity('ETO', PayrollCategory.ETO)],
  flatRateActivities: [makeActivity('On-Call')],
};

const flatRateOnly: SortedActivities = {
  workActivities: [],
  timeOffActivities: [],
  flatRateActivities: [makeActivity('On-Call')],
};

describe('buildWeek — row count', () => {
  it('produces only the fixed rows when there are zero activities (both sections omitted)', () => {
    // weekLabel + dayOfWeek + date + headerSpacer = 4
    const { rows } = buildWeek(0, WEEK_DATES, noActivities, [], 1, 7);
    expect(rows).toHaveLength(4);
  });

  it('produces an Hourly section with no spacer and no Flat Rate section for work activities only', () => {
    // weekLabel + dayOfWeek + date + headerSpacer + sectionLabel + 2 work + dailyTotal = 8
    const { rows } = buildWeek(0, WEEK_DATES, workOnly, [], 1, 7);
    expect(rows).toHaveLength(8);
  });

  it('produces correct row count with work and time-off activities', () => {
    // weekLabel + dayOfWeek + date + headerSpacer + sectionLabel + 4 hourly + dailyTotal = 10
    const { rows } = buildWeek(0, WEEK_DATES, withTimeOff, [], 1, 7);
    expect(rows).toHaveLength(10);
  });

  it('adds an Hourly section, a spacer, and a Flat Rate section (each with its own dailyTotal) when both types exist', () => {
    // weekLabel + dayOfWeek + date + headerSpacer = 4
    // Hourly: sectionLabel + 3 hourly + dailyTotal = 5
    // spacer = 1
    // Flat Rate: sectionLabel + 1 flatrate + dailyTotal = 3
    // total = 13
    const { rows } = buildWeek(0, WEEK_DATES, withFlatRate, [], 1, 7);
    expect(rows).toHaveLength(13);
  });

  it('omits the Hourly section entirely (no spacer) when the employee has only Flat Rate activities', () => {
    // weekLabel + dayOfWeek + date + headerSpacer + sectionLabel + 1 flatrate + dailyTotal = 7
    const { rows } = buildWeek(0, WEEK_DATES, flatRateOnly, [], 1, 7);
    expect(rows).toHaveLength(7);
  });
});

describe('buildWeek — manifest row numbers', () => {
  it('assigns correct row numbers when startRow is 1', () => {
    const { weekManifest } = buildWeek(0, WEEK_DATES, workOnly, [], 1, 7);
    const rowNums = weekManifest.activityRows.map((activityRow) => activityRow.row);
    // weekLabel=1, dayOfWeek=2, date=3, headerSpacer=4, sectionLabel=5, Admin=6, Programs=7
    expect(rowNums).toEqual([6, 7]);
  });

  it('assigns correct row numbers when startRow is offset (second week)', () => {
    const firstWeekRowCount = buildWeek(0, WEEK_DATES, workOnly, [], 1, 7).rows.length;
    const secondWeekStartRow = 1 + firstWeekRowCount;

    const { weekManifest } = buildWeek(1, WEEK_DATES, workOnly, [], secondWeekStartRow, 7);
    const rowNums = weekManifest.activityRows.map((activityRow) => activityRow.row);

    expect(rowNums[0]).toBe(secondWeekStartRow + 5); // weekLabel + dayOfWeek + date + headerSpacer + sectionLabel, then first activity
    expect(rowNums[1]).toBe(secondWeekStartRow + 6);
  });

  it('assigns correct row numbers for work, time-off, and flat rate activities', () => {
    const { weekManifest } = buildWeek(0, WEEK_DATES, withFlatRate, [], 1, 7);
    const hourlyByName = Object.fromEntries(
      weekManifest.activityRows.map((activityRow) => [activityRow.activityName, activityRow.row]),
    );
    const flatRateByName = Object.fromEntries(
      weekManifest.flatRateRows.map((flatRateRow) => [flatRateRow.activityName, flatRateRow.row]),
    );

    // weekLabel=1, dayOfWeek=2, date=3, headerSpacer=4, hourlySectionLabel=5, Admin=6, Programs=7, ETO=8,
    // hourlyDailyTotal=9, spacer=10, flatRateSectionLabel=11, On-Call=12, flatRateDailyTotal=13
    expect(hourlyByName['Admin']).toBe(6);
    expect(hourlyByName['Programs']).toBe(7);
    expect(hourlyByName['ETO']).toBe(8);
    expect(flatRateByName['On-Call']).toBe(12);
  });

  it('records the date row correctly', () => {
    const { weekManifest } = buildWeek(0, WEEK_DATES, workOnly, [], 4, 7);
    // weekLabel=4, dayOfWeek=5, date=6
    expect(weekManifest.dateRow).toBe(6);
  });

  it('assigns correct 1-based column numbers to dates', () => {
    const { weekManifest } = buildWeek(0, WEEK_DATES, workOnly, [], 1, 7);
    const columns = weekManifest.dates.map((dateEntry) => dateEntry.column);
    // A=1 is label, so days start at B=2
    expect(columns).toEqual([2, 3, 4, 5, 6, 7, 8]);
  });

  it('records firstRow/lastRow bounding the whole week block', () => {
    const { weekManifest } = buildWeek(0, WEEK_DATES, workOnly, [], 1, 7);
    expect(weekManifest.firstRow).toBe(weekManifest.weekLabelRow);
    expect(weekManifest.lastRow).toBe(weekManifest.hourlyDailyTotalRow);
  });
});

describe('buildWeek — section omission', () => {
  it('leaves hourlySectionLabelRow/hourlyDailyTotalRow undefined and activityRows empty with no hourly activities', () => {
    const { weekManifest } = buildWeek(0, WEEK_DATES, flatRateOnly, [], 1, 7);
    expect(weekManifest.hourlySectionLabelRow).toBeUndefined();
    expect(weekManifest.hourlyDailyTotalRow).toBeUndefined();
    expect(weekManifest.activityRows).toEqual([]);
  });

  it('leaves flatRateSectionLabelRow/flatRateDailyTotalRow undefined and flatRateRows empty with no flat rate activities', () => {
    const { weekManifest } = buildWeek(0, WEEK_DATES, workOnly, [], 1, 7);
    expect(weekManifest.flatRateSectionLabelRow).toBeUndefined();
    expect(weekManifest.flatRateDailyTotalRow).toBeUndefined();
    expect(weekManifest.flatRateRows).toEqual([]);
  });

  it('only sets spacerRow when both sections are present', () => {
    expect(buildWeek(0, WEEK_DATES, workOnly, [], 1, 7).weekManifest.spacerRow).toBeUndefined();
    expect(buildWeek(0, WEEK_DATES, flatRateOnly, [], 1, 7).weekManifest.spacerRow).toBeUndefined();
    expect(buildWeek(0, WEEK_DATES, withFlatRate, [], 1, 7).weekManifest.spacerRow).toBe(10);
  });
});

describe('buildWeek — headerSpacerRow', () => {
  it('always sits directly after dateRow, regardless of which sections are present', () => {
    expect(buildWeek(0, WEEK_DATES, noActivities, [], 1, 7).weekManifest.headerSpacerRow).toBe(4);
    expect(buildWeek(0, WEEK_DATES, workOnly, [], 1, 7).weekManifest.headerSpacerRow).toBe(4);
    expect(buildWeek(0, WEEK_DATES, flatRateOnly, [], 1, 7).weekManifest.headerSpacerRow).toBe(4);
    expect(buildWeek(0, WEEK_DATES, withFlatRate, [], 1, 7).weekManifest.headerSpacerRow).toBe(4);
  });

  it('is a blank row', () => {
    const { rows, weekManifest } = buildWeek(0, WEEK_DATES, workOnly, [], 1, 7);
    expect(rows[weekManifest.headerSpacerRow - 1]).toEqual([]);
  });
});

describe('buildWeek — daily total formulas', () => {
  it('daily total row sums the hourly activity rows', () => {
    // startRow=1: weekLabel=1, dayOfWeek=2, date=3, headerSpacer=4, sectionLabel=5, Admin=6, Programs=7, dailyTotal=8
    const { rows, weekManifest } = buildWeek(0, WEEK_DATES, workOnly, [], 1, 7);
    const dailyTotalRow = rows[weekManifest.hourlyDailyTotalRow! - 1] as string[];

    expect(dailyTotalRow[0]).toBe('Daily Total');
    expect(dailyTotalRow[1]).toBe('=SUM(B6:B7)'); // first day col sums Admin and Programs
    expect(dailyTotalRow[7]).toBe('=SUM(H6:H7)'); // last day col
    expect(dailyTotalRow[8]).toBe('=SUM(B8:H8)'); // weekly total in row 8
  });

  it('the Flat Rate section gets its own daily total, summing only its own rows', () => {
    // startRow=1: weekLabel=1, dayOfWeek=2, date=3, headerSpacer=4, hourlySectionLabel=5, Admin=6, Programs=7,
    // ETO=8, hourlyDailyTotal=9, spacer=10, flatRateSectionLabel=11, On-Call=12, flatRateDailyTotal=13
    const { rows, weekManifest } = buildWeek(0, WEEK_DATES, withFlatRate, [], 1, 7);
    const hourlyDailyTotalRow = rows[weekManifest.hourlyDailyTotalRow! - 1] as string[];
    const flatRateDailyTotalRow = rows[weekManifest.flatRateDailyTotalRow! - 1] as string[];

    expect(hourlyDailyTotalRow[1]).toBe('=SUM(B6:B8)');
    expect(flatRateDailyTotalRow[1]).toBe('=SUM(B12:B12)');
    expect(flatRateDailyTotalRow[8]).toBe('=SUM(B13:H13)');
  });
});

describe('buildWeek — section label rows', () => {
  it('labels the Hourly and Flat Rate sections and each carries its own Total header', () => {
    const { rows, weekManifest } = buildWeek(0, WEEK_DATES, withFlatRate, [], 1, 7);
    const hourlySectionLabelRow = rows[weekManifest.hourlySectionLabelRow! - 1] as string[];
    const flatRateSectionLabelRow = rows[weekManifest.flatRateSectionLabelRow! - 1] as string[];

    expect(hourlySectionLabelRow[0]).toBe('Hourly');
    expect(hourlySectionLabelRow[8]).toBe('Total');
    expect(flatRateSectionLabelRow[0]).toBe('Flat Rate');
    expect(flatRateSectionLabelRow[8]).toBe('Total');
  });

  it('does not duplicate the Total header onto the date row', () => {
    const { rows, weekManifest } = buildWeek(0, WEEK_DATES, workOnly, [], 1, 7);
    const dateRow = rows[weekManifest.dateRow - 1] as string[];
    expect(dateRow[dateRow.length - 1]).toBe('');
  });
});

describe('buildWeek — week label row', () => {
  it('places the week date-range label in column A alongside any holiday name', () => {
    const holidays = [makeHoliday('2026-06-04', 'Independence Day')];
    const { rows } = buildWeek(0, WEEK_DATES, workOnly, holidays, 1, 7);
    const weekLabelRow = rows[0] as string[];

    expect(weekLabelRow[0]).toBe('Week 6/1 - 6/7');
    // 2026-06-04 is the 4th date (index 3), so col index 4 (B=1, so day 4 = col index 4)
    expect(weekLabelRow[4]).toBe('Independence Day');
    expect(weekLabelRow[1]).toBe('');
    expect(weekLabelRow[7]).toBe('');
  });
});

describe('buildWeek — weekIndex', () => {
  it('records the weekIndex in the manifest', () => {
    const { weekManifest } = buildWeek(2, WEEK_DATES, workOnly, [], 1, 7);
    expect(weekManifest.weekIndex).toBe(2);
  });
});
