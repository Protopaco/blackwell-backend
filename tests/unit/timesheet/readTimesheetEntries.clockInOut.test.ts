import { describe, it, expect, beforeEach, vi } from 'vitest';
import Activity from '#models/Activity.js';
import Employee from '#models/Employee.js';
import TimesheetManifest, { ClockInOutWeekManifest } from '#models/TimesheetManifest.js';
import { PayrollCategory } from '#models/PayrollCategory.js';
import { EmployeeStatus } from '#models/EmployeeStatus.js';
import { EmployeeActivityPayRateType } from '#models/EmployeeActivityPayRateType.js';
import { MANIFEST_TAB } from '#config/constants.js';

const { readTabValuesMock } = vi.hoisted(() => ({ readTabValuesMock: vi.fn() }));
vi.mock('#db/adapter/readTabValues.js', () => ({ default: readTabValuesMock }));

import readTimesheetEntries from '#services/timesheet/readTimesheetEntries.js';

const TAB_NAME = '06/01 - 06/07';

const employee: Employee = {
  employeeId: 'employee-1',
  firstName: 'Jane',
  lastName: 'Doe',
  position: 'Director',
  salaryAmount: 0,
  activityRates: [
    { activityId: 'activity-admin', payRateType: EmployeeActivityPayRateType.Hourly, payRate: 20, holidayPayRate: 30 },
    { activityId: 'activity-oncall', payRateType: EmployeeActivityPayRateType.FlatRate, payRate: 50, holidayPayRate: 50 },
  ],
  email: 'jane@example.com',
  status: EmployeeStatus.Active,
  timesheetFileId: 'timesheet-file-1',
};

const activityMap = new Map<string, Activity>([
  ['activity-admin', {
    activityId: 'activity-admin',
    activityName: 'Admin',
    trackSeparately: false,
    payrollCategory: PayrollCategory.Regular,
    groupLabel: null,
    sortOrder: 0,
    fundingSources: [],
  }],
  ['activity-oncall', {
    activityId: 'activity-oncall',
    activityName: 'On-Call',
    trackSeparately: false,
    payrollCategory: PayrollCategory.Regular,
    groupLabel: null,
    sortOrder: 0,
    fundingSources: [],
  }],
]);

// Builds a one-week, one-day ClockInOut manifest at labelColumnIndex 0 whose day has the given slot rows
// (rows 5..5+slotRowCount-1) and, if flatRateRowCount > 0, one flat-rate row directly after them.
const buildManifest = (slotRowCount: number, flatRateRowCount = 0): TimesheetManifest => {
  const slotRows = Array.from({ length: slotRowCount }, (_, index) => ({ row: 5 + index }));
  const flatRateRows = Array.from({ length: flatRateRowCount }, (_, index) => ({
    activityId: 'activity-oncall',
    activityName: 'On-Call',
    row: 5 + slotRowCount + index,
  }));

  const week: ClockInOutWeekManifest = {
    weekIndex: 0,
    labelColumnIndex: 0,
    weekLabelRow: 1,
    days: [{
      date: '2026-06-01',
      dayHeaderRow: 2,
      columnHeaderRow: 3,
      slotRows,
      flatRateSectionLabelRow: flatRateRowCount > 0 ? 5 + slotRowCount - 1 + 1 : undefined,
      flatRateRows,
    }],
  };

  return {
    payPeriodId: 'pay-period-1',
    employeeId: employee.employeeId,
    generatedAt: '2026-06-01T00:00:00Z',
    tabName: TAB_NAME,
    weeks: [],
    employeeSignatureCell: { row: 20, column: 2 },
    supervisorSignatureCell: { row: 21, column: 2 },
    includeInPayrollCell: { row: 22, column: 2 },
    summaryRows: [],
    clockInOutWeeks: [week],
  };
};

// tabValuesBySlotRow/tabValuesByFlatRateRow are 1-based row -> [activity, in, out, total] (slot rows) or
// [activityName, shifts, '', total] (flat-rate rows) — mockTabValues assembles the full sparse grid.
const mockTabValues = (manifest: TimesheetManifest, rowValues: Record<number, unknown[]>): void => {
  readTabValuesMock.mockImplementation(async (_fileId: string, tabName: string) => {
    if (tabName === MANIFEST_TAB) return [[TAB_NAME, JSON.stringify(manifest)]];
    const grid: unknown[][] = [];
    for (const [rowNumber, values] of Object.entries(rowValues)) {
      grid[Number(rowNumber) - 1] = values;
    }
    return grid;
  });
};

describe('readTimesheetEntries — ClockInOut branch', () => {
  beforeEach(() => {
    readTabValuesMock.mockReset();
  });

  it('rule 1: no activity, both blank — skips, not an entry', async () => {
    const manifest = buildManifest(1);
    mockTabValues(manifest, { 5: ['', '', '', ''] });

    const entries = await readTimesheetEntries(employee, TAB_NAME, activityMap, []);
    expect(entries).toEqual([]);
  });

  it('rule 2: no activity, one of In/Out has a value — throws with employee name and date', async () => {
    const manifest = buildManifest(1);
    mockTabValues(manifest, { 5: ['', '9:00 AM', '', ''] });

    await expect(readTimesheetEntries(employee, TAB_NAME, activityMap, []))
      .rejects.toThrow(/Jane Doe's 6\/1 timesheet entry has a clock-in or clock-out time recorded with no activity selected/);
  });

  it('rule 3: activity selected, both blank — 0 hours, skips', async () => {
    const manifest = buildManifest(1);
    mockTabValues(manifest, { 5: ['Admin', '', '', ''] });

    const entries = await readTimesheetEntries(employee, TAB_NAME, activityMap, []);
    expect(entries).toEqual([]);
  });

  it('rule 4: activity selected, only one of In/Out filled — throws', async () => {
    const manifest = buildManifest(1);
    mockTabValues(manifest, { 5: ['Admin', '9:00 AM', '', ''] });

    await expect(readTimesheetEntries(employee, TAB_NAME, activityMap, []))
      .rejects.toThrow(/Jane Doe's 6\/1 timesheet entry is missing a clock-in or clock-out time/);
  });

  it('rule 5: activity selected, Clock Out before Clock In — throws', async () => {
    const manifest = buildManifest(1);
    mockTabValues(manifest, { 5: ['Admin', '5:00 PM', '9:00 AM', ''] });

    await expect(readTimesheetEntries(employee, TAB_NAME, activityMap, []))
      .rejects.toThrow(/Jane Doe's 6\/1 timesheet entry has a clock-out time before the clock-in time/);
  });

  it('rule 6: activity selected, valid Clock In/Out — emits one TimesheetEntry with computed hours', async () => {
    const manifest = buildManifest(1);
    mockTabValues(manifest, { 5: ['Admin', '9:00 AM', '5:00 PM', ''] });

    const entries = await readTimesheetEntries(employee, TAB_NAME, activityMap, []);
    expect(entries).toEqual([{
      employeeId: 'employee-1',
      employeeName: 'Jane Doe',
      activityId: 'activity-admin',
      activityName: 'Admin',
      payrollCategory: PayrollCategory.Regular,
      payRateType: EmployeeActivityPayRateType.Hourly,
      date: '2026-06-01',
      isHoliday: false,
      hours: 8,
    }]);
  });

  it('rule 6 edge case: Clock In equals Clock Out — valid, but 0 hours, so nothing is emitted', async () => {
    const manifest = buildManifest(1);
    mockTabValues(manifest, { 5: ['Admin', '9:00 AM', '9:00 AM', ''] });

    const entries = await readTimesheetEntries(employee, TAB_NAME, activityMap, []);
    expect(entries).toEqual([]);
  });

  it('rule 7: activity selected, an unparseable time value — throws', async () => {
    const manifest = buildManifest(1);
    mockTabValues(manifest, { 5: ['Admin', 'garbage', '5:00 PM', ''] });

    await expect(readTimesheetEntries(employee, TAB_NAME, activityMap, []))
      .rejects.toThrow(/Jane Doe's 6\/1 timesheet entry has a clock-in or clock-out time that isn't a valid time/);
  });

  it('unrecognized activity, no hours attached — skips silently', async () => {
    const manifest = buildManifest(1);
    mockTabValues(manifest, { 5: ['Deleted Activity', '', '', ''] });

    const entries = await readTimesheetEntries(employee, TAB_NAME, activityMap, []);
    expect(entries).toEqual([]);
  });

  it('unrecognized activity, hours attached — throws rather than silently dropping the data', async () => {
    const manifest = buildManifest(1);
    mockTabValues(manifest, { 5: ['Deleted Activity', '9:00 AM', '5:00 PM', ''] });

    await expect(readTimesheetEntries(employee, TAB_NAME, activityMap, []))
      .rejects.toThrow(/Jane Doe's 6\/1 timesheet entry references an activity that's no longer assigned to them/);
  });

  it('marks the entry as a holiday when the day falls on a configured holiday', async () => {
    const manifest = buildManifest(1);
    mockTabValues(manifest, { 5: ['Admin', '9:00 AM', '5:00 PM', ''] });

    const entries = await readTimesheetEntries(employee, TAB_NAME, activityMap, [
      { holidayId: 'holiday-1', holidayName: 'Test Holiday', holidayDate: '2026-06-01' },
    ]);
    expect(entries).toHaveLength(1);
    expect(entries[0].isHoliday).toBe(true);
  });

  it('Flat Rate: a nonzero Shifts quantity emits a TimesheetEntry using the entered quantity as hours', async () => {
    const manifest = buildManifest(0, 1);
    mockTabValues(manifest, { 5: ['On-Call', '2', '', '2'] });

    const entries = await readTimesheetEntries(employee, TAB_NAME, activityMap, []);
    expect(entries).toEqual([{
      employeeId: 'employee-1',
      employeeName: 'Jane Doe',
      activityId: 'activity-oncall',
      activityName: 'On-Call',
      payrollCategory: PayrollCategory.Regular,
      payRateType: EmployeeActivityPayRateType.FlatRate,
      date: '2026-06-01',
      isHoliday: false,
      hours: 2,
    }]);
  });

  it('Flat Rate: a blank Shifts cell is skipped', async () => {
    const manifest = buildManifest(0, 1);
    mockTabValues(manifest, { 5: ['On-Call', '', '', ''] });

    const entries = await readTimesheetEntries(employee, TAB_NAME, activityMap, []);
    expect(entries).toEqual([]);
  });

  it('reads both an Hourly slot and a Flat Rate row for the same day into one combined result', async () => {
    const manifest = buildManifest(1, 1);
    mockTabValues(manifest, {
      5: ['Admin', '9:00 AM', '5:00 PM', ''],
      6: ['On-Call', '1', '', '1'],
    });

    const entries = await readTimesheetEntries(employee, TAB_NAME, activityMap, []);
    expect(entries).toHaveLength(2);
    expect(entries.map((entry) => entry.activityName).sort()).toEqual(['Admin', 'On-Call']);
  });
});
