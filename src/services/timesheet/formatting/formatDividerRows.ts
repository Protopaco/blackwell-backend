import applyRowStyle from "./applyRowStyle.js";
import { spacerRow } from "./rowStyles.js";

// Builds fill requests for the spacerRow — the blank visual gap between a week's Hourly and Flat Rate
// sections. Called by formatWeekSection only when both sections are present that week.
const formatDividerRows = (
  sheetId: number,
  spacerRowNumber: number,
  labelColumnIndex: number,
  totalColumnCount: number,
  holidayColumnIndexes: number[],
): object[] =>
  applyRowStyle(sheetId, spacerRow, spacerRowNumber, labelColumnIndex, totalColumnCount, holidayColumnIndexes);

export default formatDividerRows;
