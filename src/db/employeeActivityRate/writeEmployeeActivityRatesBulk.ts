import writeValues from '#db/adapter/writeValues.js';
import mapEmployeeActivityRateRow from '#db/employeeActivityRate/mapEmployeeActivityRateRow.js';
import { EMPLOYEE_ACTIVITY_RATES_TAB, EMPLOYEE_ACTIVITY_RATES_HEADERS } from '#config/constants.js';
import EmployeeActivityRate from '#models/EmployeeActivityRate.js';

// Writes a full set of employee-activity rates to the given workbook's EmployeeActivityRates tab in one call —
// header row always included, even for an empty list. Assumes the tab already exists (see createTabsIfNotExists.js).
const writeEmployeeActivityRatesBulk = async (workbookId: string, employeeActivityRates: EmployeeActivityRate[]): Promise<void> => {
  const rows = employeeActivityRates.map(mapEmployeeActivityRateRow);
  const values = [
    EMPLOYEE_ACTIVITY_RATES_HEADERS,
    ...rows.map((row) => EMPLOYEE_ACTIVITY_RATES_HEADERS.map((header) => row[header] ?? '')),
  ];

  await writeValues(workbookId, EMPLOYEE_ACTIVITY_RATES_TAB, values);
};

export default writeEmployeeActivityRatesBulk;
