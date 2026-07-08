import readTab from '#db/adapter/readTab.js';
import tabExists from '#db/adapter/tabExists.js';
import { ADDITIONAL_EXPENSES_TAB, ADDITIONAL_EXPENSES_HEADERS } from '#config/constants.js';
import { logger } from '#utils/logger.js';
import additionalExpensesCache from '#utils/caches/additionalExpensesCache.js';
import AdditionalExpense from '#models/AdditionalExpense.js';

const [expenseName, amount] = ADDITIONAL_EXPENSES_HEADERS;

// Reads all rows from the AdditionalExpenses tab, cached for 5 minutes. Returns null if the tab doesn't
// exist yet, or an empty array if it exists but has no rows.
const readAdditionalExpensesTab = async (workbookId: string): Promise<AdditionalExpense[] | null> => {
  const cached = additionalExpensesCache.get(workbookId);
  if (cached) return cached;

  logger.debug(`readAdditionalExpensesTab workbook=${workbookId}`);

  const exists = await tabExists(workbookId, ADDITIONAL_EXPENSES_TAB);
  if (!exists) return null;

  const rows = await readTab(workbookId, ADDITIONAL_EXPENSES_TAB);
  const expenses = rows.map((row) => ({
    expenseName: row[expenseName] as string,
    amount: Number(row[amount]),
  }));
  additionalExpensesCache.set(workbookId, expenses);
  return expenses;
};

export default readAdditionalExpensesTab;
