import overwriteTabRows from '#db/adapter/overwriteTabRows.js';
import readEmployees from '#db/employee/readEmployees.js';
import mapEmployeeRow from '#db/employee/mapEmployeeRow.js';
import { EMPLOYEES_TAB, EMPLOYEES_HEADERS } from '#config/constants.js';
import Employee from '#models/Employee.js';
import { NotFoundError } from '#utils/errors.js';

// Overwrites all employee rows in the given workbook (PayrollConfig or a pay period's report workbook),
// updating the one matching the given employee.
const writeEmployees = async (workbookId: string, updatedEmployee: Employee): Promise<void> => {
  const employees = await readEmployees(workbookId);

  const index = employees.findIndex((employee) => employee.employeeId === updatedEmployee.employeeId);
  if (index === -1) throw new NotFoundError(`Employee not found: ${updatedEmployee.employeeId}`);

  employees[index] = updatedEmployee;

  const rows = employees.map(mapEmployeeRow);

  await overwriteTabRows(workbookId, EMPLOYEES_TAB, EMPLOYEES_HEADERS, rows);
};

export default writeEmployees;
