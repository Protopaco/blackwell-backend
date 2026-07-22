import TimesheetManifest from '#models/TimesheetManifest.js';
import { logger } from '#utils/logger.js';

// Finds and deserializes the manifest entry for a specific pay period tab from already-fetched manifest
// tab rows — returns null if absent or malformed. Shared by readManifest (which fetches the manifest
// tab on its own) and readTimesheetDetailFromSheets (which fetches the manifest tab and the pay-period
// tab together in one batched call).
const findManifestEntry = (rows: unknown[][], tabName: string): TimesheetManifest | null => {
  try {
    const matchingRow = rows.find((row) => row[0] === tabName);
    if (!matchingRow) return null;
    return JSON.parse(matchingRow[1] as string) as TimesheetManifest;
  } catch (error) {
    logger.error({ error, tabName }, 'findManifestEntry failed — returning null');
    return null;
  }
};

export default findManifestEntry;
