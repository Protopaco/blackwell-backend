import createTabIfNotExists from '#db/adapter/createTabIfNotExists.js';
import writeValues from '#db/adapter/writeValues.js';
import EmployeeExpense from '#models/EmployeeExpense.js';
import { EMPLOYEE_EXPENSES_TAB, EMPLOYEE_EXPENSES_HEADERS } from '#config/constants.js';
import { logger } from '#utils/logger.js';

// Overwrites the EmployeeExpenses tab with the current expense data. No history — safe to call repeatedly.
const writeEmployeeExpensesTab = async (
  workbookId: string,
  expenses: EmployeeExpense[],
): Promise<void> => {
  logger.debug(`writeEmployeeExpensesTab workbook=${workbookId} count=${expenses.length}`);
  await createTabIfNotExists(workbookId, EMPLOYEE_EXPENSES_TAB);
  const rows: unknown[][] = [
    EMPLOYEE_EXPENSES_HEADERS,
    ...expenses.map((expense) => [
      expense.employeeId,
      expense.employeeName,
      expense.activeThisPayPeriod,
      expense.totalExpense ?? '',
    ]),
  ];
  await writeValues(workbookId, EMPLOYEE_EXPENSES_TAB, rows);
};

export default writeEmployeeExpensesTab;
