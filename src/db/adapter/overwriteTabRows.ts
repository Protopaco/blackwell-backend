import getSheetsClient from './getSheetsClient.js';
import sheetsLimiter from '#utils/rateLimiters/sheetsLimiter.js';
import { logger } from '#utils/logger.js';

// Overwrites existing rows in a tab in place, ordered by the given headers — does NOT clear the tab first,
// so it's only safe for a read-modify-write pattern where the row count never shrinks. For an arbitrary
// caller-supplied replacement set (where the count isn't guaranteed), clear the tab first instead.
const overwriteTabRows = async (
  workbookId: string,
  tabName: string,
  headers: string[],
  rows: Record<string, unknown>[],
): Promise<void> => {
  logger.debug(`Overwriting tab rows: ${tabName} in workbook: ${workbookId}`);
  if (rows.length === 0) return;

  const sheets = await getSheetsClient();
  const values = [headers, ...rows.map((row) => headers.map((header) => row[header] ?? ''))];

  await sheetsLimiter.schedule(() => sheets.spreadsheets.values.update({
    spreadsheetId: workbookId,
    range: tabName,
    valueInputOption: 'RAW',
    requestBody: { values },
  }));
};

export default overwriteTabRows;
