import Employee from "#models/Employee.js";
import { EmployeeStatusType } from "#models/EmployeeStatus.js";

// Converts a raw Employees sheet row into an Employee model — called by readEmployees and readPayrollConfig.
// activityRates is left empty here since it isn't a column on this row; readPayrollConfig joins it in
// separately from the EmployeeActivityRates tab (see joinEmployeeActivityRates.ts).
const mapEmployee = (row: Record<string, unknown>): Employee => ({
  employeeId: row["EmployeeId"] as string,
  firstName: row["FirstName"] as string,
  lastName: row["LastName"] as string,
  position: row["Position"] as string,
  salaryAmount: Number(row["SalaryAmount"]) || 0,
  activityRates: [],
  email: row["Email"] as string,
  status: row["Status"] as EmployeeStatusType,
  timesheetFileId: row["TimesheetFileId"] as string,
});

export default mapEmployee;
