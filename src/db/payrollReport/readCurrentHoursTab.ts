import readTab from '#db/adapter/readTab.js';
import tabExists from '#db/adapter/tabExists.js';
import { CURRENT_HOURS_TAB, HOURS_HEADERS } from '#config/constants.js';
import { logger } from '#utils/logger.js';
import currentHoursCache from '#utils/caches/currentHoursCache.js';
import PayrollReportHoursRow from '#models/PayrollReportHoursRow.js';

const [generatedAt, employeeId, employeeName, activityName, payrollCategory, date, isHoliday, hours] = HOURS_HEADERS;

// Reads all rows from current_hours tab, cached for 5 minutes. Returns null if the tab doesn't exist yet
// (payroll report not generated), or an empty array if it exists but has no rows.
const readCurrentHoursTab = async (workbookId: string): Promise<PayrollReportHoursRow[] | null> => {
  const cached = currentHoursCache.get(workbookId);
  if (cached) return cached;

  logger.debug(`readCurrentHoursTab workbook=${workbookId}`);

  const exists = await tabExists(workbookId, CURRENT_HOURS_TAB);
  if (!exists) return null;

  const rows = await readTab(workbookId, CURRENT_HOURS_TAB);
  const hoursRows = rows.map((row) => ({
    GeneratedAt: row[generatedAt] as string,
    EmployeeId: row[employeeId] as string,
    EmployeeName: row[employeeName] as string,
    ActivityName: row[activityName] as string,
    PayrollCategory: row[payrollCategory] as string,
    Date: row[date] as string,
    IsHoliday: row[isHoliday] as string,
    Hours: Number(row[hours]),
  }));
  currentHoursCache.set(workbookId, hoursRows);
  return hoursRows;
};

export default readCurrentHoursTab;
