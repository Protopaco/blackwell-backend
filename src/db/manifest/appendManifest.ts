import sheetsAdapter from '#db/adapter/sheetsAdapter.js';
import TimesheetManifest from '#models/TimesheetManifest.js';

const MANIFEST_TAB = '_manifest';

const appendManifest = async (timesheetFileId: string, manifest: TimesheetManifest): Promise<void> => {
  const row: Record<string, unknown> = {
    tabName: manifest.tabName,
    manifest: JSON.stringify(manifest),
  };

  await sheetsAdapter.appendRow(timesheetFileId, MANIFEST_TAB, row);
};

export default appendManifest;
