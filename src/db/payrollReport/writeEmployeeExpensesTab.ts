import createTabIfNotExists from '#db/adapter/createTabIfNotExists.js';
import writeValues from '#db/adapter/writeValues.js';
import EmployeeExpense from '#models/EmployeeExpense.js';
import { logger } from '#utils/logger.js';

const TAB_NAME = 'EmployeeExpenses';
const HEADERS = ['employeeId', 'employeeName', 'activeThisPayPeriod', 'totalExpense'];

// Overwrites the EmployeeExpenses tab with the current expense data. No history — safe to call repeatedly.
const writeEmployeeExpensesTab = async (
  workbookId: string,
  expenses: EmployeeExpense[],
): Promise<void> => {
  logger.debug(`writeEmployeeExpensesTab workbook=${workbookId} count=${expenses.length}`);
  await createTabIfNotExists(workbookId, TAB_NAME);
  const rows: unknown[][] = [
    HEADERS,
    ...expenses.map((expense) => [
      expense.employeeId,
      expense.employeeName,
      expense.activeThisPayPeriod,
      expense.totalExpense ?? '',
    ]),
  ];
  await writeValues(workbookId, TAB_NAME, rows);
};

export default writeEmployeeExpensesTab;
