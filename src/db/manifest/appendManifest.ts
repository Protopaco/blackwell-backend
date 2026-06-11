import sheetsAdapter from '#db/adapter/sheetsAdapter.js';
import TimesheetManifest from '#models/TimesheetManifest.js';

const MANIFEST_TAB = '_manifest';

const appendManifest = async (timesheetFileId: string, manifest: TimesheetManifest): Promise<void> => {
  await sheetsAdapter.createTabIfNotExists(timesheetFileId, MANIFEST_TAB);

  if (await sheetsAdapter.tabExists(timesheetFileId, 'Sheet1')) {
    await sheetsAdapter.deleteTab(timesheetFileId, 'Sheet1');
  }

  const serialised = JSON.stringify(manifest);
  const existingRows = await sheetsAdapter.readTabValues(timesheetFileId, MANIFEST_TAB);
  const existingRowIndex = existingRows.findIndex((row) => row[0] === manifest.tabName);

  if (existingRowIndex >= 0) {
    // Overwrite in place — someone deleted the tab without clearing the manifest entry
    const sheetRowNumber = existingRowIndex + 1; // 1-based
    await sheetsAdapter.updateCells(
      timesheetFileId,
      `${MANIFEST_TAB}!A${sheetRowNumber}:B${sheetRowNumber}`,
      [[manifest.tabName, serialised]],
    );
  } else {
    await sheetsAdapter.appendRow(timesheetFileId, MANIFEST_TAB, {
      tabName: manifest.tabName,
      manifest: serialised,
    });
  }
};

export default appendManifest;
