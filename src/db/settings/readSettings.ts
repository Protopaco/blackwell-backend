import sheetsAdapter from '#db/adapter/sheetsAdapter.js';
import Settings from '#models/Settings.js';
import mapSettings from '#db/settings/mapSettings.js';

// Reads the first row of the Settings tab from a payroll config file — throws if the tab is empty.
const readSettings = async (payrollConfigFileId: string): Promise<Settings> => {
  const rows = await sheetsAdapter.readTab(payrollConfigFileId, 'Settings');

  if (rows.length === 0) throw new Error('Settings not found in Payroll Config');

  return mapSettings(rows[0]);
};

export default readSettings;
