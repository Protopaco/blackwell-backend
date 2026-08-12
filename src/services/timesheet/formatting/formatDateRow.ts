import applyRowStyle from "./applyRowStyle.js";
import { dateRow } from "./rowStyles.js";

// Builds the fill request for the date number row — PRIMARY_DARK background, header-text bold centered
// text, holiday columns overridden to ACCENT. Called by formatWeekSection.
const formatDateRow = (
  sheetId: number,
  dateRowNumber: number,
  labelColumnIndex: number,
  totalColumnCount: number,
  holidayColumnIndexes: number[],
): object[] =>
  applyRowStyle(sheetId, dateRow, dateRowNumber, labelColumnIndex, totalColumnCount, holidayColumnIndexes);

export default formatDateRow;
