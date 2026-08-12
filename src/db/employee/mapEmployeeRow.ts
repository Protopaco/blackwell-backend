import Employee from '#models/Employee.js';

// Maps an Employee back to a sheet-row object keyed by EMPLOYEES_HEADERS — the write-side inverse of mapEmployee.ts.
// activityRates isn't included — those rows live in the separate EmployeeActivityRates tab.
const mapEmployeeRow = (employee: Employee): Record<string, unknown> => ({
  EmployeeId: employee.employeeId,
  FirstName: employee.firstName,
  LastName: employee.lastName,
  Position: employee.position,
  SalaryAmount: employee.salaryAmount,
  Email: employee.email,
  Status: employee.status,
  TimesheetFileId: employee.timesheetFileId,
});

export default mapEmployeeRow;
