import { type Color, WHITE } from "#utils/timesheetTheme.js";
import apiRange from "./apiRange.js";

// Builds a repeatCell request that fully replaces background color, text format, and alignment for a range.
const fillRange = (
  sheetId: number,
  startRowIndex: number,
  endRowIndex: number,
  startColumnIndex: number,
  endColumnIndex: number,
  backgroundColor: Color,
  textColor: Color = WHITE,
  bold = false,
  horizontalAlignment: "LEFT" | "CENTER" | "RIGHT" = "LEFT",
): object => ({
  repeatCell: {
    range: apiRange(sheetId, startRowIndex, endRowIndex, startColumnIndex, endColumnIndex),
    cell: {
      userEnteredFormat: {
        backgroundColor,
        textFormat: { foregroundColor: textColor, bold },
        horizontalAlignment,
      },
    },
    fields:
      "userEnteredFormat.backgroundColor,userEnteredFormat.textFormat,userEnteredFormat.horizontalAlignment",
  },
});

export default fillRange;
