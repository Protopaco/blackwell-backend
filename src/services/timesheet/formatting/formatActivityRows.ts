import {
  PRIMARY,
  WHITE,
  BLACK,
  MUTED,
  MUTED_ACCENT,
  MUTED_ACCENT_DARK,
} from "#utils/timesheetTheme.js";
import { type ActivityRowManifest } from "#models/TimesheetManifest.js";
import fillRow from "./fillRow.js";
import outlineBorder from "./outlineBorder.js";
import setHourDataValidation from "./setHourDataValidation.js";
import setFlatDataValidation from "./setFlatDataValidation.js";

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
  isFlatRateSection = false,
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

    requests.push(
      outlineBorder(
        sheetId,
        rowNumber,
        labelColumnIndex,
        totalColumnCount,
        MUTED,
        true,
        true,
        false,
        false,
        false,
        false,
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

    requests.push(
      fillRow(
        sheetId,
        rowNumber,
        totalColumnCount - 1,
        totalColumnCount,
        PRIMARY,
        WHITE,
        false,
        "CENTER",
      ),
    );

    requests.push(
      outlineBorder(
        sheetId,
        rowNumber,
        totalColumnCount - 1,
        totalColumnCount,
        MUTED,
        true,
        true,
        false,
        false,
        false,
        false,
      ),
    );

    // Step 3: apply data validation to day columns — hours allow 2 decimal places, flat rate whole numbers only.
    if (isFlatRateSection) {
      requests.push(
        setFlatDataValidation(sheetId, rowNumber, firstDayColumnIndex, totalColumnCount - 2),
      );
    } else {
      requests.push(
        setHourDataValidation(sheetId, rowNumber, firstDayColumnIndex, totalColumnCount - 2),
      );
    }

    // Step 4: override holiday columns.
    // Regular rows: even → white, odd → muted accent.
    // Flat rate rows: even → muted accent, odd → muted accent dark.
    const evenHolidayColor = isFlatRateSection ? MUTED_ACCENT : WHITE;
    const oddHolidayColor = isFlatRateSection ? MUTED_ACCENT_DARK : MUTED_ACCENT;
    for (const specialColumnIndex of holidayColumnIndexes) {
      requests.push(
        fillRow(
          sheetId,
          rowNumber,
          specialColumnIndex,
          specialColumnIndex + 1,
          isEvenRow ? evenHolidayColor : oddHolidayColor,
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
