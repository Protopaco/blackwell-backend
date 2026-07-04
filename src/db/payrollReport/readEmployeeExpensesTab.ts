import readTab from '#db/adapter/readTab.js';
import EmployeeExpense from '#models/EmployeeExpense.js';
import { logger } from '#utils/logger.js';

const TAB_NAME = 'EmployeeExpenses';

// Reads all rows from the EmployeeExpenses tab. Returns empty array if the tab doesn't exist yet.
const readEmployeeExpensesTab = async (workbookId: string): Promise<EmployeeExpense[]> => {
  logger.debug(`readEmployeeExpensesTab workbook=${workbookId}`);
  try {
    const rows = await readTab(workbookId, TAB_NAME);
    return rows.map((row) => ({
      employeeId: row['employeeId'] as string,
      employeeName: row['employeeName'] as string,
      activeThisPayPeriod: row['activeThisPayPeriod'] === true || row['activeThisPayPeriod'] === 'TRUE',
      totalExpense: row['totalExpense'] !== '' && row['totalExpense'] != null
        ? Number(row['totalExpense'])
        : null,
    }));
  } catch {
    return [];
  }
};

export default readEmployeeExpensesTab;
