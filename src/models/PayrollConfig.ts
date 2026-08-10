import Employee from './Employee.js';
import Supervisor from './Supervisor.js';
import Activity from './Activity.js';
import EmployeeActivityRate from './EmployeeActivityRate.js';
import FundingSource from './FundingSource.js';
import Holiday from './Holiday.js';
import Settings from './Settings.js';
import TimesheetFolder from './TimesheetFolder.js';

interface PayrollConfig {
  employees: Employee[];
  supervisors: Supervisor[];
  activities: Activity[];
  employeeActivityRates: EmployeeActivityRate[];
  fundingSources: FundingSource[];
  holidays: Holiday[];
  settings: Settings;
  timesheetFolders: TimesheetFolder[];
}

export default PayrollConfig;
