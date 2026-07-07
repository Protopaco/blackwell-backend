import { PRIMARY, WHITE, MUTED, BLACK } from "#utils/timesheetTheme.js";
import { type SummaryRowManifest } from "#models/TimesheetManifest.js";
import fillRow from "./fillRow.js";

// Builds fill requests for summary rows — PRIMARY/WHITE on the label column, MUTED on the value column.
const formatSummaryRows = (sheetId: number, summaryRows: SummaryRowManifest[]): object[] =>
  summaryRows.flatMap((summaryRow) => [
    fillRow(sheetId, summaryRow.row, 0, 1, PRIMARY, WHITE, false, "LEFT"),
    fillRow(sheetId, summaryRow.row, 1, 2, MUTED, BLACK, false, "CENTER"),
  ]);

export default formatSummaryRows;
