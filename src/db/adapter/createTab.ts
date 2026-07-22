import getSheetsClient from './getSheetsClient.js';
import sheetsLimiter from '#utils/rateLimiters/sheetsLimiter.js';
import scheduleGoogleApiCall from '#utils/rateLimiters/scheduleGoogleApiCall.js';
import { logger } from '#utils/logger.js';

// Adds a new sheet tab to an existing workbook — throws if the tab already exists.
const createTab = async (workbookId: string, tabName: string): Promise<void> => {
  logger.debug(`Creating tab: ${tabName} in workbook: ${workbookId}`);
  const sheets = await getSheetsClient();

  await scheduleGoogleApiCall(sheetsLimiter, () => sheets.spreadsheets.batchUpdate({
    spreadsheetId: workbookId,
    requestBody: {
      requests: [
        {
          addSheet: {
            properties: { title: tabName },
          },
        },
      ],
    },
  }));
};

export default createTab;
