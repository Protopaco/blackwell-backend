import getSheetsClient from './getSheetsClient.js';
import { logger } from '#utils/logger.js';

// Overwrites an entire tab with keyed row objects, writing headers on the first row — used when updating pay period records.
const writeTab = async (workbookId: string, tabName: string, rows: Record<string, unknown>[]): Promise<void> => {
  logger.debug(`Writing tab: ${tabName} in workbook: ${workbookId}`);
  if (rows.length === 0) return;

  const sheets = await getSheetsClient();
  const headers = Object.keys(rows[0]);
  const values = [headers, ...rows.map((row) => headers.map((header) => row[header] ?? ''))];

  await sheets.spreadsheets.values.update({
    spreadsheetId: workbookId,
    range: tabName,
    valueInputOption: 'RAW',
    requestBody: { values },
  });
};

export default writeTab;
