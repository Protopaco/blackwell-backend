import getSheetsClient from './getSheetsClient.js';
import sheetsLimiter from '#utils/rateLimiters/sheetsLimiter.js';
import scheduleGoogleApiCall from '#utils/rateLimiters/scheduleGoogleApiCall.js';

// Returns the titles of every tab currently in the workbook.
const listTabNames = async (workbookId: string): Promise<string[]> => {
  const sheets = await getSheetsClient();
  const spreadsheet = await scheduleGoogleApiCall(sheetsLimiter, () => sheets.spreadsheets.get({ spreadsheetId: workbookId }));
  return (spreadsheet.data.sheets ?? [])
    .map((sheet) => sheet.properties?.title)
    .filter((title): title is string => title != null);
};

export default listTabNames;
