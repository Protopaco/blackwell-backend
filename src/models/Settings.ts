import { TimeInputMethodType } from './TimeInputMethod.js';
import { PayPeriodIntervalType } from './PayPeriodInterval.js';

interface Settings {
  timeInputMethod: TimeInputMethodType;  // mapped from "TimesheetTemplate" in the config sheet
  payPeriodInterval: PayPeriodIntervalType;
  payPeriodStartDate: string;
}

export default Settings;
