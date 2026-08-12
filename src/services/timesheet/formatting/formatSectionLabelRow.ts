import applyRowStyle from "./applyRowStyle.js";
import { sectionLabelRow } from "./rowStyles.js";

// Builds the fill request for a Week block's "Hourly"/"Flat Rate" sectionLabelRow — same styling as
// dayOfWeekRow (PRIMARY_DARK, bold, centered, holiday columns overridden to ACCENT). Called by
// formatWeekSection, once per section that's present that week.
const formatSectionLabelRow = (
  sheetId: number,
  sectionLabelRowNumber: number,
  labelColumnIndex: number,
  totalColumnCount: number,
  holidayColumnIndexes: number[],
): object[] =>
  applyRowStyle(sheetId, sectionLabelRow, sectionLabelRowNumber, labelColumnIndex, totalColumnCount, holidayColumnIndexes);

export default formatSectionLabelRow;
