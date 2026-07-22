import readTabValues from '#db/adapter/readTabValues.js';
import findManifestEntry from './findManifestEntry.js';
import { MANIFEST_TAB } from '#config/constants.js';
import TimesheetManifest from '#models/TimesheetManifest.js';
import { logger } from '#utils/logger.js';

// Finds and deserializes the manifest entry for a specific pay period tab — returns null if absent or if the _manifest tab doesn't exist yet.
const readManifest = async (timesheetFileId: string, tabName: string): Promise<TimesheetManifest | null> => {
  try {
    const rows = await readTabValues(timesheetFileId, MANIFEST_TAB);
    return findManifestEntry(rows, tabName);
  } catch (error) {
    logger.error({ error, timesheetFileId, tabName }, 'readManifest failed — returning null');
    return null;
  }
};

export default readManifest;
