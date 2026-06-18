import { PRIMARY, WHITE } from "#utils/timesheetTheme.js";
import fillRow from "./fillRow.js";

// Builds the fill request for the date number row — PRIMARY background, white bold centered text.
const formatDateRow = (
  sheetId: number,
  dateRowNumber: number,
  labelColumnIndex: number,
  totalColumnCount: number,
): object =>
  fillRow(sheetId, dateRowNumber, labelColumnIndex, totalColumnCount, PRIMARY, WHITE, true, "CENTER");

export default formatDateRow;
