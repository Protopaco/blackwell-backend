import readTab from '#db/adapter/readTab.js';
import deleteRow from '#db/adapter/deleteRow.js';
import { MANIFEST_TAB } from '#config/constants.js';

// Removes the manifest entry for a specific pay period tab from the _manifest tab — no-ops if the entry doesn't exist.
const deleteManifest = async (timesheetFileId: string, tabName: string): Promise<void> => {
  const rows = await readTab(timesheetFileId, MANIFEST_TAB);

  // Find the 1-based row number of the manifest entry for this pay period tab
  // Add 2 to account for: 1 for the header row, 1 for the 0-to-1 index conversion
  const rowIndex = rows.findIndex((row) => row['tabName'] === tabName);

  if (rowIndex === -1) return; // nothing to delete

  const rowNumber = rowIndex + 2;

  await deleteRow(timesheetFileId, MANIFEST_TAB, rowNumber);
};

export default deleteManifest;
