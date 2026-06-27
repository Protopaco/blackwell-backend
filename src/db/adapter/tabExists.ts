import getSheetsClient from './getSheetsClient.js';

// Returns true if a tab with the given name exists in the workbook — used before creating or deleting tabs.
const tabExists = async (workbookId: string, tabName: string): Promise<boolean> => {
  try {
    const sheets = await getSheetsClient();
    const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId: workbookId });
    return spreadsheet.data.sheets?.some((sheet) => sheet.properties?.title === tabName) ?? false;
  } catch {
    return false;
  }
};

export default tabExists;
