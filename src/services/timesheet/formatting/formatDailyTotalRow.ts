import { PRIMARY, WHITE } from "#utils/timesheetTheme.js";
import fillRow from "./fillRow.js";

// Builds fill requests for the daily total row — full row PRIMARY centered, then label cell overridden to left-aligned.
const formatDailyTotalRow = (
  sheetId: number,
  dailyTotalRowNumber: number,
  labelColumnIndex: number,
  totalColumnCount: number,
): object[] => [
  fillRow(sheetId, dailyTotalRowNumber, labelColumnIndex, totalColumnCount, PRIMARY, WHITE, true, "CENTER"),
  fillRow(sheetId, dailyTotalRowNumber, labelColumnIndex, labelColumnIndex + 1, PRIMARY, WHITE, true, "LEFT"),
];

export default formatDailyTotalRow;
