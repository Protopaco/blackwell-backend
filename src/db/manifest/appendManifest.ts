import createTabIfNotExists from '#db/adapter/createTabIfNotExists.js';
import readTabValues from '#db/adapter/readTabValues.js';
import updateCells from '#db/adapter/updateCells.js';
import appendRow from '#db/adapter/appendRow.js';
import { MANIFEST_TAB, MANIFEST_HEADERS } from '#config/constants.js';
import TimesheetManifest from '#models/TimesheetManifest.js';

// Writes a timesheet manifest entry to the _manifest tab (creating it if needed) and overwrites
// an existing entry for the same pay period tab rather than duplicating it.
// Sheet1 cleanup is handled automatically by createTabIfNotExists.
const appendManifest = async (timesheetFileId: string, manifest: TimesheetManifest): Promise<void> => {
  await createTabIfNotExists(timesheetFileId, MANIFEST_TAB);

  const serialised = JSON.stringify(manifest);
  const existingRows = await readTabValues(timesheetFileId, MANIFEST_TAB);
  const existingRowIndex = existingRows.findIndex((row) => row[0] === manifest.tabName);

  if (existingRowIndex >= 0) {
    // Overwrite in place — someone deleted the tab without clearing the manifest entry
    const sheetRowNumber = existingRowIndex + 1; // 1-based
    await updateCells(
      timesheetFileId,
      `${MANIFEST_TAB}!A${sheetRowNumber}:B${sheetRowNumber}`,
      [[manifest.tabName, serialised]],
    );
  } else {
    await appendRow(timesheetFileId, MANIFEST_TAB, MANIFEST_HEADERS, {
      tabName: manifest.tabName,
      manifest: serialised,
    });
  }
};

export default appendManifest;
