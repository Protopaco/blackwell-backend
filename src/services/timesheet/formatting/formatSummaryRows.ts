import { PRIMARY, HEADER_TEXT, MUTED, TEXT } from "#utils/timesheetTheme.js";
import { type SummaryRowManifest } from "#models/TimesheetManifest.js";
import fillRow from "./fillRow.js";

// Builds fill requests for summary rows — PRIMARY/HEADER_TEXT on the label column, MUTED/TEXT on the value column.
const formatSummaryRows = (sheetId: number, summaryRows: SummaryRowManifest[]): object[] =>
  summaryRows.flatMap((summaryRow) => [
    fillRow(sheetId, summaryRow.row, 0, 1, PRIMARY, HEADER_TEXT, false, "LEFT"),
    fillRow(sheetId, summaryRow.row, 1, 2, MUTED, TEXT, false, "CENTER"),
  ]);

export default formatSummaryRows;
