import getSheetsClient from './getSheetsClient.js';
import { logger } from '#utils/logger.js';

// Deletes a single row (1-based) from a tab — used when removing a manifest entry after a timesheet tab is deleted.
const deleteRow = async (workbookId: string, tabName: string, rowNumber: number): Promise<void> => {
  logger.debug(`Deleting row: ${rowNumber} from tab: ${tabName} in workbook: ${workbookId}`);
  const sheets = await getSheetsClient();

  const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId: workbookId });
  const tab = spreadsheet.data.sheets?.find((s) => s.properties?.title === tabName);

  if (!tab || tab.properties?.sheetId === undefined) {
    throw new Error(`Tab not found: ${tabName}`);
  }

  const startIndex = rowNumber - 1;

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: workbookId,
    requestBody: {
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId: tab.properties.sheetId,
              dimension: 'ROWS',
              startIndex,
              endIndex: startIndex + 1,
            },
          },
        },
      ],
    },
  });
};

export default deleteRow;
