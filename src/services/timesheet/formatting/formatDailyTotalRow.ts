import { MUTED, PRIMARY_DARK, HEADER_TEXT, ACCENT } from "#utils/timesheetTheme.js";
import fillRow from "./fillRow.js";
import outlineBorder from "./outlineBorder.js";

// Builds fill requests for the daily total row — full row PRIMARY_DARK centered, then label cell overridden to left-aligned.
const formatDailyTotalRow = (
  sheetId: number,
  dailyTotalRowNumber: number,
  labelColumnIndex: number,
  totalColumnCount: number,
  holidayColumnIndexes: number[],
): object[] => {
  const requests = [
    fillRow(
      sheetId,
      dailyTotalRowNumber,
      labelColumnIndex,
      totalColumnCount,
      PRIMARY_DARK,
      HEADER_TEXT,
      true,
      "CENTER",
    ),
    fillRow(
      sheetId,
      dailyTotalRowNumber,
      labelColumnIndex,
      labelColumnIndex + 1,
      PRIMARY_DARK,
      HEADER_TEXT,
      true,
      "LEFT",
    ),
  ];

  for (const holidayColumnIndex of holidayColumnIndexes) {
    requests.push(
      fillRow(
        sheetId,
        dailyTotalRowNumber,
        holidayColumnIndex,
        holidayColumnIndex + 1,
        ACCENT,
        HEADER_TEXT,
        true,
        "CENTER",
      ),
      outlineBorder(
        sheetId,
        dailyTotalRowNumber,
        labelColumnIndex,
        totalColumnCount,
        MUTED,
        false,
        true,
        true,
        true,
        false,
        true,
      ),
    );
  }

  return requests;
};

export default formatDailyTotalRow;
