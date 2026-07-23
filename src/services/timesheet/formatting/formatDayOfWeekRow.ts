import { PRIMARY_DARK, HEADER_TEXT, MUTED, ACCENT } from "#utils/timesheetTheme.js";
import fillRow from "./fillRow.js";
import outlineBorder from "./outlineBorder.js";

// Builds the fill request for the day-of-week row (Mon, Tue, etc.) — PRIMARY_DARK background, header-text bold centered text.
const formatDayOfWeekRow = (
  sheetId: number,
  dayOfWeekRowNumber: number,
  labelColumnIndex: number,
  totalColumnCount: number,
  holidayColumnIndexes: number[],
): object[] => {
  const requests: object[] = [
    fillRow(
      sheetId,
      dayOfWeekRowNumber,
      labelColumnIndex,
      totalColumnCount,
      PRIMARY_DARK,
      HEADER_TEXT,
      true,
      "CENTER",
    ),
    outlineBorder(
      sheetId,
      dayOfWeekRowNumber,
      labelColumnIndex,
      totalColumnCount,
      MUTED,
      false,
      false,
      false,
      false,
      false,
      true,
    ),
  ];

  for (const holidayColumnIndex of holidayColumnIndexes) {
    requests.push(
      fillRow(
        sheetId,
        dayOfWeekRowNumber,
        holidayColumnIndex,
        holidayColumnIndex + 1,
        ACCENT,
        HEADER_TEXT,
        true,
        "CENTER",
      ),
      outlineBorder(
        sheetId,
        dayOfWeekRowNumber,
        labelColumnIndex,
        totalColumnCount,
        MUTED,
        false,
        false,
        false,
        true,
        false,
        true,
      ),
    );
  }
  return requests;
};
export default formatDayOfWeekRow;
