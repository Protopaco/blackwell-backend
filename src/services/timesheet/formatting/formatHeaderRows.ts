import { SECONDARY, HEADER_TEXT, MUTED } from "#utils/timesheetTheme.js";
import fillRow from "./fillRow.js";
import outlineBorder from "./outlineBorder.js";

const HEADER_ROW_COUNT = 4;

// Builds fill requests for the 4-row identity block at the top of the sheet — pay period label (row 1),
// pay period date range (row 2), employee name (row 3), and position (row 4) — each its own single-column
// SECONDARY row. Called by formatWeekSection.
const formatHeaderRows = (sheetId: number): object[] => {
  const requests: object[] = [];
  for (let rowNumber = 1; rowNumber <= HEADER_ROW_COUNT; rowNumber++) {
    requests.push(
      fillRow(sheetId, rowNumber, 0, 1, SECONDARY, HEADER_TEXT, true),
      outlineBorder(sheetId, rowNumber, 0, 1, MUTED, true, true, true, true, true, true),
    );
  }
  return requests;
};

export default formatHeaderRows;
