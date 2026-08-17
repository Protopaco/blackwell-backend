import {
  PRIMARY,
  SECONDARY,
  FLAT_RATE,
  TIME_OFF,
  WHITE,
  TEXT,
  HEADER_TEXT,
  MUTED,
  MUTED_ACCENT,
  MUTED_ACCENT_DARK,
  type Color,
} from "#utils/timesheetTheme.js";
import { type ActivityRowManifest, type ActivityRowType } from "#models/TimesheetManifest.js";
import { EmployeeActivityPayRateType } from "#models/EmployeeActivityPayRateType.js";
import fillRow from "./fillRow.js";
import outlineBorder from "./outlineBorder.js";
import setHourDataValidation from "./setHourDataValidation.js";
import setFlatDataValidation from "./setFlatDataValidation.js";

// Maps a row's pay-type tag to its label-cell background color — Hourly keeps the original PRIMARY tint,
// Salary gets SECONDARY, FlatRate and time-off (ETO/PTO/STO) each get their own tint so a row's pay type
// is visible at a glance now that Hourly/Time Off/Flat Rate no longer live in separate sections.
const LABEL_COLOR_BY_ROW_TYPE: Record<ActivityRowType, Color> = {
  [EmployeeActivityPayRateType.Hourly]: PRIMARY,
  [EmployeeActivityPayRateType.Salary]: SECONDARY,
  FlatRate: FLAT_RATE,
  ETO: TIME_OFF,
  PTO: TIME_OFF,
  STO: TIME_OFF,
};

// Builds fill requests for all activity rows in a week's single combined activity block.
// Each row's label cell is tinted by its rowType (see LABEL_COLOR_BY_ROW_TYPE), then day cells alternate
// white/muted. Weekend and holiday columns are always overridden to MUTED regardless of alternation.
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
    const isFlatRateSection = activityRow.rowType === 'FlatRate';

    // Step 1: label cell gets its rowType color — establishes the label column background and header text.
    requests.push(
      fillRow(
        sheetId,
        rowNumber,
        labelColumnIndex,
        firstDayColumnIndex,
        LABEL_COLOR_BY_ROW_TYPE[activityRow.rowType],
        HEADER_TEXT,
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
        TEXT,
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
        HEADER_TEXT,
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

    // Step 4: override holiday columns — even rows get MUTED_ACCENT, odd rows get MUTED_ACCENT_DARK.
    // Same alternation regardless of rowType; isFlatRateSection only affects the data validation applied
    // in Step 3, not holiday-column coloring.
    const evenHolidayColor = MUTED_ACCENT;
    const oddHolidayColor = MUTED_ACCENT_DARK;
    for (const specialColumnIndex of holidayColumnIndexes) {
      requests.push(
        fillRow(
          sheetId,
          rowNumber,
          specialColumnIndex,
          specialColumnIndex + 1,
          isEvenRow ? evenHolidayColor : oddHolidayColor,
          TEXT,
          false,
          "CENTER",
        ),
      );
    }
  });

  return requests;
};

export default formatActivityRows;
