import {
  PRIMARY,
  WHITE,
  BLACK,
  MUTED,
  MUTED_ACCENT,
} from "#utils/timesheetTheme.js";
import { type ActivityRowManifest } from "#models/TimesheetManifest.js";
import fillRow from "./fillRow.js";

// Builds fill requests for all activity rows in a week.
// Each row gets a PRIMARY label column, then alternates white/muted for the day cells.
// Weekend and holiday columns are always overridden to MUTED regardless of alternation.
const formatActivityRows = (
  sheetId: number,
  activityRows: ActivityRowManifest[],
  labelColumnIndex: number,
  firstDayColumnIndex: number,
  totalColumnCount: number,
  specialColumnIndexes: Set<number>,
  holidayColumnIndexes: number[],
): object[] => {
  const requests: object[] = [];

  activityRows.forEach((activityRow, rowAlternationIndex) => {
    const rowNumber = activityRow.row;
    const isEvenRow = rowAlternationIndex % 2 === 0;

    // Step 1: entire row gets PRIMARY — establishes the label column background and white text.
    requests.push(
      fillRow(
        sheetId,
        rowNumber,
        labelColumnIndex,
        totalColumnCount,
        PRIMARY,
        WHITE,
        false,
        "LEFT",
      ),
    );

    // Step 2: override day columns — even rows are white, odd rows are muted.
    requests.push(
      fillRow(
        sheetId,
        rowNumber,
        firstDayColumnIndex,
        totalColumnCount,
        isEvenRow ? WHITE : MUTED,
        BLACK,
        false,
        "CENTER",
      ),
    );

    // Step 3: override holiday columns — even rows stay white, odd rows use muted accent.
    for (const specialColumnIndex of holidayColumnIndexes) {
      requests.push(
        fillRow(
          sheetId,
          rowNumber,
          specialColumnIndex,
          specialColumnIndex + 1,
          isEvenRow ? WHITE : MUTED_ACCENT,
          BLACK,
          false,
          "CENTER",
        ),
      );
    }
  });

  return requests;
};

export default formatActivityRows;
