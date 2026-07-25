import writeValues from '#db/adapter/writeValues.js';
import mapEmployeeRow from '#db/employee/mapEmployeeRow.js';
import { EMPLOYEES_TAB, EMPLOYEES_HEADERS } from '#config/constants.js';
import Employee from '#models/Employee.js';

// Writes a full set of employees to the given workbook's Employees tab in one call — header row
// always included, even for an empty list. Assumes the tab already exists (see createTabsIfNotExists.js).
const writeEmployeesBulk = async (workbookId: string, employees: Employee[]): Promise<void> => {
  const rows = employees.map(mapEmployeeRow);
  const values = [EMPLOYEES_HEADERS, ...rows.map((row) => EMPLOYEES_HEADERS.map((header) => row[header] ?? ''))];

  await writeValues(workbookId, EMPLOYEES_TAB, values);
};

export default writeEmployeesBulk;
