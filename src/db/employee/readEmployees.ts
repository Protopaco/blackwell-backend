import sheetsAdapter from '#db/adapter/sheetsAdapter.js';
import Employee from '#models/Employee.js';
import mapEmployee from '#db/employee/mapEmployee.js';

// Reads all employees directly from the Employees tab, bypassing any cache — used when fresh data is required (e.g., status checks).
const readEmployees = async (payrollConfigFileId: string): Promise<Employee[]> => {
  const rows = await sheetsAdapter.readTab(payrollConfigFileId, 'Employees');
  return rows.map(mapEmployee);
};

export default readEmployees;
