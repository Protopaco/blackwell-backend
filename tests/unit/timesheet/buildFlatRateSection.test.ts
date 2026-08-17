import { describe, it, expect } from 'vitest';
import Activity from '#models/Activity.js';
import { PayrollCategory } from '#models/PayrollCategory.js';
import buildFlatRateSection from '#services/timesheet/buildFlatRateSection.js';

const makeActivity = (activityName: string): Activity => ({
  activityId: crypto.randomUUID(),
  activityName,
  trackSeparately: false,
  payrollCategory: PayrollCategory.Regular,
  groupLabel: null,
  sortOrder: 0,
  fundingSources: [],
});

const WEEK_DATES = ['2026-06-01', '2026-06-02', '2026-06-03', '2026-06-04', '2026-06-05', '2026-06-06', '2026-06-07']
  .map((s) => new Date(`${s}T12:00:00Z`));

describe('buildFlatRateSection — no flat rate activities', () => {
  it('returns no rows and undefined row numbers', () => {
    const result = buildFlatRateSection([], WEEK_DATES, 7, 1);
    expect(result.rows).toEqual([]);
    expect(result.flatRateSectionLabelRow).toBeUndefined();
    expect(result.flatRateDailyTotalRow).toBeUndefined();
    expect(result.flatRateRows).toEqual([]);
  });
});

describe('buildFlatRateSection — with flat rate activities', () => {
  const flatRateActivities = [makeActivity('On-Call'), makeActivity('Mileage')];

  it('produces sectionLabel + one row per activity + dailyTotal', () => {
    const result = buildFlatRateSection(flatRateActivities, WEEK_DATES, 7, 1);
    expect(result.rows).toHaveLength(4);
  });

  it('assigns row numbers starting at startRow', () => {
    const result = buildFlatRateSection(flatRateActivities, WEEK_DATES, 7, 10);
    expect(result.flatRateSectionLabelRow).toBe(10);
    expect(result.flatRateRows.map((row) => row.row)).toEqual([11, 12]);
    expect(result.flatRateDailyTotalRow).toBe(13);
  });

  it('labels each row with its activity name and id', () => {
    const result = buildFlatRateSection(flatRateActivities, WEEK_DATES, 7, 1);
    expect(result.flatRateRows.map((row) => row.activityName)).toEqual(['On-Call', 'Mileage']);
    expect(result.flatRateRows.map((row) => row.activityId)).toEqual(
      flatRateActivities.map((activity) => activity.activityId),
    );
  });

  it('the section label row carries "Flat Rate" and a Total header', () => {
    const result = buildFlatRateSection(flatRateActivities, WEEK_DATES, 7, 1);
    const sectionLabelRow = result.rows[0] as string[];
    expect(sectionLabelRow[0]).toBe('Flat Rate');
    expect(sectionLabelRow[sectionLabelRow.length - 1]).toBe('Total');
  });

  it('the daily total row sums only the flat-rate activity rows', () => {
    const result = buildFlatRateSection(flatRateActivities, WEEK_DATES, 7, 1);
    const dailyTotalRow = result.rows[result.rows.length - 1] as string[];
    expect(dailyTotalRow[0]).toBe('Daily Total');
    expect(dailyTotalRow[1]).toBe('=SUM(B2:B3)');
  });
});
