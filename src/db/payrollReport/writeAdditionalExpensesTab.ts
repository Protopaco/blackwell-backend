import createTabIfNotExists from '#db/adapter/createTabIfNotExists.js';
import writeValues from '#db/adapter/writeValues.js';
import AdditionalExpense from '#models/AdditionalExpense.js';
import { ADDITIONAL_EXPENSES_TAB, ADDITIONAL_EXPENSES_HEADERS } from '#config/constants.js';
import { logger } from '#utils/logger.js';

// Overwrites the AdditionalExpenses tab with the current expense data. No history — safe to call repeatedly.
const writeAdditionalExpensesTab = async (
  workbookId: string,
  expenses: AdditionalExpense[],
): Promise<void> => {
  logger.debug(`writeAdditionalExpensesTab workbook=${workbookId} count=${expenses.length}`);
  await createTabIfNotExists(workbookId, ADDITIONAL_EXPENSES_TAB);
  const rows: unknown[][] = [
    ADDITIONAL_EXPENSES_HEADERS,
    ...expenses.map((expense) => [expense.expenseName, expense.amount]),
  ];
  await writeValues(workbookId, ADDITIONAL_EXPENSES_TAB, rows);
};

export default writeAdditionalExpensesTab;
