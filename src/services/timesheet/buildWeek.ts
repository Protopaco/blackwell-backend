import Holiday from "#models/Holiday.js";
import { ActivityRowManifest, WeekManifest } from "#models/TimesheetManifest.js";
import { formatWeekRangeLabel } from "#utils/dateUtils.js";
import SortedActivities from '#models/SortedActivities.js';
import flattenActivityGroups from "./flattenActivityGroups.js";
import getActivityRowType from "./getActivityRowType.js";
import { groupActivities } from "./sortActivities.js";
import {
  buildActivityRow,
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
// where each row and date column landed — called once per week by generateTimesheets. Work, time off,
// and flat-rate activities are combined into one grouped/ordered block (no more separate Hourly/Flat
// Rate sections, section-label rows, or Daily Total rows — see the 2026-08-17 redesign): each activity's
// pay type is instead tagged on its own row (ActivityRowManifest.rowType) for formatting and downstream
// summary math, and named groups (activity.groupLabel) get their own header row via buildSectionLabelRow,
// reused from its former "Hourly"/"Flat Rate" section-label role.
const buildWeek = (
  weekIndex: number,
  dates: Date[],
  sortedActivities: SortedActivities,
  holidays: Holiday[],
  startRow: number,
  maxDays: number,
): WeekBuildResult => {
  const { workActivities, timeOffActivities, flatRateActivities, payRateTypeByActivityId } = sortedActivities;
  const allActivities = [
    ...flattenActivityGroups(workActivities),
    ...flattenActivityGroups(timeOffActivities),
    ...flattenActivityGroups(flatRateActivities),
  ];
  const activityGroups = groupActivities(allActivities);
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

  const activityRows: ActivityRowManifest[] = [];
  const groupHeaderRows: { groupLabel: string; row: number }[] = [];

  for (const group of activityGroups) {
    if (group.groupLabel !== null) {
      const groupHeaderRowNumber = nextRowNumber();
      rows.push(buildSectionLabelRow(group.groupLabel, maxDays));
      groupHeaderRows.push({ groupLabel: group.groupLabel, row: groupHeaderRowNumber });
    }

    for (const activity of group.activities) {
      const rowNumber = nextRowNumber();
      rows.push(buildActivityRow(activity, dayCount, rowNumber));
      activityRows.push({
        activityId: activity.activityId,
        activityName: activity.activityName,
        row: rowNumber,
        rowType: getActivityRowType(activity, payRateTypeByActivityId),
      });
    }
  }

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
    activityRows,
    groupHeaderRows,
  };

  return { rows, weekManifest };
};

export type { WeekBuildResult };
export default buildWeek;
