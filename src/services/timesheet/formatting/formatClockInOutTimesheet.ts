import { type ClockInOutWeekManifest } from "#models/TimesheetManifest.js";
import {
  CLOCK_IN_OUT_WEEK_COLUMN_WIDTH,
  CLOCK_IN_OUT_ACTIVITY_COLUMN_OFFSET,
  CLOCK_IN_OUT_IN_COLUMN_OFFSET,
  CLOCK_IN_OUT_OUT_COLUMN_OFFSET,
} from "#config/constants.js";
import { CLOCK_IN_OUT_ACTIVITY_COLUMN_WIDTH, PRIMARY_DARK } from "#utils/timesheetTheme.js";
import {
  dayOfWeekRow,
  dailyTotalRow,
  weekLabelRow as weekLabelRowStyle,
  mutedDataEntryRow,
  primaryDataEntryRow,
} from "./rowStyles.js";
import applyRowStyle from "./applyRowStyle.js";
import setActivityDataValidation from "./setActivityDataValidation.js";
import outlineBlockBorder from "./outlineBlockBorder.js";
import apiRange from "./apiRange.js";

// The custom number format applied to a ClockInOut day's In/Out cells so entered times render as
// "09:00 AM" rather than a raw decimal — Google Sheets still stores the underlying value as a time
// serial number either way, which is what the slot row's Total formula (MROUND-based) depends on.
const CLOCK_IN_OUT_TIME_FORMAT_PATTERN = "hh:mm AM/PM";

// Builds a mergeCells request joining a Flat Rate row's In/Out column pair into one visual "Shifts" cell
// — the two columns still exist underneath (only the In-column cell holds the entered value), only their
// display is merged.
const buildMergeShiftsCellRequest = (sheetId: number, rowNumber: number, labelColumnIndex: number): object => ({
  mergeCells: {
    range: apiRange(
      sheetId,
      rowNumber - 1,
      rowNumber,
      labelColumnIndex + CLOCK_IN_OUT_IN_COLUMN_OFFSET,
      labelColumnIndex + CLOCK_IN_OUT_OUT_COLUMN_OFFSET + 1,
    ),
    mergeType: "MERGE_ALL",
  },
});

// Builds an updateDimensionProperties request widening a week's activity dropdown column (the same
// column the Flat Rate section's activity-name column sits in) so long activity names aren't cut off.
const buildActivityColumnWidthRequest = (sheetId: number, labelColumnIndex: number): object => ({
  updateDimensionProperties: {
    range: {
      sheetId,
      dimension: "COLUMNS",
      startIndex: labelColumnIndex + CLOCK_IN_OUT_ACTIVITY_COLUMN_OFFSET,
      endIndex: labelColumnIndex + CLOCK_IN_OUT_ACTIVITY_COLUMN_OFFSET + 1,
    },
    properties: { pixelSize: CLOCK_IN_OUT_ACTIVITY_COLUMN_WIDTH },
    fields: "pixelSize",
  },
});

// Builds a repeatCell request applying the time number format to a day's In/Out columns across its
// whole slot-row range in one call — firstSlotRowNumber/lastSlotRowNumber are 1-based and inclusive.
const buildTimeFormatRequest = (
  sheetId: number,
  firstSlotRowNumber: number,
  lastSlotRowNumber: number,
  labelColumnIndex: number,
): object => ({
  repeatCell: {
    range: apiRange(
      sheetId,
      firstSlotRowNumber - 1,
      lastSlotRowNumber,
      labelColumnIndex + CLOCK_IN_OUT_IN_COLUMN_OFFSET,
      labelColumnIndex + CLOCK_IN_OUT_OUT_COLUMN_OFFSET + 1,
    ),
    cell: {
      userEnteredFormat: {
        numberFormat: { type: "TIME", pattern: CLOCK_IN_OUT_TIME_FORMAT_PATTERN },
      },
    },
    fields: "userEnteredFormat.numberFormat",
  },
});

// Builds all formatting requests for every ClockInOut week's column group — called once by
// applyTimesheetFormatting when manifest.clockInOutWeeks is populated. Deliberately minimal (2026-08-12
// decision to make ClockInOut generation work first and defer bespoke polish): reuses the existing
// dayOfWeekRow/dailyTotalRow/sectionLabelRow styles and the current theme palette rather than
// introducing new ones. Each day carries its own Flat Rate section (per 2026-08-12 decision) directly
// below its Hourly slots.
const formatClockInOutTimesheet = (
  sheetId: number,
  clockInOutWeeks: ClockInOutWeekManifest[],
  hourlyActivityNames: string[],
): object[] => {
  const requests: object[] = [];

  for (const week of clockInOutWeeks) {
    const weekEndColumnIndex = week.labelColumnIndex + CLOCK_IN_OUT_WEEK_COLUMN_WIDTH;

    requests.push(
      buildActivityColumnWidthRequest(sheetId, week.labelColumnIndex),
      ...applyRowStyle(sheetId, weekLabelRowStyle, week.weekLabelRow, week.labelColumnIndex, weekEndColumnIndex),
    );

    for (const day of week.days) {
      requests.push(
        ...applyRowStyle(sheetId, dayOfWeekRow, day.dayHeaderRow, week.labelColumnIndex, weekEndColumnIndex),
        ...applyRowStyle(sheetId, dailyTotalRow, day.columnHeaderRow, week.labelColumnIndex, weekEndColumnIndex),
        buildTimeFormatRequest(
          sheetId,
          day.slotRows[0].row,
          day.slotRows[day.slotRows.length - 1].row,
          week.labelColumnIndex,
        ),
      );

      day.slotRows.forEach((slotRow, slotIndex) => {
        const zebraStyle = slotIndex % 2 === 0 ? mutedDataEntryRow : primaryDataEntryRow;
        requests.push(
          ...applyRowStyle(sheetId, zebraStyle, slotRow.row, week.labelColumnIndex, weekEndColumnIndex),
          setActivityDataValidation(
            sheetId,
            slotRow.row,
            week.labelColumnIndex + CLOCK_IN_OUT_ACTIVITY_COLUMN_OFFSET,
            hourlyActivityNames,
          ),
        );
      });

      if (day.flatRateSectionLabelRow !== undefined) {
        requests.push(
          ...applyRowStyle(sheetId, dailyTotalRow, day.flatRateSectionLabelRow, week.labelColumnIndex, weekEndColumnIndex),
          buildMergeShiftsCellRequest(sheetId, day.flatRateSectionLabelRow, week.labelColumnIndex),
        );
        day.flatRateRows.forEach((flatRateRow, flatRateIndex) => {
          const zebraStyle = flatRateIndex % 2 === 0 ? mutedDataEntryRow : primaryDataEntryRow;
          requests.push(
            ...applyRowStyle(sheetId, zebraStyle, flatRateRow.row, week.labelColumnIndex, weekEndColumnIndex),
            buildMergeShiftsCellRequest(sheetId, flatRateRow.row, week.labelColumnIndex),
          );
        });
      }

      const lastDayRow =
        day.flatRateRows.length > 0
          ? day.flatRateRows[day.flatRateRows.length - 1].row
          : day.slotRows[day.slotRows.length - 1].row;
      requests.push(
        outlineBlockBorder(sheetId, day.dayHeaderRow, lastDayRow, week.labelColumnIndex, weekEndColumnIndex, PRIMARY_DARK, true),
      );
    }
  }

  return requests;
};

export default formatClockInOutTimesheet;
