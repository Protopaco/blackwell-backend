import applyRowStyle from "./applyRowStyle.js";
import { dailyTotalRow } from "./rowStyles.js";

// Builds fill requests for a section's daily total row — full row PRIMARY_DARK centered, label cell
// left-aligned, holiday columns overridden to ACCENT. Called once per section present that week (Hourly
// and/or Flat Rate) by formatWeekSection.
const formatDailyTotalRow = (
  sheetId: number,
  dailyTotalRowNumber: number,
  labelColumnIndex: number,
  totalColumnCount: number,
  holidayColumnIndexes: number[],
): object[] =>
  applyRowStyle(sheetId, dailyTotalRow, dailyTotalRowNumber, labelColumnIndex, totalColumnCount, holidayColumnIndexes);

export default formatDailyTotalRow;
