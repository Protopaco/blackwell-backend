import readActivities from './readActivities.js';
import Activity from '#models/Activity.js';

// Reads the activity list fresh from the given workbook's Activities tab (PayrollConfig or a pay period's
// report workbook) and returns one activity by ID — always bypasses any cache.
const readActivityById = async (workbookId: string, activityId: string): Promise<Activity | null> => {
  const activities = await readActivities(workbookId);
  return activities.find((activity) => activity.activityId === activityId) ?? null;
};

export default readActivityById;
