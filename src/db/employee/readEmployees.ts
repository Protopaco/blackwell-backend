import readTab from '#db/adapter/readTab.js';
import { EMPLOYEES_TAB } from '#config/constants.js';
import Employee from '#models/Employee.js';
import mapEmployee from '#db/employee/mapEmployee.js';

// Reads all employees directly from the Employees tab of the given workbook (PayrollConfig or a pay
// period's report workbook), bypassing any cache — used when fresh data is required (e.g., status checks).
const readEmployees = async (workbookId: string): Promise<Employee[]> => {
  const rows = await readTab(workbookId, EMPLOYEES_TAB);
  return rows.map(mapEmployee);
};

export default readEmployees;
