import { PRIMARY_DARK, ACCENT, HEADER_TEXT, MUTED } from "#utils/timesheetTheme.js";
import fillRow from "./fillRow.js";
import outlineBorder from "./outlineBorder.js";

// Builds fill requests for the holiday name row: full row in PRIMARY_DARK, individual holiday cells overridden to ACCENT.
const formatHolidayNameRow = (
  sheetId: number,
  holidayNameRowNumber: number,
  labelColumnIndex: number,
  totalColumnCount: number,
  holidayColumnIndexes: number[],
): object[] => {
  const requests: object[] = [
    fillRow(
      sheetId,
      holidayNameRowNumber,
      labelColumnIndex,
      totalColumnCount,
      PRIMARY_DARK,
      HEADER_TEXT,
      false,
      "CENTER",
    ),
  ];

  for (const holidayColumnIndex of holidayColumnIndexes) {
    requests.push(
      fillRow(
        sheetId,
        holidayNameRowNumber,
        holidayColumnIndex,
        holidayColumnIndex + 1,
        ACCENT,
        HEADER_TEXT,
        true,
        "CENTER",
      ),
      outlineBorder(
        sheetId,
        holidayNameRowNumber,
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

export default formatHolidayNameRow;
