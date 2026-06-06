import getEmployees from './getEmployees.js';
import Employee from '#models/Employee.js';

const getEmployeeById = async (payrollConfigFileId: string, employeeId: string): Promise<Employee | null> => {
  const employees = await getEmployees(payrollConfigFileId);
  return employees.find((employee) => employee.employeeId === employeeId) ?? null;
};

export default getEmployeeById;
