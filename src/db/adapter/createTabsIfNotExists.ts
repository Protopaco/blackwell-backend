import getSheetsClient from './getSheetsClient.js';
import sheetsLimiter from '#utils/rateLimiters/sheetsLimiter.js';
import scheduleGoogleApiCall from '#utils/rateLimiters/scheduleGoogleApiCall.js';
import { logger } from '#utils/logger.js';

// Batched counterpart to createTabIfNotExists.ts — creates every missing tab in tabNames and removes
// the default Sheet1 (if present and not itself requested) in a single batchUpdate, instead of one
// addSheet/tabExists/deleteTab round trip per tab. No-ops if every requested tab already exists and
// there's no Sheet1 to remove.
const createTabsIfNotExists = async (workbookId: string, tabNames: string[]): Promise<void> => {
  logger.debug(`Creating tabs if not exists: ${tabNames.join(', ')} in workbook: ${workbookId}`);
  const sheets = await getSheetsClient();

  const spreadsheet = await scheduleGoogleApiCall(sheetsLimiter, () => sheets.spreadsheets.get({ spreadsheetId: workbookId }));
  const existingSheets = spreadsheet.data.sheets ?? [];
  const existingTitles = new Set(existingSheets.map((sheet) => sheet.properties?.title));

  const requests: object[] = tabNames
    .filter((tabName) => !existingTitles.has(tabName))
    .map((tabName) => ({ addSheet: { properties: { title: tabName } } }));

  const defaultSheet = existingSheets.find((sheet) => sheet.properties?.title === 'Sheet1');
  if (defaultSheet && defaultSheet.properties?.sheetId != null && !tabNames.includes('Sheet1')) {
    requests.push({ deleteSheet: { sheetId: defaultSheet.properties.sheetId } });
  }

  if (requests.length === 0) return;

  await scheduleGoogleApiCall(sheetsLimiter, () => sheets.spreadsheets.batchUpdate({
    spreadsheetId: workbookId,
    requestBody: { requests },
  }));
};

export default createTabsIfNotExists;
