import { ClockInOutDayManifest, ClockInOutFlatRateRowManifest, ClockInOutWeekManifest } from "#models/TimesheetManifest.js";
import { SortedActivities } from "./sortActivities.js";
import { CLOCK_IN_OUT_SLOTS_PER_DAY, CLOCK_IN_OUT_SPACER_COLUMN_WIDTH, CLOCK_IN_OUT_WEEK_COLUMN_WIDTH } from "#config/constants.js";
import {
  buildClockInOutColumnHeaderRow,
  buildClockInOutDayHeaderRow,
  buildClockInOutFlatRateActivityRow,
  buildClockInOutFlatRateSectionLabelRow,
  buildClockInOutSlotRow,
  buildClockInOutWeekLabelRow,
} from "./rowBuilders.js";

interface TimesheetBuildResult {
  rows: unknown[][];
  clockInOutWeeks: ClockInOutWeekManifest[];
}

// Builds every row of a ClockInOut timesheet in one call, for the whole pay period — unlike buildWeek's
// per-week, stacked-vertically layout, ClockInOut weeks sit side by side sharing row numbers (per the
// 2026-08-12 mockup): each week gets its own 4-column group (label/In/Out/Total) at a fixed
// labelColumnIndex, separated by a 1-column spacer. Because every week has the same day count (pay
// periods are always a whole number of weeks — no partial weeks to align) and the same flat-rate
// activities (both are employee/pay-period-wide, not per-week), the row sequence is computed once and
// reused for every week's column group; only labelColumnIndex and each row's content differ per week.
// Each day gets its own Hourly slots followed by its own Flat Rate section (when the employee has any
// flat-rate activities) — decided 2026-08-12 that Flat Rate belongs under every day, not once per week.
const buildClockInOutTimesheet = (
  weeks: Date[][],
  sortedActivities: SortedActivities,
  startRow: number,
): TimesheetBuildResult => {
  const { workActivities, timeOffActivities, flatRateActivities } = sortedActivities;
  const hourlyActivities = [...workActivities, ...timeOffActivities];
  const daysPerWeek = weeks[0]?.length ?? 0;
  const hasFlatRateActivities = flatRateActivities.length > 0;

  const rows: unknown[][] = [];
  const nextRowNumber = (): number => startRow + rows.length;

  const labelColumnIndexForWeek = (weekIndex: number): number =>
    weekIndex * (CLOCK_IN_OUT_WEEK_COLUMN_WIDTH + CLOCK_IN_OUT_SPACER_COLUMN_WIDTH);

  // Pushes one full-width row built from each week's own 4-column content, joined by single blank
  // spacer columns between week groups.
  const pushRow = (contentPerWeek: unknown[][]): void => {
    const fullRow: unknown[] = [];
    contentPerWeek.forEach((weekContent, weekIndex) => {
      fullRow.push(...weekContent);
      if (weekIndex < contentPerWeek.length - 1) fullRow.push(...Array(CLOCK_IN_OUT_SPACER_COLUMN_WIDTH).fill(''));
    });
    rows.push(fullRow);
  };

  const weekLabelRow = nextRowNumber();
  pushRow(weeks.map((weekDates) => buildClockInOutWeekLabelRow(weekDates)));

  const days: ClockInOutDayManifest[] = [];
  for (let dayIndex = 0; dayIndex < daysPerWeek; dayIndex++) {
    const dayHeaderRow = nextRowNumber();
    pushRow(weeks.map((weekDates) => buildClockInOutDayHeaderRow(weekDates[dayIndex])));

    const columnHeaderRow = nextRowNumber();
    pushRow(weeks.map(() => buildClockInOutColumnHeaderRow()));

    const slotRows: { row: number }[] = [];
    for (let slotIndex = 0; slotIndex < CLOCK_IN_OUT_SLOTS_PER_DAY; slotIndex++) {
      const slotRowNumber = nextRowNumber();
      pushRow(weeks.map((_weekDates, weekIndex) => buildClockInOutSlotRow(slotRowNumber, labelColumnIndexForWeek(weekIndex))));
      slotRows.push({ row: slotRowNumber });
    }

    let flatRateSectionLabelRow: number | undefined;
    const flatRateRows: ClockInOutFlatRateRowManifest[] = [];

    if (hasFlatRateActivities) {
      flatRateSectionLabelRow = nextRowNumber();
      pushRow(weeks.map(() => buildClockInOutFlatRateSectionLabelRow()));

      for (const activity of flatRateActivities) {
        const flatRateRowNumber = nextRowNumber();
        pushRow(
          weeks.map((_weekDates, weekIndex) =>
            buildClockInOutFlatRateActivityRow(activity, flatRateRowNumber, labelColumnIndexForWeek(weekIndex)),
          ),
        );
        flatRateRows.push({
          activityId: activity.activityId,
          activityName: activity.activityName,
          row: flatRateRowNumber,
        });
      }
    }

    days.push({
      date: weeks[0][dayIndex].toISOString().split("T")[0], // placeholder — overwritten per week below
      dayHeaderRow,
      columnHeaderRow,
      slotRows,
      flatRateSectionLabelRow,
      flatRateRows,
    });

    // Blank break row between each day's block, for visual separation — not the last day, so no
    // trailing blank row after the final day.
    if (dayIndex < daysPerWeek - 1) {
      pushRow(weeks.map(() => Array(CLOCK_IN_OUT_WEEK_COLUMN_WIDTH).fill('')));
    }
  }

  const clockInOutWeeks: ClockInOutWeekManifest[] = weeks.map((weekDates, weekIndex) => ({
    weekIndex,
    labelColumnIndex: labelColumnIndexForWeek(weekIndex),
    weekLabelRow,
    days: days.map((day, dayIndex) => ({
      ...day,
      date: weekDates[dayIndex].toISOString().split("T")[0],
    })),
  }));

  return { rows, clockInOutWeeks };
};

export type { TimesheetBuildResult };
export default buildClockInOutTimesheet;
