import overwriteTabRows from '#db/adapter/overwriteTabRows.js';
import { SETTINGS_TAB, SETTINGS_HEADERS } from '#config/constants.js';
import Settings from '#models/Settings.js';

// Overwrites the client's single Settings row. Settings is a singleton — always exactly one row,
// so there's no existing record to look up or match; this just writes the given values directly.
const writeSettings = async (payrollConfigFileId: string, settings: Settings): Promise<void> => {
  const row: Record<string, unknown> = {
    TimesheetTemplate: settings.timeInputMethod,
    PayPeriodInterval: settings.payPeriodInterval,
    PayPeriodStartDate: settings.payPeriodStartDate,
  };

  await overwriteTabRows(payrollConfigFileId, SETTINGS_TAB, SETTINGS_HEADERS, [row]);
};

export default writeSettings;
