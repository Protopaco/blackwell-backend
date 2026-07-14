import getSheetsClient from './getSheetsClient.js';
import sheetsLimiter from '#utils/rateLimiters/sheetsLimiter.js';
import { logger } from '#utils/logger.js';

// Writes a raw 2D array to a tab with USER_ENTERED input option so formulas are interpreted.
const writeValues = async (workbookId: string, tabName: string, values: unknown[][]): Promise<void> => {
  logger.debug(`Writing values to tab: ${tabName} in workbook: ${workbookId}`);
  if (values.length === 0) return;

  const sheets = await getSheetsClient();

  await sheetsLimiter.schedule(() => sheets.spreadsheets.values.update({
    spreadsheetId: workbookId,
    range: tabName,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: values as string[][] },
  }));
};

export default writeValues;
