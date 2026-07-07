import { type Color, WHITE } from "#utils/timesheetTheme.js";
import fillRange from "./fillRange.js";

// Convenience wrapper around fillRange that targets a single row. rowNumber is 1-based.
const fillRow = (
  sheetId: number,
  rowNumber: number,
  startColumnIndex: number,
  endColumnIndex: number,
  backgroundColor: Color,
  textColor: Color = WHITE,
  bold = false,
  horizontalAlignment: "LEFT" | "CENTER" | "RIGHT" = "LEFT",
): object =>
  fillRange(
    sheetId,
    rowNumber - 1,
    rowNumber,
    startColumnIndex,
    endColumnIndex,
    backgroundColor,
    textColor,
    bold,
    horizontalAlignment,
  );

export default fillRow;
