import getSheetsClient from './getSheetsClient.js';
import sheetsLimiter from '#utils/rateLimiters/sheetsLimiter.js';
import scheduleGoogleApiCall from '#utils/rateLimiters/scheduleGoogleApiCall.js';
import { logger } from '#utils/logger.js';

// Permanently removes a tab from a workbook — used to delete the default Sheet1 after a new timesheet file is set up.
const deleteTab = async (workbookId: string, tabName: string): Promise<void> => {
  logger.debug(`Deleting tab: ${tabName} from workbook: ${workbookId}`);
  const sheets = await getSheetsClient();

  const spreadsheet = await scheduleGoogleApiCall(sheetsLimiter, () => sheets.spreadsheets.get({ spreadsheetId: workbookId }));
  const tab = spreadsheet.data.sheets?.find((s) => s.properties?.title === tabName);

  if (!tab || tab.properties?.sheetId === undefined) {
    throw new Error(`Tab not found: ${tabName}`);
  }

  const sheetId = tab.properties.sheetId;

  await scheduleGoogleApiCall(sheetsLimiter, () => sheets.spreadsheets.batchUpdate({
    spreadsheetId: workbookId,
    requestBody: {
      requests: [
        {
          deleteSheet: { sheetId },
        },
      ],
    },
  }));
};

export default deleteTab;
