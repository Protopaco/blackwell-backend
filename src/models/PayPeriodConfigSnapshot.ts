import Employee from './Employee.js';
import Activity from './Activity.js';
import FundingSource from './FundingSource.js';
import Holiday from './Holiday.js';
import Settings from './Settings.js';

interface PayPeriodConfigSnapshot {
  employees: Employee[];
  activities: Activity[];
  fundingSources: FundingSource[];
  holidays: Holiday[];
  settings: Settings;
}

export default PayPeriodConfigSnapshot;
