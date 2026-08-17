import Holiday from "#models/Holiday.js";
import { ActivityRowManifest, WeekManifest } from "#models/TimesheetManifest.js";
import { formatWeekRangeLabel } from "#utils/dateUtils.js";
import SortedActivities from '#models/SortedActivities.js';
import buildFlatRateSection from "./buildFlatRateSection.js";
import {
  buildActivityRow,
  buildDailyTotalRow,
  buildDateRow,
  buildDayRow,
  buildDividerRow,
  buildHolidayRow,
  buildSectionLabelRow,
} from "./rowBuilders.js";

interface WeekBuildResult {
  rows: unknown[][];
  weekManifest: WeekManifest;
}

// Builds all sheet rows for one week of a timesheet and returns row data plus a manifest summary of
// where each row and date column landed — called once per week by generateTimesheets. The Hourly
// section (work + time-off activities) and the Flat Rate section are each fully omitted — no
// sectionLabelRow, no activity rows, no dailyTotalRow — when the employee has zero activities of that
// type; a spacerRow separates the two sections only when both are present that week. headerSpacerRow
// always separates dateRow from whichever section comes first.
const buildWeek = (
  weekIndex: number,
  dates: Date[],
  sortedActivities: SortedActivities,
  holidays: Holiday[],
  startRow: number,
  maxDays: number,
): WeekBuildResult => {
  const { workActivities, timeOffActivities, flatRateActivities } = sortedActivities;
  const hourlyActivities = [...workActivities, ...timeOffActivities];
  const hasHourlyActivities = hourlyActivities.length > 0;
  const hasFlatRateActivities = flatRateActivities.length > 0;
  const dayCount = dates.length;

  const rows: unknown[][] = [];
  const nextRowNumber = (): number => startRow + rows.length;

  const weekLabelRow = nextRowNumber();
  rows.push(buildHolidayRow(dates, holidays, formatWeekRangeLabel(dates)));

  const dayOfWeekRow = nextRowNumber();
  rows.push(buildDayRow(dates));

  const dateRow = nextRowNumber();
  rows.push(buildDateRow(dates, maxDays));

  const headerSpacerRow = nextRowNumber();
  rows.push(buildDividerRow());

  let hourlySectionLabelRow: number | undefined;
  const activityRows: ActivityRowManifest[] = [];
  let hourlyDailyTotalRow: number | undefined;

  if (hasHourlyActivities) {
    hourlySectionLabelRow = nextRowNumber();
    rows.push(buildSectionLabelRow("Hourly", maxDays));

    const firstActivityRow = nextRowNumber();
    for (const activity of hourlyActivities) {
      const rowNumber = nextRowNumber();
      rows.push(buildActivityRow(activity, dayCount, rowNumber));
      activityRows.push({ activityId: activity.activityId, activityName: activity.activityName, row: rowNumber });
    }
    const lastActivityRow = nextRowNumber() - 1;

    hourlyDailyTotalRow = nextRowNumber();
    rows.push(buildDailyTotalRow(dates, firstActivityRow, lastActivityRow, hourlyDailyTotalRow));
  }

  let spacerRow: number | undefined;
  if (hasHourlyActivities && hasFlatRateActivities) {
    spacerRow = nextRowNumber();
    rows.push(buildDividerRow());
  }

  const flatRateSection = buildFlatRateSection(flatRateActivities, dates, maxDays, nextRowNumber());
  rows.push(...flatRateSection.rows);
  const { flatRateSectionLabelRow, flatRateRows, flatRateDailyTotalRow } = flatRateSection;

  const lastRow = nextRowNumber() - 1;

  const weekManifest: WeekManifest = {
    weekIndex,
    firstRow: weekLabelRow,
    lastRow,
    weekLabelRow,
    dayOfWeekRow,
    dateRow,
    dates: dates.map((date, dateIndex) => ({
      date: date.toISOString().split("T")[0],
      column: dateIndex + 2, // 1-based; A=1 is label col, so first day is B=2
    })),
    headerSpacerRow,
    hourlySectionLabelRow,
    activityRows,
    hourlyDailyTotalRow,
    spacerRow,
    flatRateSectionLabelRow,
    flatRateRows,
    flatRateDailyTotalRow,
  };

  return { rows, weekManifest };
};

export type { WeekBuildResult };
export default buildWeek;
