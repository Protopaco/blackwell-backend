import Settings from '#models/Settings.js';
import { TimeInputMethodType } from '#models/TimeInputMethod.js';
import { PayPeriodIntervalType } from '#models/PayPeriodInterval.js';

// Converts a raw Settings sheet row into a Settings model — note that the sheet column is "TimesheetTemplate", mapped here to timeInputMethod.
const mapSettings = (row: Record<string, unknown>): Settings => ({
  // TimesheetTemplate in the sheet maps to timeInputMethod in this codebase
  timeInputMethod: row['TimesheetTemplate'] as TimeInputMethodType,
  payPeriodInterval: row['PayPeriodInterval'] as PayPeriodIntervalType,
  payPeriodStartDate: row['PayPeriodStartDate'] as string,
});

export default mapSettings;
