import Employee from './Employee.js';
import Supervisor from './Supervisor.js';
import Activity from './Activity.js';
import FundingSource from './FundingSource.js';
import Holiday from './Holiday.js';
import Settings from './Settings.js';

interface PayrollConfig {
  employees: Employee[];
  supervisors: Supervisor[];
  activities: Activity[];
  fundingSources: FundingSource[];
  holidays: Holiday[];
  settings: Settings;
}

export default PayrollConfig;
