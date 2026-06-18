import { PRIMARY, ACCENT, WHITE } from "#utils/timesheetTheme.js";
import fillRow from "./fillRow.js";

// Builds fill requests for the holiday name row: full row in PRIMARY, individual holiday cells overridden to ACCENT.
const formatHolidayNameRow = (
  sheetId: number,
  holidayNameRowNumber: number,
  labelColumnIndex: number,
  totalColumnCount: number,
  holidayColumnIndexes: number[],
): object[] => {
  const requests: object[] = [
    fillRow(sheetId, holidayNameRowNumber, labelColumnIndex, totalColumnCount, PRIMARY, WHITE, false, "CENTER"),
  ];

  for (const holidayColumnIndex of holidayColumnIndexes) {
    requests.push(
      fillRow(sheetId, holidayNameRowNumber, holidayColumnIndex, holidayColumnIndex + 1, ACCENT, WHITE, true, "CENTER"),
    );
  }

  return requests;
};

export default formatHolidayNameRow;
