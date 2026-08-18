import getSheetId from '#db/adapter/getSheetId.js';
import applyFormattingRequests from '#db/adapter/applyFormattingRequests.js';
import Holiday from "#models/Holiday.js";
import TimesheetManifest from "#models/TimesheetManifest.js";
import { logger } from "#utils/logger.js";
import { MUTED, SECONDARY } from "#utils/timesheetTheme.js";
import { CLOCK_IN_OUT_WEEK_COLUMN_WIDTH } from "#config/constants.js";
import formatColumnWidths from "./formatting/formatColumnWidths.js";
import formatHeaderRows, { HEADER_ROW_COUNT } from "./formatting/formatHeaderRows.js";
import formatWeekSection from "./formatting/formatWeekSection.js";
import formatClockInOutTimesheet from "./formatting/formatClockInOutTimesheet.js";
import formatSignatureRows from "./formatting/formatSignatureRows.js";
import formatIncludeInPayrollRow from "./formatting/formatIncludeInPayrollRow.js";
import formatSummaryRows from "./formatting/formatSummaryRows.js";
import outlineBlockBorder from "./formatting/outlineBlockBorder.js";

// Applies all visual formatting to a timesheet tab in a single batchUpdate call.
// Called immediately after writeValues in generateTimesheets so the sheet looks styled on first open.
// hourlyActivityNames is only used for ClockInOut weeks (the activity dropdown's data validation) — pass
// an empty array for TotalHours-mode timesheets.
const applyTimesheetFormatting = async (
  workbookId: string,
  tabName: string,
  manifest: TimesheetManifest,
  holidays: Holiday[],
  maxDays: number,
  hourlyActivityNames: string[],
): Promise<void> => {
  logger.debug(
    `Applying formatting to tab: ${tabName} in workbook: ${workbookId}`,
  );

  const sheetId = await getSheetId(workbookId, tabName);

  const isClockInOut = manifest.clockInOutWeeks !== undefined && manifest.clockInOutWeeks.length > 0;

  // Column layout (all 0-based):
  //   TotalHours: 0=A labels, 1…N=B…X one column per day (N=maxDays), N+1=weekly total column, N+2=each
  //   activity row's trailing "hours"/"shifts" unit-label column (see buildActivityRow).
  //   ClockInOut: weeks sit side by side, each a 4-column group (label/In/Out/Total) — see
  //   buildClockInOutTimesheet — so the sheet's total width is however many week-groups there are.
  const labelColumnIndex = 0;
  const firstDayColumnIndex = 1;
  const totalColumnCount = isClockInOut
    ? manifest.clockInOutWeeks![manifest.clockInOutWeeks!.length - 1].labelColumnIndex + CLOCK_IN_OUT_WEEK_COLUMN_WIDTH
    : maxDays + 3;

  const lastSummaryRow = manifest.summaryRows[manifest.summaryRows.length - 1];

  const requests: object[] = [
    ...(isClockInOut ? [] : formatColumnWidths(sheetId, totalColumnCount)),
    ...formatHeaderRows(sheetId),
    outlineBlockBorder(sheetId, 1, HEADER_ROW_COUNT, labelColumnIndex, labelColumnIndex + 1, SECONDARY),
    ...(isClockInOut
      ? formatClockInOutTimesheet(sheetId, manifest.clockInOutWeeks!, hourlyActivityNames)
      : manifest.weeks.flatMap((week) =>
          formatWeekSection(
            sheetId,
            week,
            holidays,
            labelColumnIndex,
            firstDayColumnIndex,
            totalColumnCount,
          ),
        )),
    ...formatSignatureRows(
      sheetId,
      manifest.employeeSignatureCell,
      manifest.supervisorSignatureCell,
    ),
    ...formatIncludeInPayrollRow(sheetId, manifest.includeInPayrollCell),
    outlineBlockBorder(
      sheetId,
      manifest.employeeSignatureCell.row,
      manifest.includeInPayrollCell.row,
      labelColumnIndex,
      4,
      MUTED,
    ),
    ...formatSummaryRows(sheetId, manifest.summaryRows),
  ];

  if (lastSummaryRow) {
    requests.push(
      outlineBlockBorder(sheetId, manifest.summaryRows[0].row, lastSummaryRow.row, labelColumnIndex, 2, MUTED),
    );
  }

  await applyFormattingRequests(workbookId, requests);
  logger.debug(`Formatting complete for tab: ${tabName}`);
};

export default applyTimesheetFormatting;
