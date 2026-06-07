import Settings from '#models/Settings.js';
import { TimeInputMethodType } from '#models/TimeInputMethod.js';
import { PayPeriodIntervalType } from '#models/PayPeriodInterval.js';

const mapSettings = (row: Record<string, unknown>): Settings => ({
  // TimesheetTemplate in the sheet maps to timeInputMethod in this codebase
  timeInputMethod: row['TimesheetTemplate'] as TimeInputMethodType,
  payPeriodInterval: row['PayPeriodInterval'] as PayPeriodIntervalType,
  payPeriodStartDate: row['PayPeriodStartDate'] as string,
});

export default mapSettings;
