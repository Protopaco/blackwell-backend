import Holiday from '#models/Holiday.js';
import { WeekManifest } from '#models/TimesheetManifest.js';
import { SortedActivities } from './sortActivities.js';
import {
  buildActivityRow,
  buildDailyTotalRow,
  buildDateRow,
  buildDayRow,
  buildDividerRow,
  buildHolidayRow,
} from './rowBuilders.js';

interface WeekBuildResult {
  rows: unknown[][];
  weekManifest: WeekManifest;
}

const buildWeek = (
  weekIndex: number,
  dates: Date[],
  sortedActivities: SortedActivities,
  holidays: Holiday[],
  startRow: number,
): WeekBuildResult => {
  const { workActivities, timeOffActivities, flatRateActivities } = sortedActivities;
  const workCount = workActivities.length;
  const timeOffCount = timeOffActivities.length;
  const flatRateCount = flatRateActivities.length;
  const dayCount = dates.length;

  // startRow + rows.length always equals the 1-based sheet row of the next row to be pushed.
  const rows: unknown[][] = [];

  rows.push(buildHolidayRow(dates, holidays));
  rows.push(buildDayRow(dates));
  rows.push(buildDateRow(dates));

  const dateRow = startRow + rows.length - 1;
  const firstActivityRow = startRow + rows.length;
  const activityRows = [];

  for (let workIndex = 0; workIndex < workCount; workIndex++) {
    rows.push(buildActivityRow(workActivities[workIndex], dayCount));
    activityRows.push({
      activityId: workActivities[workIndex].activityId,
      activityName: workActivities[workIndex].activityName,
      row: startRow + rows.length - 1,
    });
  }

  for (let timeOffIndex = 0; timeOffIndex < timeOffCount; timeOffIndex++) {
    rows.push(buildActivityRow(timeOffActivities[timeOffIndex], dayCount));
    activityRows.push({
      activityId: timeOffActivities[timeOffIndex].activityId,
      activityName: timeOffActivities[timeOffIndex].activityName,
      row: startRow + rows.length - 1,
    });
  }

  const lastHourlyRow = startRow + rows.length - 1;

  rows.push(buildDividerRow());

  if (flatRateCount > 0) {
    for (let flatRateIndex = 0; flatRateIndex < flatRateCount; flatRateIndex++) {
      rows.push(buildActivityRow(flatRateActivities[flatRateIndex], dayCount));
      activityRows.push({
        activityId: flatRateActivities[flatRateIndex].activityId,
        activityName: flatRateActivities[flatRateIndex].activityName,
        row: startRow + rows.length - 1,
      });
    }
    rows.push(buildDividerRow());
  }

  const dailyTotalRowNum = startRow + rows.length;
  const hasHourlyActivities = workCount + timeOffCount > 0;
  const formulaFirstRow = hasHourlyActivities ? firstActivityRow : dailyTotalRowNum;
  const formulaLastRow = hasHourlyActivities ? lastHourlyRow : dailyTotalRowNum;

  rows.push(buildDailyTotalRow(dates, formulaFirstRow, formulaLastRow, dailyTotalRowNum));

  const weekManifest: WeekManifest = {
    weekIndex,
    dateRow,
    dates: dates.map((date, dateIndex) => ({
      date: date.toISOString().split('T')[0],
      column: dateIndex + 2, // 1-based; A=1 is label col, so first day is B=2
    })),
    activityRows,
  };

  return { rows, weekManifest };
};

export type { WeekBuildResult };
export default buildWeek;
