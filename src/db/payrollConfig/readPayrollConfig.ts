import readTabs from '#db/adapter/readTabs.js';
import PayrollConfig from '#models/PayrollConfig.js';
import mapEmployee from '#db/employee/mapEmployee.js';
import mapSupervisor from '#db/supervisor/mapSupervisor.js';
import mapActivity from '#db/activity/mapActivity.js';
import mapFundingSource from '#db/fundingSource/mapFundingSource.js';
import mapHoliday from '#db/holiday/mapHoliday.js';
import mapSettings from '#db/settings/mapSettings.js';
import {
  EMPLOYEES_TAB,
  ACTIVITIES_TAB,
  FUNDING_SOURCES_TAB,
  HOLIDAYS_TAB,
  SUPERVISORS_TAB,
  SETTINGS_TAB,
} from '#config/constants.js';
import { logger } from '#utils/logger.js';
import payrollConfigCache from '#utils/caches/payrollConfigCache.js';

const TAB_NAMES = {
  employees: EMPLOYEES_TAB,
  supervisors: SUPERVISORS_TAB,
  fundingSources: FUNDING_SOURCES_TAB,
  activities: ACTIVITIES_TAB,
  settings: SETTINGS_TAB,
  holidays: HOLIDAYS_TAB,
};

// Loads all config tabs (employees, activities, settings, etc.) in one batched call and caches the result for 5 minutes.
// Used by generateTimesheets and other services that need full client config in a single read.
const readPayrollConfig = async (payrollConfigFileId: string): Promise<PayrollConfig> => {
  logger.debug(`Loading payroll config from workbook: ${payrollConfigFileId}`);

  const cached = payrollConfigCache.get(payrollConfigFileId);
  if (cached) return cached;

  const [
    employeeRows,
    supervisorRows,
    fundingSourceRows,
    activityRows,
    settingsRows,
    holidayRows,
  ] = await readTabs(payrollConfigFileId, Object.values(TAB_NAMES));

  const settings = settingsRows.length > 0 ? mapSettings(settingsRows[0]) : null;
  if (!settings) throw new Error('Settings not found in Payroll Config');

  const config: PayrollConfig = {
    employees: employeeRows.map(mapEmployee),
    supervisors: supervisorRows.map(mapSupervisor),
    activities: activityRows.map(mapActivity),
    fundingSources: fundingSourceRows.map(mapFundingSource),
    holidays: holidayRows.map(mapHoliday),
    settings,
  };

  payrollConfigCache.set(payrollConfigFileId, config);
  return config;
};

export default readPayrollConfig;
