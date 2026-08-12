import applyRowStyle from "./applyRowStyle.js";
import { headerSpacerRow } from "./rowStyles.js";

// Builds fill requests for the headerSpacerRow — the blank visual gap between dateRow and whichever
// section (Hourly or Flat Rate) comes first that week. Called by formatWeekSection for every week.
const formatHeaderSpacerRow = (
  sheetId: number,
  headerSpacerRowNumber: number,
  labelColumnIndex: number,
  totalColumnCount: number,
  holidayColumnIndexes: number[],
): object[] =>
  applyRowStyle(sheetId, headerSpacerRow, headerSpacerRowNumber, labelColumnIndex, totalColumnCount, holidayColumnIndexes);

export default formatHeaderSpacerRow;
