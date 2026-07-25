import createOAuthWorkbook from '#db/adapter/createOAuthWorkbook.js';
import createTabsIfNotExists from '#db/adapter/createTabsIfNotExists.js';
import readPayrollConfig from '#db/payrollConfig/readPayrollConfig.js';
import writeEmployeesBulk from '#db/employee/writeEmployeesBulk.js';
import writeActivitiesBulk from '#db/activity/writeActivitiesBulk.js';
import writeFundingSourcesBulk from '#db/fundingSource/writeFundingSourcesBulk.js';
import writeHolidaysBulk from '#db/holiday/writeHolidaysBulk.js';
import writeSettings from '#db/settings/writeSettings.js';
import Client from '#models/Client.js';
import PayPeriod from '#models/PayPeriod.js';
import { EmployeeStatus } from '#models/EmployeeStatus.js';
import {
  EMPLOYEES_TAB,
  ACTIVITIES_TAB,
  FUNDING_SOURCES_TAB,
  HOLIDAYS_TAB,
  SETTINGS_TAB,
} from '#config/constants.js';
import { logger } from '#utils/logger.js';

// Creates the payroll report workbook for a newly-created pay period and seeds it with a point-in-time
// copy of the client's PayrollConfig: Employees (active only), Activities, FundingSources, Holidays,
// and Settings, each mirroring its PayrollConfig counterpart's columns exactly. All five tabs are
// created even when a category has zero rows for this client. Returns the new workbook's file ID.
const createPayPeriodConfigSnapshot = async (client: Client, payPeriod: PayPeriod): Promise<string> => {
  logger.info(`createPayPeriodConfigSnapshot clientId=${client.clientId} payPeriodName=${payPeriod.payPeriodName}`);

  const payrollConfig = await readPayrollConfig(client.payrollConfigFileId);

  const reportFileId = await createOAuthWorkbook(payPeriod.payPeriodName, client.payrollReportFolderId);

  await createTabsIfNotExists(reportFileId, [
    EMPLOYEES_TAB,
    ACTIVITIES_TAB,
    FUNDING_SOURCES_TAB,
    HOLIDAYS_TAB,
    SETTINGS_TAB,
  ]);

  const activeEmployees = payrollConfig.employees.filter(
    (employee) => employee.status === EmployeeStatus.Active,
  );

  await writeEmployeesBulk(reportFileId, activeEmployees);
  await writeActivitiesBulk(reportFileId, payrollConfig.activities);
  await writeFundingSourcesBulk(reportFileId, payrollConfig.fundingSources);
  await writeHolidaysBulk(reportFileId, payrollConfig.holidays);
  await writeSettings(reportFileId, payrollConfig.settings);

  logger.info(`createPayPeriodConfigSnapshot: report workbook created ${reportFileId}`);
  return reportFileId;
};

export default createPayPeriodConfigSnapshot;
