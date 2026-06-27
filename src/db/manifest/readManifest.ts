import readTabValues from '#db/adapter/readTabValues.js';
import TimesheetManifest from '#models/TimesheetManifest.js';

const MANIFEST_TAB = '_manifest';

// Finds and deserializes the manifest entry for a specific pay period tab — returns null if absent or if the _manifest tab doesn't exist yet.
const readManifest = async (timesheetFileId: string, tabName: string): Promise<TimesheetManifest | null> => {
  try {
    const rows = await readTabValues(timesheetFileId, MANIFEST_TAB);
    const matchingRow = rows.find((row) => row[0] === tabName);
    if (!matchingRow) return null;
    return JSON.parse(matchingRow[1] as string) as TimesheetManifest;
  } catch {
    return null;
  }
};

export default readManifest;
