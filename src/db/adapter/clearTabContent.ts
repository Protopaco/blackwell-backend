import getSheetsClient from './getSheetsClient.js';
import sheetsLimiter from '#utils/rateLimiters/sheetsLimiter.js';
import scheduleGoogleApiCall from '#utils/rateLimiters/scheduleGoogleApiCall.js';
import { logger } from '#utils/logger.js';

// Clears all cell values in a tab without deleting the tab itself.
// Call this before writing new data to ensure old rows beyond the new range are removed.
const clearTabContent = async (workbookId: string, tabName: string): Promise<void> => {
  logger.debug(`Clearing tab content: ${tabName} in workbook: ${workbookId}`);
  const sheets = await getSheetsClient();
  await scheduleGoogleApiCall(sheetsLimiter, () => sheets.spreadsheets.values.clear({
    spreadsheetId: workbookId,
    range: tabName,
  }));
};

export default clearTabContent;
