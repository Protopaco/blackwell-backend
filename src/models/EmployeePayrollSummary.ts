import HourlyEntry from "#models/HourlyEntry.js";
import FlatRateEntry from "#models/FlatRateEntry.js";

interface EmployeePayrollSummary {
  employeeName: string;
  totalHours: number;
  totalFlatRate: number;
  totalExpense: number | null;
  hourly: HourlyEntry[];
  flatRate: FlatRateEntry[];
}

export default EmployeePayrollSummary;
