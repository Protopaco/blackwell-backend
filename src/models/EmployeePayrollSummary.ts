import HourlyEntry from "#models/HourlyEntry.js";
import FlatRateEntry from "#models/FlatRateEntry.js";

interface EmployeePayrollSummary {
  employeeName: string;
  hourly: HourlyEntry[];
  flatRate: FlatRateEntry[];
}

export default EmployeePayrollSummary;
