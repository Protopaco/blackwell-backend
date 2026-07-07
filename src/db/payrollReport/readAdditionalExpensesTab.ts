import readTab from '#db/adapter/readTab.js';
import { ADDITIONAL_EXPENSES_TAB, ADDITIONAL_EXPENSES_HEADERS } from '#config/constants.js';
import { logger } from '#utils/logger.js';
import additionalExpensesCache from '#utils/caches/additionalExpensesCache.js';
import AdditionalExpense from '#models/AdditionalExpense.js';

const [expenseName, amount] = ADDITIONAL_EXPENSES_HEADERS;

// Reads all rows from the AdditionalExpenses tab, cached for 5 minutes. Returns empty array if the tab doesn't exist yet.
const readAdditionalExpensesTab = async (workbookId: string): Promise<AdditionalExpense[]> => {
  const cached = additionalExpensesCache.get(workbookId);
  if (cached) return cached;

  logger.debug(`readAdditionalExpensesTab workbook=${workbookId}`);
  try {
    const rows = await readTab(workbookId, ADDITIONAL_EXPENSES_TAB);
    const expenses = rows.map((row) => ({
      expenseName: row[expenseName] as string,
      amount: Number(row[amount]),
    }));
    additionalExpensesCache.set(workbookId, expenses);
    return expenses;
  } catch {
    return [];
  }
};

export default readAdditionalExpensesTab;
