import Holiday from "#models/Holiday.js";
import { type WeekManifest } from "#models/TimesheetManifest.js";
import isWeekend from "./isWeekend.js";
import formatHolidayNameRow from "./formatHolidayNameRow.js";
import formatDayOfWeekRow from "./formatDayOfWeekRow.js";
import formatDateRow from "./formatDateRow.js";
import formatActivityRows from "./formatActivityRows.js";
import formatDividerRows from "./formatDividerRows.js";
import formatDailyTotalRow from "./formatDailyTotalRow.js";

// Builds all formatting requests for a single week section — called once per week by applyTimesheetFormatting.
const formatWeekSection = (
  sheetId: number,
  week: WeekManifest,
  holidays: Holiday[],
  labelColumnIndex: number,
  firstDayColumnIndex: number,
  totalColumnCount: number,
): object[] => {
  const holidayNameRowNumber = week.dateRow - 2;
  const dayOfWeekRowNumber = week.dateRow - 1;
  const dateRowNumber = week.dateRow;
  const dailyTotalRowNumber = week.dailyTotalRow;

  const holidayColumnIndexes = week.dates
    .filter((dateEntry) => holidays.some((holiday) => holiday.holidayDate === dateEntry.date))
    .map((dateEntry) => dateEntry.column - 1); // manifest columns are 1-based; convert to 0-based

  const weekendColumnIndexes = week.dates
    .filter((dateEntry) => isWeekend(dateEntry.date))
    .map((dateEntry) => dateEntry.column - 1);

  const specialColumnIndexes = new Set([...holidayColumnIndexes, ...weekendColumnIndexes]);
  const activityRowNumbers = new Set(week.activityRows.map((activityRow) => activityRow.row));

  return [
    ...formatHolidayNameRow(sheetId, holidayNameRowNumber, labelColumnIndex, totalColumnCount, holidayColumnIndexes),
    formatDayOfWeekRow(sheetId, dayOfWeekRowNumber, labelColumnIndex, totalColumnCount),
    formatDateRow(sheetId, dateRowNumber, labelColumnIndex, totalColumnCount),
    ...formatActivityRows(sheetId, week.activityRows, labelColumnIndex, firstDayColumnIndex, totalColumnCount, specialColumnIndexes),
    ...formatDividerRows(sheetId, dateRowNumber, dailyTotalRowNumber, labelColumnIndex, totalColumnCount, activityRowNumbers),
    ...formatDailyTotalRow(sheetId, dailyTotalRowNumber, labelColumnIndex, totalColumnCount),
  ];
};

export default formatWeekSection;
