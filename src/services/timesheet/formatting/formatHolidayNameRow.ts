import applyRowStyle from "./applyRowStyle.js";
import { weekLabelRow } from "./rowStyles.js";

// Builds fill requests for the Week block's weekLabelRow: PRIMARY_DARK across the row (holiday name
// cells overridden to ACCENT), with the label cell (column A, carrying the week's date-range label, e.g.
// "Week 6/1 - 6/7") styled SECONDARY to match the Summary block's identityRow. Called by formatWeekSection.
const formatHolidayNameRow = (
  sheetId: number,
  holidayNameRowNumber: number,
  labelColumnIndex: number,
  totalColumnCount: number,
  holidayColumnIndexes: number[],
): object[] =>
  applyRowStyle(sheetId, weekLabelRow, holidayNameRowNumber, labelColumnIndex, totalColumnCount, holidayColumnIndexes);

export default formatHolidayNameRow;
