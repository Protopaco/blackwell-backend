import Employee from "#models/Employee.js";
import { EmployeeStatusType } from "#models/EmployeeStatus.js";

// Converts a raw Employees sheet row into an Employee model — called by readEmployees and readPayrollConfig.
const mapEmployee = (row: Record<string, unknown>): Employee => ({
  employeeId: row["EmployeeId"] as string,
  firstName: row["FirstName"] as string,
  lastName: row["LastName"] as string,
  position: row["Position"] as string,
  hourlyPayRate1: Number(row["HourlyPayRate1"]) || 0,
  hourlyPayRate2: Number(row["HourlyPayRate2"]) || 0,
  flatPayRate1: Number(row["FlatPayRate1"]) || 0,
  flatPayRate2: Number(row["FlatPayRate2"]) || 0,
  holidayPayRate: Number(row["HolidayPayRate"]) || 0,
  email: row["Email"] as string,
  status: row["Status"] as EmployeeStatusType,
  timesheetFileId: row["TimesheetFileId"] as string,
});

export default mapEmployee;
