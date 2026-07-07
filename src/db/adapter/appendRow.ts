import getSheetsClient from './getSheetsClient.js';
import { logger } from '#utils/logger.js';

// Appends a single row of values to the end of a tab — used when adding new pay periods or manifest entries.
const appendRow = async (workbookId: string, tabName: string, row: Record<string, unknown>): Promise<void> => {
  logger.debug(`Appending row to tab: ${tabName} in workbook: ${workbookId}`);
  const sheets = await getSheetsClient();
  const values = [Object.values(row)];

  await sheets.spreadsheets.values.append({
    spreadsheetId: workbookId,
    range: tabName,
    valueInputOption: 'RAW',
    requestBody: { values },
  });
};

export default appendRow;
