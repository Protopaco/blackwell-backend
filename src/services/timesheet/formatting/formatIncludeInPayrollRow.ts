import { PRIMARY, HEADER_TEXT } from "#utils/timesheetTheme.js";
import { type SignatureCell } from "#models/TimesheetManifest.js";
import fillRow from "./fillRow.js";

// Builds a fill request for the label cell and a data-validation request turning the value cell
// into a real checkbox — called by applyTimesheetFormatting.
const formatIncludeInPayrollRow = (
  sheetId: number,
  includeInPayrollCell: SignatureCell,
): object[] => [
  fillRow(sheetId, includeInPayrollCell.row, 0, 1, PRIMARY, HEADER_TEXT, false, "LEFT"),
  {
    setDataValidation: {
      range: {
        sheetId,
        startRowIndex: includeInPayrollCell.row - 1,
        endRowIndex: includeInPayrollCell.row,
        startColumnIndex: includeInPayrollCell.column - 1,
        endColumnIndex: includeInPayrollCell.column,
      },
      rule: {
        condition: { type: "BOOLEAN" },
        strict: true,
        showCustomUi: true,
      },
    },
  },
];

export default formatIncludeInPayrollRow;
