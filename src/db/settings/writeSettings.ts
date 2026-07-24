import overwriteTabRows from '#db/adapter/overwriteTabRows.js';
import { SETTINGS_TAB, SETTINGS_HEADERS } from '#config/constants.js';
import Settings from '#models/Settings.js';

// Overwrites the Settings row in the given workbook's Settings tab. Settings is a singleton — always
// exactly one row, so there's no existing record to look up or match; this just writes the given
// values directly. Not PayrollConfig-specific — workbookId is just the target workbook's file ID,
// which lets this also seed a pay period's report workbook snapshot.
const writeSettings = async (workbookId: string, settings: Settings): Promise<void> => {
  const row: Record<string, unknown> = {
    TimesheetTemplate: settings.timeInputMethod,
    PayPeriodInterval: settings.payPeriodInterval,
    PayPeriodStartDate: settings.payPeriodStartDate,
  };

  await overwriteTabRows(workbookId, SETTINGS_TAB, SETTINGS_HEADERS, [row]);
};

export default writeSettings;
