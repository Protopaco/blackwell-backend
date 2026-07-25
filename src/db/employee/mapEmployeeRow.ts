import Employee from '#models/Employee.js';

// Maps an Employee back to a sheet-row object keyed by EMPLOYEES_HEADERS — the write-side inverse of mapEmployee.ts.
const mapEmployeeRow = (employee: Employee): Record<string, unknown> => ({
  EmployeeId: employee.employeeId,
  FirstName: employee.firstName,
  LastName: employee.lastName,
  Position: employee.position,
  HourlyPayRate1: employee.hourlyPayRate1,
  HourlyPayRate2: employee.hourlyPayRate2,
  HolidayPayRate: employee.holidayPayRate,
  Email: employee.email,
  Status: employee.status,
  TimesheetFileId: employee.timesheetFileId,
});

export default mapEmployeeRow;
