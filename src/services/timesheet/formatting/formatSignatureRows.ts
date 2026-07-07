import { PRIMARY, WHITE } from "#utils/timesheetTheme.js";
import { type SignatureCell } from "#models/TimesheetManifest.js";
import fillRow from "./fillRow.js";
import mergeCells from "./mergeCells.js";
import outlineBorder from "./outlineBorder.js";

// Builds fill, border, and merge requests for the employee and supervisor signature rows — called by applyTimesheetFormatting.
const formatSignatureRows = (
  sheetId: number,
  employeeSignatureCell: SignatureCell,
  supervisorSignatureCell: SignatureCell,
): object[] => [
  fillRow(sheetId, employeeSignatureCell.row, 0, 1, PRIMARY, WHITE, false, "LEFT"),
  outlineBorder(sheetId, employeeSignatureCell.row, 1, 4),
  mergeCells(sheetId, employeeSignatureCell.row, 1, 4),
  fillRow(sheetId, supervisorSignatureCell.row, 0, 1, PRIMARY, WHITE, false, "LEFT"),
  outlineBorder(sheetId, supervisorSignatureCell.row, 1, 4),
  mergeCells(sheetId, supervisorSignatureCell.row, 1, 4),
];

export default formatSignatureRows;
