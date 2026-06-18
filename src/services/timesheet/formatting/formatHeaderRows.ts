import { MUTED, PRIMARY, SECONDARY, WHITE } from "#utils/timesheetTheme.js";
import fillRow from "./fillRow.js";
import outlineBorder from "./outlineBorder.js";

// Builds fill requests for the pay period header row (row 1) and employee name row (row 2) — called by formatWeekSection.
const formatHeaderRows = (sheetId: number): object[] => [
  fillRow(sheetId, 1, 0, 1, PRIMARY, WHITE, true),
  fillRow(sheetId, 1, 1, 2, SECONDARY, WHITE, true),
  fillRow(sheetId, 2, 0, 2, SECONDARY, WHITE, true),
  outlineBorder(sheetId, 1, 0, 2, MUTED),
  outlineBorder(sheetId, 2, 0, 2, MUTED),
];

export default formatHeaderRows;
