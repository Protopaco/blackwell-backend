import getEmployees from './readEmployees.js';
import Employee from '#models/Employee.js';

const readEmployeeById = async (payrollConfigFileId: string, employeeId: string): Promise<Employee | null> => {
  const employees = await getEmployees(payrollConfigFileId);
  return employees.find((employee) => employee.employeeId === employeeId) ?? null;
};

export default readEmployeeById;
