import { type SignatureCell } from "#models/TimesheetManifest.js";
import mergeCells from "./mergeCells.js";
import outlineBorder from "./outlineBorder.js";

// Builds outline border requests for the employee and supervisor signature cells — called by applyTimesheetFormatting.
const formatSignatureRows = (
  sheetId: number,
  employeeSignatureCell: SignatureCell,
  supervisorSignatureCell: SignatureCell,
): object[] => [
  outlineBorder(sheetId, employeeSignatureCell.row, 1, 4),
  mergeCells(sheetId, employeeSignatureCell.row, 1, 4),
  outlineBorder(sheetId, supervisorSignatureCell.row, 1, 4),
  mergeCells(sheetId, supervisorSignatureCell.row, 1, 4),
];

export default formatSignatureRows;
