import sheetsAdapter from '#db/adapter/sheetsAdapter.js';
import Holiday from '#models/Holiday.js';
import TimesheetManifest from '#models/TimesheetManifest.js';
import { logger } from '#utils/logger.js';
import {
  type Color,
  DARK_NAVY,
  HEADER_PURPLE,
  HOLIDAY_DARK,
  LIGHT_LAVENDER,
  WHITE,
  BLACK,
  LABEL_COLUMN_WIDTH,
  DAY_COLUMN_WIDTH,
} from '#utils/timesheetTheme.js';

// ─── Request builder helpers ──────────────────────────────────────────────────

// Returns an API range object. All indices are 0-based; endRow/endCol are exclusive.
const apiRange = (
  sheetId: number,
  startRow: number,
  endRow: number,
  startCol: number,
  endCol: number,
) => ({ sheetId, startRowIndex: startRow, endRowIndex: endRow, startColumnIndex: startCol, endColumnIndex: endCol });

// Builds a repeatCell request that fully replaces background, text format, and alignment in a range.
const fill = (
  sheetId: number,
  startRow: number,  // 0-based inclusive
  endRow: number,    // 0-based exclusive
  startCol: number,  // 0-based inclusive
  endCol: number,    // 0-based exclusive
  bg: Color,
  textColor: Color = WHITE,
  bold = false,
  align: 'LEFT' | 'CENTER' | 'RIGHT' = 'LEFT',
): object => ({
  repeatCell: {
    range: apiRange(sheetId, startRow, endRow, startCol, endCol),
    cell: {
      userEnteredFormat: {
        backgroundColor: bg,
        textFormat: { foregroundColor: textColor, bold },
        horizontalAlignment: align,
      },
    },
    fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)',
  },
});

// Convenience wrapper for a single row (row1 is 1-based).
const fillRow = (
  sheetId: number,
  row1: number,
  startCol: number,
  endCol: number,
  bg: Color,
  textColor: Color = WHITE,
  bold = false,
  align: 'LEFT' | 'CENTER' | 'RIGHT' = 'LEFT',
): object => fill(sheetId, row1 - 1, row1, startCol, endCol, bg, textColor, bold, align);

// Builds an updateBorders request that draws an outline around a range.
const outlineBorder = (
  sheetId: number,
  row1: number,  // 1-based
  startCol: number,
  endCol: number,
): object => {
  const border = { style: 'SOLID', width: 1, color: BLACK };
  return {
    updateBorders: {
      range: apiRange(sheetId, row1 - 1, row1, startCol, endCol),
      top: border, bottom: border, left: border, right: border,
    },
  };
};

// Returns true for Saturday (6) and Sunday (0).
const isWeekend = (dateStr: string): boolean => {
  const day = new Date(dateStr).getUTCDay();
  return day === 0 || day === 6;
};

// ─── Main formatting function ─────────────────────────────────────────────────

// Applies all visual formatting to a timesheet tab in a single batchUpdate call.
// Called immediately after writeValues in generateTimesheets so the sheet looks styled on first open.
const applyTimesheetFormatting = async (
  workbookId: string,
  tabName: string,
  manifest: TimesheetManifest,
  holidays: Holiday[],
  maxDays: number,
): Promise<void> => {
  logger.debug(`Applying formatting to tab: ${tabName} in workbook: ${workbookId}`);

  const sheetId = await sheetsAdapter.getSheetId(workbookId, tabName);
  const requests: object[] = [];

  // Column layout (all 0-based):
  //   0     = A — labels
  //   1…N   = B…X — one per day (N = maxDays)
  //   N+1   = weekly total column
  const LABEL_COL  = 0;
  const FIRST_DAY  = 1;              // 0-based col B
  const LAST_DAY   = maxDays;        // 0-based
  const TOTAL_COL  = maxDays + 1;    // 0-based
  const USED_COLS  = maxDays + 2;    // total columns touched by formatting

  // ── Freeze the top 3 rows (header + employee + divider) ──────────────────
  requests.push({
    updateSheetProperties: {
      properties: { sheetId, gridProperties: { frozenRowCount: 3 } },
      fields: 'gridProperties.frozenRowCount',
    },
  });

  // ── Column widths ─────────────────────────────────────────────────────────
  requests.push({
    updateDimensionProperties: {
      range: { sheetId, dimension: 'COLUMNS', startIndex: 0, endIndex: 1 },
      properties: { pixelSize: LABEL_COLUMN_WIDTH },
      fields: 'pixelSize',
    },
  });
  requests.push({
    updateDimensionProperties: {
      range: { sheetId, dimension: 'COLUMNS', startIndex: 1, endIndex: USED_COLS },
      properties: { pixelSize: DAY_COLUMN_WIDTH },
      fields: 'pixelSize',
    },
  });

  // ── Pay period header row (row 1) — periwinkle, white bold ────────────────
  requests.push(fillRow(sheetId, 1, LABEL_COL, 2, HEADER_PURPLE, WHITE, true));

  // ── Employee name row (row 2) — periwinkle, white bold ───────────────────
  requests.push(fillRow(sheetId, 2, LABEL_COL, 2, HEADER_PURPLE, WHITE, true));

  // ── Week sections ─────────────────────────────────────────────────────────
  for (const week of manifest.weeks) {
    const holidayRow    = week.dateRow - 2;  // 1-based
    const dayRow        = week.dateRow - 1;  // 1-based
    const dateRow       = week.dateRow;      // 1-based
    const dailyTotalRow = week.dailyTotalRow; // 1-based

    const numDays = week.dates.length;
    const weekTotalCol = numDays + 1;  // 0-based column for the per-week total cell

    // Determine which 0-based columns are holidays or weekends
    const holidayCols = week.dates
      .filter((d) => holidays.some((h) => h.holidayDate === d.date))
      .map((d) => d.column - 1);  // manifest columns are 1-based; convert to 0-based

    const weekendCols = week.dates
      .filter((d) => isWeekend(d.date))
      .map((d) => d.column - 1);

    const specialCols = new Set([...holidayCols, ...weekendCols]);
    const activityRowSet = new Set(week.activityRows.map((r) => r.row));

    // Holiday name row — full row DARK_NAVY; individual holiday cells HOLIDAY_DARK
    requests.push(fillRow(sheetId, holidayRow, LABEL_COL, USED_COLS, DARK_NAVY, WHITE, false, 'CENTER'));
    for (const col of holidayCols) {
      requests.push(fillRow(sheetId, holidayRow, col, col + 1, HOLIDAY_DARK, WHITE, true, 'CENTER'));
    }

    // Day-of-week row — full row DARK_NAVY, bold centered
    requests.push(fillRow(sheetId, dayRow, LABEL_COL, USED_COLS, DARK_NAVY, WHITE, true, 'CENTER'));

    // Date row — full row DARK_NAVY, bold centered
    requests.push(fillRow(sheetId, dateRow, LABEL_COL, USED_COLS, DARK_NAVY, WHITE, true, 'CENTER'));

    // Activity rows
    if (week.activityRows.length > 0) {
      const firstAct = Math.min(...week.activityRows.map((r) => r.row));
      const lastAct  = Math.max(...week.activityRows.map((r) => r.row));

      // Reset every activity row cell to white so re-generates start clean
      requests.push(fill(sheetId, firstAct - 1, lastAct, LABEL_COL, USED_COLS, WHITE, BLACK, false));

      // Col A — DARK_NAVY label column
      requests.push(fill(sheetId, firstAct - 1, lastAct, LABEL_COL, LABEL_COL + 1, DARK_NAVY, WHITE, false));

      // Weekend + holiday day columns — light lavender tint
      for (const col of specialCols) {
        requests.push(fill(sheetId, firstAct - 1, lastAct, col, col + 1, LIGHT_LAVENDER, BLACK, false));
      }
    }

    // Divider rows — any row between dateRow+1 and dailyTotalRow-1 that isn't an activity row
    for (let r = dateRow + 1; r < dailyTotalRow; r++) {
      if (!activityRowSet.has(r)) {
        requests.push(fillRow(sheetId, r, LABEL_COL, USED_COLS, DARK_NAVY, WHITE, false));
      }
    }

    // Daily total row — full row DARK_NAVY; label left-aligned, values centered
    requests.push(fillRow(sheetId, dailyTotalRow, LABEL_COL, USED_COLS, DARK_NAVY, WHITE, true, 'CENTER'));
    requests.push(fillRow(sheetId, dailyTotalRow, LABEL_COL, LABEL_COL + 1, DARK_NAVY, WHITE, true, 'LEFT'));
  }

  // ── Signature box borders ─────────────────────────────────────────────────
  // Draw an outline border around cells B–D for each signature row.
  requests.push(outlineBorder(sheetId, manifest.employeeSignatureCell.row, 1, 4));
  requests.push(outlineBorder(sheetId, manifest.supervisorSignatureCell.row, 1, 4));

  // ── Summary value cells — light lavender on col B, centered ──────────────
  for (const summaryRow of manifest.summaryRows) {
    requests.push(fillRow(sheetId, summaryRow.row, 1, 2, LIGHT_LAVENDER, BLACK, false, 'CENTER'));
  }

  await sheetsAdapter.applyFormattingRequests(workbookId, requests);
  logger.debug(`Formatting complete for tab: ${tabName}`);
};

export default applyTimesheetFormatting;
