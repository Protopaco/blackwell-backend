import getSheetsClient from './getSheetsClient.js';
import { logger } from '#utils/logger.js';

// Permanently removes a tab from a workbook — used to delete the default Sheet1 after a new timesheet file is set up.
const deleteTab = async (workbookId: string, tabName: string): Promise<void> => {
  logger.debug(`Deleting tab: ${tabName} from workbook: ${workbookId}`);
  const sheets = await getSheetsClient();

  const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId: workbookId });
  const tab = spreadsheet.data.sheets?.find((s) => s.properties?.title === tabName);

  if (!tab || tab.properties?.sheetId === undefined) {
    throw new Error(`Tab not found: ${tabName}`);
  }

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: workbookId,
    requestBody: {
      requests: [
        {
          deleteSheet: { sheetId: tab.properties.sheetId },
        },
      ],
    },
  });
};

export default deleteTab;
