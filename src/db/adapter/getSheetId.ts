import getSheetsClient from './getSheetsClient.js';
import sheetsLimiter from '#utils/rateLimiters/sheetsLimiter.js';
import scheduleGoogleApiCall from '#utils/rateLimiters/scheduleGoogleApiCall.js';

// Returns the numeric sheetId for a named tab — required by formatting batchUpdate requests.
const getSheetId = async (workbookId: string, tabName: string): Promise<number> => {
  const sheets = await getSheetsClient();
  const spreadsheet = await scheduleGoogleApiCall(sheetsLimiter, () => sheets.spreadsheets.get({ spreadsheetId: workbookId }));
  const sheet = spreadsheet.data.sheets?.find((s) => s.properties?.title === tabName);
  if (!sheet || sheet.properties?.sheetId == null) throw new Error(`Tab not found: ${tabName}`);
  return sheet.properties.sheetId;
};

export default getSheetId;
