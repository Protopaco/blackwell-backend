import readTab from '#db/adapter/readTab.js';
import Activity from '#models/Activity.js';
import mapActivity from '#db/activity/mapActivity.js';

// Reads all activities from the Activities tab of a client's payroll config file.
const readActivities = async (payrollConfigFileId: string): Promise<Activity[]> => {
  const rows = await readTab(payrollConfigFileId, 'Activities');
  return rows.map(mapActivity);
};

export default readActivities;
