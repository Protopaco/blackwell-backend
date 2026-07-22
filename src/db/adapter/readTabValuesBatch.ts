import getSheetsClient from './getSheetsClient.js';
import sheetsLimiter from '#utils/rateLimiters/sheetsLimiter.js';
import scheduleGoogleApiCall from '#utils/rateLimiters/scheduleGoogleApiCall.js';
import { TabNotFoundError } from '#utils/errors.js';
import { logger } from '#utils/logger.js';

// Reads raw rows from multiple tabs of the same workbook in one batched call — the raw-values
// counterpart to readTabs.ts, which maps rows into keyed objects instead. Returns results in the same
// order as tabNames. Note: if any tabName doesn't exist as a real tab in the workbook, the whole call
// fails (Sheets validates every range up front) — throws TabNotFoundError in that case so callers can
// tell "one of these tabs doesn't exist" apart from other failures (quota, auth, network).
const readTabValuesBatch = async (workbookId: string, tabNames: string[]): Promise<unknown[][][]> => {
  logger.debug(`Reading raw values from tabs: ${tabNames.join(', ')} in workbook: ${workbookId}`);
  const sheets = await getSheetsClient();

  let response;
  try {
    response = await scheduleGoogleApiCall(sheetsLimiter, () => sheets.spreadsheets.values.batchGet({
      spreadsheetId: workbookId,
      ranges: tabNames,
    }));
  } catch (error: any) {
    if (error?.code === 400 || error?.response?.status === 400) {
      throw new TabNotFoundError(`One or more tabs not found in workbook ${workbookId}: ${tabNames.join(', ')}`);
    }
    throw error;
  }

  const valueRanges = response.data.valueRanges ?? [];
  return valueRanges.map((valueRange) => (valueRange.values as unknown[][]) ?? []);
};

export default readTabValuesBatch;
