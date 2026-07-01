import HourlyEntry from './HourlyEntry.js';
import FlatRateEntry from './FlatRateEntry.js';

interface EmployeePayrollSummary {
  employeeName: string;
  hourly: HourlyEntry[];
  flatRate: FlatRateEntry[];
}

export default EmployeePayrollSummary;
