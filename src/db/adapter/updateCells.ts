import getSheetsClient from './getSheetsClient.js';
import sheetsLimiter from '#utils/rateLimiters/sheetsLimiter.js';
import { logger } from '#utils/logger.js';

// Writes values to a specific A1 range with USER_ENTERED input option — used for targeted cell updates.
const updateCells = async (workbookId: string, range: string, values: unknown[][]): Promise<void> => {
  logger.debug(`Updating cells: ${range} in workbook: ${workbookId}`);
  const sheets = await getSheetsClient();
  await sheetsLimiter.schedule(() => sheets.spreadsheets.values.update({
    spreadsheetId: workbookId,
    range,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: values as string[][] },
  }));
};

export default updateCells;
