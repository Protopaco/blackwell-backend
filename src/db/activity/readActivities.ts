import sheetsAdapter from '#db/adapter/sheetsAdapter.js';
import Activity from '#models/Activity.js';
import mapActivity from '#db/activity/mapActivity.js';

// Reads all activities from the Activities tab of a client's payroll config file.
const readActivities = async (payrollConfigFileId: string): Promise<Activity[]> => {
  const rows = await sheetsAdapter.readTab(payrollConfigFileId, 'Activities');
  return rows.map(mapActivity);
};

export default readActivities;
