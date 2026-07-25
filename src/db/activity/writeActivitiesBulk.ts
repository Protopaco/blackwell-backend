import writeValues from '#db/adapter/writeValues.js';
import mapActivityRow from '#db/activity/mapActivityRow.js';
import { ACTIVITIES_TAB, ACTIVITIES_HEADERS } from '#config/constants.js';
import Activity from '#models/Activity.js';

// Writes a full set of activities to the given workbook's Activities tab in one call — header row
// always included, even for an empty list. Assumes the tab already exists (see createTabsIfNotExists.js).
const writeActivitiesBulk = async (workbookId: string, activities: Activity[]): Promise<void> => {
  const rows = activities.map(mapActivityRow);
  const values = [ACTIVITIES_HEADERS, ...rows.map((row) => ACTIVITIES_HEADERS.map((header) => row[header] ?? ''))];

  await writeValues(workbookId, ACTIVITIES_TAB, values);
};

export default writeActivitiesBulk;
