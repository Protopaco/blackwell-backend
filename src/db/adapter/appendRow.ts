import getSheetsClient from './getSheetsClient.js';
import sheetsLimiter from '#utils/rateLimiters/sheetsLimiter.js';
import scheduleGoogleApiCall from '#utils/rateLimiters/scheduleGoogleApiCall.js';
import { logger } from '#utils/logger.js';

// Appends a single row of values to the end of a tab, ordered by the given headers — the row object's
// own key order doesn't matter, values are looked up by header name.
const appendRow = async (
  workbookId: string,
  tabName: string,
  headers: string[],
  row: Record<string, unknown>,
): Promise<void> => {
  logger.debug(`Appending row to tab: ${tabName} in workbook: ${workbookId}`);
  const sheets = await getSheetsClient();
  const values = [headers.map((header) => row[header] ?? '')];

  await scheduleGoogleApiCall(sheetsLimiter, () => sheets.spreadsheets.values.append({
    spreadsheetId: workbookId,
    range: tabName,
    valueInputOption: 'RAW',
    requestBody: { values },
  }));
};

export default appendRow;
