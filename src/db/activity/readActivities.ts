import sheetsAdapter from '#db/adapter/sheetsAdapter.js';
import Activity from '#models/Activity.js';
import mapActivity from '#db/activity/mapActivity.js';

const readActivities = async (payrollConfigFileId: string): Promise<Activity[]> => {
  const rows = await sheetsAdapter.readTab(payrollConfigFileId, 'Activities');
  return rows.map(mapActivity);
};

export default readActivities;
