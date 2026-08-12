import applyRowStyle from "./applyRowStyle.js";
import { identityRow } from "./rowStyles.js";

const HEADER_ROW_COUNT = 4;

// Builds fill requests for the Summary block's 4-row identity header at the top of the sheet — pay
// period label (row 1), pay period date range (row 2), employee name (row 3), and position (row 4),
// each its own single-column identityRow. Called by applyTimesheetFormatting.
const formatHeaderRows = (sheetId: number): object[] => {
  const requests: object[] = [];
  for (let rowNumber = 1; rowNumber <= HEADER_ROW_COUNT; rowNumber++) {
    requests.push(...applyRowStyle(sheetId, identityRow, rowNumber, 0, 1));
  }
  return requests;
};

export { HEADER_ROW_COUNT };
export default formatHeaderRows;
