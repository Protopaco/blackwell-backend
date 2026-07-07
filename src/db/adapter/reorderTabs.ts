import getSheetsClient from './getSheetsClient.js';
import { logger } from '#utils/logger.js';

// Sets tab order to match orderedTabNames (left to right) in one batched call.
// Every name must already exist as a tab in the workbook — throws if any is missing.
const reorderTabs = async (workbookId: string, orderedTabNames: string[]): Promise<void> => {
  logger.debug(`Reordering tabs in workbook: ${workbookId} — ${orderedTabNames.join(', ')}`);
  const sheets = await getSheetsClient();
  const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId: workbookId });

  const sheetIdByTabName = new Map(
    (spreadsheet.data.sheets ?? []).map((sheet) => [sheet.properties?.title, sheet.properties?.sheetId]),
  );

  const requests = orderedTabNames.map((tabName, index) => {
    const sheetId = sheetIdByTabName.get(tabName);
    if (sheetId == null) throw new Error(`Tab not found: ${tabName}`);

    return {
      updateSheetProperties: {
        properties: { sheetId, index },
        fields: 'index',
      },
    };
  });

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: workbookId,
    requestBody: { requests },
  });
};

export default reorderTabs;
