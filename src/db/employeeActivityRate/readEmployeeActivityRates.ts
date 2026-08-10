import readTab from '#db/adapter/readTab.js';
import { EMPLOYEE_ACTIVITY_RATES_TAB } from '#config/constants.js';
import EmployeeActivityRate from '#models/EmployeeActivityRate.js';
import mapEmployeeActivityRate from '#db/employeeActivityRate/mapEmployeeActivityRate.js';

// Reads all employee-activity rates from the EmployeeActivityRates tab of a client's payroll config file.
const readEmployeeActivityRates = async (workbookId: string): Promise<EmployeeActivityRate[]> => {
  const rows = await readTab(workbookId, EMPLOYEE_ACTIVITY_RATES_TAB);
  return rows.map(mapEmployeeActivityRate);
};

export default readEmployeeActivityRates;
