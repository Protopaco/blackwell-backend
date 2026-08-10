import appendRow from '#db/adapter/appendRow.js';
import { EMPLOYEE_ACTIVITY_RATES_TAB, EMPLOYEE_ACTIVITY_RATES_HEADERS } from '#config/constants.js';
import EmployeeActivityRate from '#models/EmployeeActivityRate.js';
import mapEmployeeActivityRateRow from '#db/employeeActivityRate/mapEmployeeActivityRateRow.js';

// Appends a new employee-activity-rate row to the EmployeeActivityRates tab.
const appendEmployeeActivityRate = async (workbookId: string, employeeActivityRate: EmployeeActivityRate): Promise<void> => {
  const row = mapEmployeeActivityRateRow(employeeActivityRate);

  await appendRow(workbookId, EMPLOYEE_ACTIVITY_RATES_TAB, EMPLOYEE_ACTIVITY_RATES_HEADERS, row);
};

export default appendEmployeeActivityRate;
