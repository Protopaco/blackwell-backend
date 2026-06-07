import sheetsAdapter from '#db/adapter/sheetsAdapter.js';
import TimesheetManifest from '#models/TimesheetManifest.js';

const MANIFEST_TAB = '_manifest';

const readManifest = async (timesheetFileId: string, tabName: string): Promise<TimesheetManifest | null> => {
  try {
    const rows = await sheetsAdapter.readTab(timesheetFileId, MANIFEST_TAB);
    const manifestRow = rows.find((row) => row['tabName'] === tabName);
    if (!manifestRow) return null;
    return JSON.parse(manifestRow['manifest'] as string) as TimesheetManifest;
  } catch {
    return null;
  }
};

export default readManifest;
