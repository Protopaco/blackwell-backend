import getSheetsClient from './getSheetsClient.js';

// Returns the titles of every tab currently in the workbook.
const listTabNames = async (workbookId: string): Promise<string[]> => {
  const sheets = await getSheetsClient();
  const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId: workbookId });
  return (spreadsheet.data.sheets ?? [])
    .map((sheet) => sheet.properties?.title)
    .filter((title): title is string => title != null);
};

export default listTabNames;
