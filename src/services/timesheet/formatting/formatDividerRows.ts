import { PRIMARY, WHITE } from "#utils/timesheetTheme.js";
import fillRow from "./fillRow.js";

// Builds fill requests for divider rows — any row between the date row and daily total row that is not an activity row.
const formatDividerRows = (
  sheetId: number,
  dateRowNumber: number,
  dailyTotalRowNumber: number,
  labelColumnIndex: number,
  totalColumnCount: number,
  activityRowNumbers: Set<number>,
): object[] => {
  const requests: object[] = [];

  for (let rowNumber = dateRowNumber + 1; rowNumber < dailyTotalRowNumber; rowNumber++) {
    if (!activityRowNumbers.has(rowNumber)) {
      requests.push(fillRow(sheetId, rowNumber, labelColumnIndex, totalColumnCount, PRIMARY, WHITE, false));
    }
  }

  return requests;
};

export default formatDividerRows;
