import readTab from '#db/adapter/readTab.js';
import { EMPLOYEE_EXPENSES_TAB, EMPLOYEE_EXPENSES_HEADERS } from '#config/constants.js';
import { logger } from '#utils/logger.js';
import employeeExpensesCache from '#utils/caches/employeeExpensesCache.js';
import EmployeeExpense from '#models/EmployeeExpense.js';

const [employeeId, employeeName, activeThisPayPeriod, totalExpense] = EMPLOYEE_EXPENSES_HEADERS;

// Reads all rows from the EmployeeExpenses tab, cached for 5 minutes. Returns empty array if the tab doesn't exist yet.
const readEmployeeExpensesTab = async (workbookId: string): Promise<EmployeeExpense[]> => {
  const cached = employeeExpensesCache.get(workbookId);
  if (cached) return cached;

  logger.debug(`readEmployeeExpensesTab workbook=${workbookId}`);
  try {
    const rows = await readTab(workbookId, EMPLOYEE_EXPENSES_TAB);
    const expenses = rows.map((row) => ({
      employeeId: row[employeeId] as string,
      employeeName: row[employeeName] as string,
      activeThisPayPeriod: row[activeThisPayPeriod] === true || row[activeThisPayPeriod] === 'TRUE',
      totalExpense: row[totalExpense] !== '' && row[totalExpense] != null
        ? Number(row[totalExpense])
        : null,
    }));
    employeeExpensesCache.set(workbookId, expenses);
    return expenses;
  } catch {
    return [];
  }
};

export default readEmployeeExpensesTab;
