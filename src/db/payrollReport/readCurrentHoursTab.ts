import readTab from '#db/adapter/readTab.js';
import PayrollReportHoursRow from '#models/PayrollReportHoursRow.js';
import { CURRENT_HOURS_TAB, HOURS_HEADERS } from '#config/constants.js';
import { logger } from '#utils/logger.js';

const [generatedAt, employeeId, employeeName, activityName, payrollCategory, date, isHoliday, hours] = HOURS_HEADERS;

// Reads all rows from current_hours tab. Returns empty array if the tab doesn't exist yet.
const readCurrentHoursTab = async (workbookId: string): Promise<PayrollReportHoursRow[]> => {
  logger.debug(`readCurrentHoursTab workbook=${workbookId}`);
  try {
    const rows = await readTab(workbookId, CURRENT_HOURS_TAB);
    return rows.map((row) => ({
      GeneratedAt: row[generatedAt] as string,
      EmployeeId: row[employeeId] as string,
      EmployeeName: row[employeeName] as string,
      ActivityName: row[activityName] as string,
      PayrollCategory: row[payrollCategory] as string,
      Date: row[date] as string,
      IsHoliday: row[isHoliday] as string,
      Hours: Number(row[hours]),
    }));
  } catch {
    return [];
  }
};

export default readCurrentHoursTab;
