import { MUTED, BLACK } from "#utils/timesheetTheme.js";
import { type SummaryRowManifest } from "#models/TimesheetManifest.js";
import fillRow from "./fillRow.js";

// Builds fill requests for summary value cells — MUTED background on column B, centered text.
const formatSummaryRows = (sheetId: number, summaryRows: SummaryRowManifest[]): object[] =>
  summaryRows.map((summaryRow) =>
    fillRow(sheetId, summaryRow.row, 1, 2, MUTED, BLACK, false, "CENTER"),
  );

export default formatSummaryRows;
