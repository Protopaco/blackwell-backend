import getSheetsClient from './getSheetsClient.js';
import sheetsLimiter from '#utils/rateLimiters/sheetsLimiter.js';
import scheduleGoogleApiCall from '#utils/rateLimiters/scheduleGoogleApiCall.js';

// Returns true if a tab with the given name exists in the workbook — used before creating or deleting tabs.
// Returns false immediately for an empty workbookId (e.g. an employee with no timesheet file yet) without
// making an API call. Any other error (quota, auth, workbook not found) propagates rather than being
// silently treated as "tab doesn't exist."
const tabExists = async (workbookId: string, tabName: string): Promise<boolean> => {
  if (!workbookId) return false;

  const sheets = await getSheetsClient();
  const spreadsheet = await scheduleGoogleApiCall(sheetsLimiter, () => sheets.spreadsheets.get({ spreadsheetId: workbookId }));
  return spreadsheet.data.sheets?.some((sheet) => sheet.properties?.title === tabName) ?? false;
};

export default tabExists;
