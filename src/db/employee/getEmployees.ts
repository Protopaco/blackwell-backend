import sheetsAdapter from '#db/adapter/sheetsAdapter.js';
import Employee from '#models/Employee.js';
import { EmployeeStatusType } from '#models/EmployeeStatus.js';

const mapToEmployee = (row: Record<string, unknown>): Employee => ({
  employeeId: row['EmployeeId'] as string,
  firstName: row['FirstName'] as string,
  lastName: row['LastName'] as string,
  position: row['Position'] as string,
  basePayRate: Number(row['BasePayRate']) || 0,
  secondaryPayRate: Number(row['SecondaryPayRate']) || 0,
  holidayPayRate: Number(row['HolidayPayRate']) || 0,
  email: row['Email'] as string,
  status: row['Status'] as EmployeeStatusType,
  timesheetFileLink: row['TimesheetFileLink'] as string,
  timesheetFileId: row['TimesheetFileId'] as string,
});

const getEmployees = async (payrollConfigFileId: string): Promise<Employee[]> => {
  const rows = await sheetsAdapter.readTab(payrollConfigFileId, 'Employees');
  return rows.map(mapToEmployee);
};

export default getEmployees;
