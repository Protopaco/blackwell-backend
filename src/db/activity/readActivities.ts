import readTab from '#db/adapter/readTab.js';
import { ACTIVITIES_TAB } from '#config/constants.js';
import Activity from '#models/Activity.js';
import mapActivity from '#db/activity/mapActivity.js';

// Reads all activities from the Activities tab of a client's payroll config file.
const readActivities = async (workbookId: string): Promise<Activity[]> => {
  const rows = await readTab(workbookId, ACTIVITIES_TAB);
  return rows.map(mapActivity);
};

export default readActivities;
