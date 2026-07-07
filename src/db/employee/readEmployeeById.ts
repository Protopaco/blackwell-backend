import getEmployees from './readEmployees.js';
import Employee from '#models/Employee.js';

// Reads the employee list fresh from the sheet and returns one employee by ID — always bypasses the payrollConfig cache.
const readEmployeeById = async (payrollConfigFileId: string, employeeId: string): Promise<Employee | null> => {
  const employees = await getEmployees(payrollConfigFileId);
  return employees.find((employee) => employee.employeeId === employeeId) ?? null;
};

export default readEmployeeById;
