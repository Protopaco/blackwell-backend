import Holiday from "#models/Holiday.js";
import { type WeekManifest } from "#models/TimesheetManifest.js";
import { PRIMARY_DARK, SPACER_ROW_HEIGHT } from "#utils/timesheetTheme.js";
import isWeekend from "./isWeekend.js";
import formatHolidayNameRow from "./formatHolidayNameRow.js";
import formatDayOfWeekRow from "./formatDayOfWeekRow.js";
import formatDateRow from "./formatDateRow.js";
import formatHeaderSpacerRow from "./formatHeaderSpacerRow.js";
import formatSectionLabelRow from "./formatSectionLabelRow.js";
import formatActivityRows from "./formatActivityRows.js";
import formatRowHeight from "./formatRowHeight.js";
import outlineBlockBorder from "./outlineBlockBorder.js";

// Builds all formatting requests for a single week section — called once per week by
// applyTimesheetFormatting. Formats the header rows, every group header row (named groups only —
// ungrouped activities render with no header, see buildWeek), and every activity row (tinted per its
// rowType — see formatActivityRows), plus a block-level border around the week's full bounding range.
const formatWeekSection = (
  sheetId: number,
  week: WeekManifest,
  holidays: Holiday[],
  labelColumnIndex: number,
  firstDayColumnIndex: number,
  totalColumnCount: number,
): object[] => {
  const holidayColumnIndexes = week.dates
    .filter((dateEntry) => holidays.some((holiday) => holiday.holidayDate === dateEntry.date))
    .map((dateEntry) => dateEntry.column - 1); // manifest columns are 1-based; convert to 0-based

  const weekendColumnIndexes = week.dates
    .filter((dateEntry) => isWeekend(dateEntry.date))
    .map((dateEntry) => dateEntry.column - 1);

  const specialColumnIndexes = new Set([...holidayColumnIndexes, ...weekendColumnIndexes]);

  const requests: object[] = [
    ...formatHolidayNameRow(sheetId, week.weekLabelRow, labelColumnIndex, totalColumnCount, holidayColumnIndexes),
    ...formatDayOfWeekRow(sheetId, week.dayOfWeekRow, labelColumnIndex, totalColumnCount, holidayColumnIndexes),
    ...formatDateRow(sheetId, week.dateRow, labelColumnIndex, totalColumnCount, holidayColumnIndexes),
    ...formatHeaderSpacerRow(sheetId, week.headerSpacerRow, labelColumnIndex, totalColumnCount, holidayColumnIndexes),
    formatRowHeight(sheetId, week.headerSpacerRow, SPACER_ROW_HEIGHT),
  ];

  for (const groupHeaderRow of week.groupHeaderRows) {
    requests.push(
      ...formatSectionLabelRow(sheetId, groupHeaderRow.row, labelColumnIndex, totalColumnCount, holidayColumnIndexes),
    );
  }

  requests.push(
    ...formatActivityRows(
      sheetId,
      week.activityRows,
      labelColumnIndex,
      firstDayColumnIndex,
      totalColumnCount,
      specialColumnIndexes,
      holidayColumnIndexes,
    ),
  );

  requests.push(
    outlineBlockBorder(sheetId, week.firstRow, week.lastRow, labelColumnIndex, totalColumnCount, PRIMARY_DARK),
  );

  return requests;
};

export default formatWeekSection;
