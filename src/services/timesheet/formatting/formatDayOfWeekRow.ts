import applyRowStyle from "./applyRowStyle.js";
import { dayOfWeekRow } from "./rowStyles.js";

// Builds the fill request for the day-of-week row (Mon, Tue, etc.) — PRIMARY_DARK background, header-text
// bold centered text, holiday columns overridden to ACCENT. Called by formatWeekSection.
const formatDayOfWeekRow = (
  sheetId: number,
  dayOfWeekRowNumber: number,
  labelColumnIndex: number,
  totalColumnCount: number,
  holidayColumnIndexes: number[],
): object[] =>
  applyRowStyle(sheetId, dayOfWeekRow, dayOfWeekRowNumber, labelColumnIndex, totalColumnCount, holidayColumnIndexes);

export default formatDayOfWeekRow;
