import getEmployees from './readEmployees.js';
import Employee from '#models/Employee.js';

// Reads the employee list fresh from the given workbook's Employees tab (PayrollConfig or a pay period's
// report workbook) and returns one employee by ID — always bypasses any cache.
const readEmployeeById = async (workbookId: string, employeeId: string): Promise<Employee | null> => {
  const employees = await getEmployees(workbookId);
  return employees.find((employee) => employee.employeeId === employeeId) ?? null;
};

export default readEmployeeById;
