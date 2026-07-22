import Employee from './Employee.js';
import Supervisor from './Supervisor.js';
import Activity from './Activity.js';
import FundingSource from './FundingSource.js';
import Holiday from './Holiday.js';
import Settings from './Settings.js';
import PayPeriodResponse from './PayPeriodResponse.js';
import TimesheetFolder from './TimesheetFolder.js';

interface ClientSummary {
  employees: Employee[];
  supervisors: Supervisor[];
  activities: Activity[];
  fundingSources: FundingSource[];
  holidays: Holiday[];
  timesheetFolders: TimesheetFolder[];
  settings: Settings;
  payPeriods: PayPeriodResponse[];
}

export default ClientSummary;
