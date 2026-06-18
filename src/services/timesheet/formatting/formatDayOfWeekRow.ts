import { PRIMARY, WHITE } from "#utils/timesheetTheme.js";
import fillRow from "./fillRow.js";

// Builds the fill request for the day-of-week row (Mon, Tue, etc.) — PRIMARY background, white bold centered text.
const formatDayOfWeekRow = (
  sheetId: number,
  dayOfWeekRowNumber: number,
  labelColumnIndex: number,
  totalColumnCount: number,
): object =>
  fillRow(sheetId, dayOfWeekRowNumber, labelColumnIndex, totalColumnCount, PRIMARY, WHITE, true, "CENTER");

export default formatDayOfWeekRow;
