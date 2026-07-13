import appendRow from '#db/adapter/appendRow.js';
import { EMPLOYEES_TAB, EMPLOYEES_HEADERS } from '#config/constants.js';
import Employee from '#models/Employee.js';

// Appends a new employee row to the Employees tab.
const appendEmployee = async (payrollConfigFileId: string, employee: Employee): Promise<void> => {
  const row: Record<string, unknown> = {
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
  };

  await appendRow(payrollConfigFileId, EMPLOYEES_TAB, EMPLOYEES_HEADERS, row);
};

export default appendEmployee;
