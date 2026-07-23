import getSheetId from '#db/adapter/getSheetId.js';
import applyFormattingRequests from '#db/adapter/applyFormattingRequests.js';
import Holiday from "#models/Holiday.js";
import TimesheetManifest from "#models/TimesheetManifest.js";
import { logger } from "#utils/logger.js";
import formatColumnWidths from "./formatting/formatColumnWidths.js";
import formatHeaderRows from "./formatting/formatHeaderRows.js";
import formatWeekSection from "./formatting/formatWeekSection.js";
import formatSignatureRows from "./formatting/formatSignatureRows.js";
import formatIncludeInPayrollRow from "./formatting/formatIncludeInPayrollRow.js";
import formatSummaryRows from "./formatting/formatSummaryRows.js";

// Applies all visual formatting to a timesheet tab in a single batchUpdate call.
// Called immediately after writeValues in generateTimesheets so the sheet looks styled on first open.
const applyTimesheetFormatting = async (
  workbookId: string,
  tabName: string,
  manifest: TimesheetManifest,
  holidays: Holiday[],
  maxDays: number,
): Promise<void> => {
  logger.debug(
    `Applying formatting to tab: ${tabName} in workbook: ${workbookId}`,
  );

  const sheetId = await getSheetId(workbookId, tabName);

  // Column layout (all 0-based):
  //   0       = A — labels
  //   1…N     = B…X — one column per day (N = maxDays)
  //   N+1     = weekly total column
  const labelColumnIndex = 0;
  const firstDayColumnIndex = 1;
  const totalColumnCount = maxDays + 2;

  const requests: object[] = [
    ...formatColumnWidths(sheetId, totalColumnCount),
    ...formatHeaderRows(sheetId),
    ...manifest.weeks.flatMap((week) =>
      formatWeekSection(
        sheetId,
        week,
        holidays,
        labelColumnIndex,
        firstDayColumnIndex,
        totalColumnCount,
      ),
    ),
    ...formatSignatureRows(
      sheetId,
      manifest.employeeSignatureCell,
      manifest.supervisorSignatureCell,
    ),
    ...formatIncludeInPayrollRow(sheetId, manifest.includeInPayrollCell),
    ...formatSummaryRows(sheetId, manifest.summaryRows),
  ];

  await applyFormattingRequests(workbookId, requests);
  logger.debug(`Formatting complete for tab: ${tabName}`);
};

export default applyTimesheetFormatting;
