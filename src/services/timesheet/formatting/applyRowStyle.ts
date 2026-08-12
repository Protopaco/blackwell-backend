import fillRow from "./fillRow.js";
import outlineBorder from "./outlineBorder.js";
import { type RowStyle } from "./rowStyles.js";

// Builds the repeatCell/updateBorders requests for one row from a named RowStyle: the base fill across
// the row, an optional different fill for just the label cell, an optional outline border, and an
// optional fill override on holiday columns. Centralizes the request shape so every row type gets it
// from one place instead of each format*Row.ts file hand-assembling repeatCell/updateBorders objects —
// called by the format*Row.ts files in this directory.
const applyRowStyle = (
  sheetId: number,
  rowStyle: RowStyle,
  rowNumber: number,
  labelColumnIndex: number,
  totalColumnCount: number,
  holidayColumnIndexes: number[] = [],
): object[] => {
  const requests: object[] = [
    fillRow(
      sheetId,
      rowNumber,
      labelColumnIndex,
      totalColumnCount,
      rowStyle.fill.backgroundColor,
      rowStyle.fill.textColor,
      rowStyle.fill.bold,
      rowStyle.fill.horizontalAlignment,
    ),
  ];

  if (rowStyle.labelFill) {
    requests.push(
      fillRow(
        sheetId,
        rowNumber,
        labelColumnIndex,
        labelColumnIndex + 1,
        rowStyle.labelFill.backgroundColor,
        rowStyle.labelFill.textColor,
        rowStyle.labelFill.bold,
        rowStyle.labelFill.horizontalAlignment,
      ),
    );
  }

  if (rowStyle.border) {
    const { color, sides } = rowStyle.border;
    requests.push(
      outlineBorder(
        sheetId,
        rowNumber,
        labelColumnIndex,
        totalColumnCount,
        color,
        sides.top ?? false,
        sides.bottom ?? false,
        sides.left ?? false,
        sides.right ?? false,
        sides.innerHorizontal ?? false,
        sides.innerVertical ?? false,
      ),
    );
  }

  if (rowStyle.holidayFill) {
    for (const holidayColumnIndex of holidayColumnIndexes) {
      requests.push(
        fillRow(
          sheetId,
          rowNumber,
          holidayColumnIndex,
          holidayColumnIndex + 1,
          rowStyle.holidayFill.backgroundColor,
          rowStyle.holidayFill.textColor,
          rowStyle.holidayFill.bold,
          rowStyle.holidayFill.horizontalAlignment,
        ),
      );
    }
  }

  return requests;
};

export default applyRowStyle;
