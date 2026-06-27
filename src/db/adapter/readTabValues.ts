import getSheetsClient from './getSheetsClient.js';
import { logger } from '#utils/logger.js';

// Returns raw rows with no header interpretation — use when the first row is data, not a header.
const readTabValues = async (workbookId: string, tabName: string): Promise<unknown[][]> => {
  logger.debug(`Reading raw values from tab: ${tabName} in workbook: ${workbookId}`);
  const sheets = await getSheetsClient();
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: workbookId,
    range: tabName,
  });
  return (response.data.values as unknown[][]) ?? [];
};

export default readTabValues;
