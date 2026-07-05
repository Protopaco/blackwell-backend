import getSheetsClient from './getSheetsClient.js';
import { logger } from '#utils/logger.js';

// Renames an existing tab — used to archive current_hours and current_payroll_summary before a payroll report re-run.
const renameTab = async (workbookId: string, currentTabName: string, newTabName: string): Promise<void> => {
  logger.debug(`Renaming tab: ${currentTabName} → ${newTabName} in workbook: ${workbookId}`);
  const sheets = await getSheetsClient();
  const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId: workbookId });
  const tab = spreadsheet.data.sheets?.find((s) => s.properties?.title === currentTabName);

  if (!tab || tab.properties?.sheetId == null) throw new Error(`Tab not found: ${currentTabName}`);

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: workbookId,
    requestBody: {
      requests: [
        {
          updateSheetProperties: {
            properties: { sheetId: tab.properties.sheetId, title: newTabName },
            fields: 'title',
          },
        },
      ],
    },
  });
};

export default renameTab;
