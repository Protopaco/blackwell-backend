import { describe, it, expect } from 'vitest';
import Activity from '#models/Activity.js';
import Holiday from '#models/Holiday.js';
import { PayrollCategory } from '#models/PayrollCategory.js';
import { EmployeeActivityPayRateType, EmployeeActivityPayRateTypeType } from '#models/EmployeeActivityPayRateType.js';
import ActivityGroup from '#models/ActivityGroup.js';
import SortedActivities from '#models/SortedActivities.js';
import buildWeek from '#services/timesheet/buildWeek.js';

let nextSortOrder = 0;

const makeActivity = (
  activityName: string,
  payrollCategory: string = PayrollCategory.Regular,
  groupLabel: string | null = null,
): Activity => ({
  activityId: crypto.randomUUID(),
  activityName,
  payrollCategory: payrollCategory as Activity['payrollCategory'],
  groupLabel,
  sortOrder: nextSortOrder++,
  fundingSources: [],
});

const makeHoliday = (date: string, name: string): Holiday => ({
  holidayId: crypto.randomUUID(),
  holidayName: name,
  holidayDate: date,
});

// Wraps a flat activity list as a single ungrouped ActivityGroup bucket — buildWeek re-groups the
// combined list itself, so bucket-level grouping isn't under test here (see sortActivities.test.ts).
const asBucket = (activities: Activity[]): ActivityGroup[] =>
  activities.length > 0 ? [{ groupLabel: null, activities }] : [];

const buildSortedActivities = (
  work: Activity[],
  timeOff: Activity[],
  flatRate: Activity[],
): SortedActivities => {
  const payRateTypeByActivityId = new Map<string, EmployeeActivityPayRateTypeType>([
    ...work.map((activity): [string, EmployeeActivityPayRateTypeType] => [activity.activityId, EmployeeActivityPayRateType.Hourly]),
    ...timeOff.map((activity): [string, EmployeeActivityPayRateTypeType] => [activity.activityId, EmployeeActivityPayRateType.Hourly]),
    ...flatRate.map((activity): [string, EmployeeActivityPayRateTypeType] => [activity.activityId, EmployeeActivityPayRateType.FlatRate]),
  ]);

  return {
    workActivities: asBucket(work),
    timeOffActivities: asBucket(timeOff),
    flatRateActivities: asBucket(flatRate),
    payRateTypeByActivityId,
  };
};

const WEEK_DATES = ['2026-06-01', '2026-06-02', '2026-06-03', '2026-06-04', '2026-06-05', '2026-06-06', '2026-06-07']
  .map((s) => new Date(`${s}T12:00:00Z`));

const noActivities = buildSortedActivities([], [], []);

const admin = makeActivity('Admin');
const programs = makeActivity('Programs');
const workOnly = buildSortedActivities([admin, programs], [], []);

const eto = makeActivity('ETO', PayrollCategory.ETO);
const pto = makeActivity('PTO', PayrollCategory.PTO);
const withTimeOff = buildSortedActivities([admin, programs], [eto, pto], []);

const onCall = makeActivity('On-Call');
const withFlatRate = buildSortedActivities([admin, programs], [eto], [onCall]);

const flatRateOnly = buildSortedActivities([], [], [onCall]);

describe('buildWeek — row count', () => {
  it('produces only the fixed rows when there are zero activities', () => {
    // weekLabel + dayOfWeek + date + headerSpacer = 4
    const { rows } = buildWeek(0, WEEK_DATES, noActivities, [], 1, 7);
    expect(rows).toHaveLength(4);
  });

  it('adds one row per activity, with no section label or daily total rows, for ungrouped activities', () => {
    const { rows } = buildWeek(0, WEEK_DATES, workOnly, [], 1, 7);
    expect(rows).toHaveLength(4 + 2);
  });

  it('combines work, time off, and flat-rate activities into the same block', () => {
    const { rows } = buildWeek(0, WEEK_DATES, withFlatRate, [], 1, 7);
    expect(rows).toHaveLength(4 + 4); // Admin, Programs, ETO, On-Call
  });
});

describe('buildWeek — manifest row numbers and rowType', () => {
  it('assigns correct row numbers and tags each row with its pay type', () => {
    const { weekManifest } = buildWeek(0, WEEK_DATES, withFlatRate, [], 1, 7);
    const rowsByName = Object.fromEntries(
      weekManifest.activityRows.map((activityRow) => [activityRow.activityName, activityRow]),
    );

    // weekLabel=1, dayOfWeek=2, date=3, headerSpacer=4, then Admin=5, Programs=6, ETO=7, On-Call=8
    expect(rowsByName['Admin']).toEqual({ activityId: admin.activityId, activityName: 'Admin', row: 5, rowType: 'Hourly' });
    expect(rowsByName['Programs'].row).toBe(6);
    expect(rowsByName['ETO']).toMatchObject({ row: 7, rowType: 'ETO' });
    expect(rowsByName['On-Call']).toMatchObject({ row: 8, rowType: 'FlatRate' });
  });

  it('assigns correct row numbers when startRow is offset (second week)', () => {
    const firstWeekRowCount = buildWeek(0, WEEK_DATES, workOnly, [], 1, 7).rows.length;
    const secondWeekStartRow = 1 + firstWeekRowCount;

    const { weekManifest } = buildWeek(1, WEEK_DATES, workOnly, [], secondWeekStartRow, 7);
    const rowNums = weekManifest.activityRows.map((activityRow) => activityRow.row);

    expect(rowNums[0]).toBe(secondWeekStartRow + 4); // weekLabel + dayOfWeek + date + headerSpacer, then first activity
    expect(rowNums[1]).toBe(secondWeekStartRow + 5);
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
    expect(weekManifest.lastRow).toBe(weekManifest.activityRows[weekManifest.activityRows.length - 1].row);
  });

  it('produces an empty activityRows list with zero activities', () => {
    const { weekManifest } = buildWeek(0, WEEK_DATES, noActivities, [], 1, 7);
    expect(weekManifest.activityRows).toEqual([]);
  });
});

describe('buildWeek — group header rows', () => {
  it('adds no group header row for ungrouped activities', () => {
    const { weekManifest } = buildWeek(0, WEEK_DATES, workOnly, [], 1, 7);
    expect(weekManifest.groupHeaderRows).toEqual([]);
  });

  it('emits one header row for a named group and includes its own activities regardless of pay type', () => {
    const groupedHourly = makeActivity('Relocation Hours', PayrollCategory.Regular, 'VT Grows');
    const groupedFlatRate = makeActivity('Outreach Shifts', PayrollCategory.Regular, 'VT Grows');
    const sortedActivities = buildSortedActivities([groupedHourly], [], [groupedFlatRate]);

    const { rows, weekManifest } = buildWeek(0, WEEK_DATES, sortedActivities, [], 1, 7);

    expect(weekManifest.groupHeaderRows).toHaveLength(1);
    expect(weekManifest.groupHeaderRows[0].groupLabel).toBe('VT Grows');

    const headerRow = rows[weekManifest.groupHeaderRows[0].row - 1] as string[];
    expect(headerRow[0]).toBe('VT Grows');
    expect(headerRow[headerRow.length - 1]).toBe('Total');

    const activityNames = weekManifest.activityRows.map((activityRow) => activityRow.activityName);
    expect(activityNames).toEqual(['Relocation Hours', 'Outreach Shifts']);
  });

  it('places the ungrouped block first, followed by named groups alphabetically', () => {
    const ungrouped = makeActivity('Solo');
    const zetaMember = makeActivity('Z Member', PayrollCategory.Regular, 'Zeta Group');
    const alphaMember = makeActivity('A Member', PayrollCategory.Regular, 'Alpha Group');
    const sortedActivities = buildSortedActivities([ungrouped, zetaMember, alphaMember], [], []);

    const { weekManifest } = buildWeek(0, WEEK_DATES, sortedActivities, [], 1, 7);

    expect(weekManifest.groupHeaderRows.map((groupHeaderRow) => groupHeaderRow.groupLabel)).toEqual([
      'Alpha Group',
      'Zeta Group',
    ]);
    expect(weekManifest.activityRows.map((activityRow) => activityRow.activityName)).toEqual([
      'Solo',
      'A Member',
      'Z Member',
    ]);
  });
});

describe('buildWeek — headerSpacerRow', () => {
  it('always sits directly after dateRow, regardless of activity content', () => {
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

describe('buildWeek — activity row content', () => {
  it('gives each activity row a per-day SUM formula in the weekly total column', () => {
    const { rows, weekManifest } = buildWeek(0, WEEK_DATES, workOnly, [], 1, 7);
    const adminRowNumber = weekManifest.activityRows.find((activityRow) => activityRow.activityName === 'Admin')!.row;
    const adminRow = rows[adminRowNumber - 1] as string[];

    expect(adminRow[0]).toBe('Admin');
    expect(adminRow[8]).toBe(`=SUM(B${adminRowNumber}:H${adminRowNumber})`);
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
