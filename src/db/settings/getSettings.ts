import sheetsAdapter from '#db/adapter/sheetsAdapter.js';
import Settings from '#models/Settings.js';
import { TimeInputMethodType } from '#models/TimeInputMethod.js';
import { PayPeriodIntervalType } from '#models/PayPeriodInterval.js';

const mapToSettings = (row: Record<string, unknown>): Settings => ({
  // TimesheetTemplate in the sheet maps to timeInputMethod in this codebase
  timeInputMethod: row['TimesheetTemplate'] as TimeInputMethodType,
  payPeriodInterval: row['PayPeriodInterval'] as PayPeriodIntervalType,
  payPeriodStartDate: row['PayPeriodStartDate'] as string,
});

const getSettings = async (payrollConfigFileId: string): Promise<Settings> => {
  const rows = await sheetsAdapter.readTab(payrollConfigFileId, 'Settings');

  if (rows.length === 0) throw new Error('Settings not found in Payroll Config');

  return mapToSettings(rows[0]);
};

export default getSettings;
