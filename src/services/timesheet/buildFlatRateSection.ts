import Activity from "#models/Activity.js";
import { ActivityRowManifest } from "#models/TimesheetManifest.js";
import { buildActivityRow, buildDailyTotalRow, buildSectionLabelRow } from "./rowBuilders.js";

interface FlatRateSectionBuildResult {
  rows: unknown[][];
  flatRateSectionLabelRow?: number;
  flatRateRows: ActivityRowManifest[];
  flatRateDailyTotalRow?: number;
}

// Builds the Flat Rate section (section label + one row per flat-rate activity + daily total) for a
// single week — shared by buildWeek (TotalHours-mode weeks) and buildClockInOutWeek (ClockInOut-mode
// weeks), since flat-rate activities are quantities, not hours, and use this same day-per-column layout
// in both modes. Returns empty/undefined fields, and writes no rows, when the employee has no flat-rate
// activities that week.
const buildFlatRateSection = (
  flatRateActivities: Activity[],
  dates: Date[],
  maxDays: number,
  startRow: number,
): FlatRateSectionBuildResult => {
  if (flatRateActivities.length === 0) {
    return { rows: [], flatRateRows: [] };
  }

  const dayCount = dates.length;
  const rows: unknown[][] = [];
  const nextRowNumber = (): number => startRow + rows.length;

  const flatRateSectionLabelRow = nextRowNumber();
  rows.push(buildSectionLabelRow("Flat Rate", maxDays));

  const flatRateRows: ActivityRowManifest[] = [];
  const firstFlatRateRow = nextRowNumber();
  for (const activity of flatRateActivities) {
    const rowNumber = nextRowNumber();
    rows.push(buildActivityRow(activity, dayCount, rowNumber));
    flatRateRows.push({ activityId: activity.activityId, activityName: activity.activityName, row: rowNumber });
  }
  const lastFlatRateRow = nextRowNumber() - 1;

  const flatRateDailyTotalRow = nextRowNumber();
  rows.push(buildDailyTotalRow(dates, firstFlatRateRow, lastFlatRateRow, flatRateDailyTotalRow));

  return { rows, flatRateSectionLabelRow, flatRateRows, flatRateDailyTotalRow };
};

export type { FlatRateSectionBuildResult };
export default buildFlatRateSection;
