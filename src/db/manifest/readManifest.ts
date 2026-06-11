import sheetsAdapter from '#db/adapter/sheetsAdapter.js';
import TimesheetManifest from '#models/TimesheetManifest.js';

const MANIFEST_TAB = '_manifest';

const readManifest = async (timesheetFileId: string, tabName: string): Promise<TimesheetManifest | null> => {
  try {
    const rows = await sheetsAdapter.readTabValues(timesheetFileId, MANIFEST_TAB);
    const matchingRow = rows.find((row) => row[0] === tabName);
    if (!matchingRow) return null;
    return JSON.parse(matchingRow[1] as string) as TimesheetManifest;
  } catch {
    return null;
  }
};

export default readManifest;
