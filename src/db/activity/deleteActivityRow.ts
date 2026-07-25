import readTab from '#db/adapter/readTab.js';
import deleteRow from '#db/adapter/deleteRow.js';
import { ACTIVITIES_TAB } from '#config/constants.js';
import { NotFoundError } from '#utils/errors.js';

// Deletes a single activity row from the Activities tab by activityId.
const deleteActivityRow = async (workbookId: string, activityId: string): Promise<void> => {
  const rows = await readTab(workbookId, ACTIVITIES_TAB);

  // Find the 1-based row number of the activity entry
  // Add 2 to account for: 1 for the header row, 1 for the 0-to-1 index conversion
  const rowIndex = rows.findIndex((row) => row['ActivityId'] === activityId);
  if (rowIndex === -1) throw new NotFoundError(`Activity not found: ${activityId}`);

  const rowNumber = rowIndex + 2;
  await deleteRow(workbookId, ACTIVITIES_TAB, rowNumber);
};

export default deleteActivityRow;
