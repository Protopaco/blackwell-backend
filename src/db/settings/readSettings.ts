import readTab from '#db/adapter/readTab.js';
import { SETTINGS_TAB } from '#config/constants.js';
import Settings from '#models/Settings.js';
import mapSettings from '#db/settings/mapSettings.js';

// Reads the first row of the Settings tab from a payroll config file — throws if the tab is empty.
const readSettings = async (payrollConfigFileId: string): Promise<Settings> => {
  const rows = await readTab(payrollConfigFileId, SETTINGS_TAB);

  if (rows.length === 0) throw new Error('Settings not found in Payroll Config');

  return mapSettings(rows[0]);
};

export default readSettings;
