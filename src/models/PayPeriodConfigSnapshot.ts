import Employee from './Employee.js';
import Activity from './Activity.js';
import EmployeeActivityRate from './EmployeeActivityRate.js';
import FundingSource from './FundingSource.js';
import Holiday from './Holiday.js';
import Settings from './Settings.js';

interface PayPeriodConfigSnapshot {
  employees: Employee[];
  activities: Activity[];
  employeeActivityRates: EmployeeActivityRate[];
  fundingSources: FundingSource[];
  holidays: Holiday[];
  settings: Settings;
}

export default PayPeriodConfigSnapshot;
