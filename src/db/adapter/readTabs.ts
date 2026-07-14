import getSheetsClient from './getSheetsClient.js';
import sheetsLimiter from '#utils/rateLimiters/sheetsLimiter.js';
import { logger } from '#utils/logger.js';

// Reads multiple tabs in one batched call, mapping each tab's rows to keyed objects using its first
// row as headers — the batched counterpart to readTab.ts. Returns results in the same order as tabNames.
const readTabs = async (workbookId: string, tabNames: string[]): Promise<Record<string, unknown>[][]> => {
  logger.debug(`Reading tabs: ${tabNames.join(', ')} from workbook: ${workbookId}`);
  const sheets = await getSheetsClient();

  const response = await sheetsLimiter.schedule(() => sheets.spreadsheets.values.batchGet({
    spreadsheetId: workbookId,
    ranges: tabNames,
  }));

  const valueRanges = response.data.valueRanges ?? [];

  return valueRanges.map((valueRange) => {
    const rows = valueRange.values;
    if (!rows || rows.length <= 1) return [];

    const headers = rows[0] as string[];
    return rows.slice(1).map((row) => {
      const record: Record<string, unknown> = {};
      headers.forEach((header, headerIndex) => {
        record[header] = (row as unknown[])[headerIndex] ?? '';
      });
      return record;
    });
  });
};

export default readTabs;
