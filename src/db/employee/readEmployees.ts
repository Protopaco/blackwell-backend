import sheetsAdapter from '#db/adapter/sheetsAdapter.js';
import Employee from '#models/Employee.js';
import mapEmployee from '#db/employee/mapEmployee.js';

const readEmployees = async (payrollConfigFileId: string): Promise<Employee[]> => {
  const rows = await sheetsAdapter.readTab(payrollConfigFileId, 'Employees');
  return rows.map(mapEmployee);
};

export default readEmployees;
