import getSheetsClient from './getSheetsClient.js';
import { logger } from '#utils/logger.js';

// Reads a tab and maps each row to a keyed object using the first row as headers — used for config/data tabs.
const readTab = async (workbookId: string, tabName: string): Promise<Record<string, unknown>[]> => {
  logger.debug(`Reading tab: ${tabName} from workbook: ${workbookId}`);
  const sheets = await getSheetsClient();

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: workbookId,
    range: tabName,
  });

  const rows = response.data.values;
  if (!rows || rows.length === 0) return [];
  if (rows.length === 1) return [];

  const headers = rows[0] as string[];

  return rows.slice(1).map((row) => {
    const record: Record<string, unknown> = {};
    headers.forEach((header, headerIndex) => {
      record[header] = row[headerIndex] ?? '';
    });
    return record;
  });
};

export default readTab;
