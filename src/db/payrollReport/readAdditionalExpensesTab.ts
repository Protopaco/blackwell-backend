import readTab from '#db/adapter/readTab.js';
import AdditionalExpense from '#models/AdditionalExpense.js';
import { ADDITIONAL_EXPENSES_TAB, ADDITIONAL_EXPENSES_HEADERS } from '#config/constants.js';
import { logger } from '#utils/logger.js';

const [expenseName, amount] = ADDITIONAL_EXPENSES_HEADERS;

// Reads all rows from the AdditionalExpenses tab. Returns empty array if the tab doesn't exist yet.
const readAdditionalExpensesTab = async (workbookId: string): Promise<AdditionalExpense[]> => {
  logger.debug(`readAdditionalExpensesTab workbook=${workbookId}`);
  try {
    const rows = await readTab(workbookId, ADDITIONAL_EXPENSES_TAB);
    return rows.map((row) => ({
      expenseName: row[expenseName] as string,
      amount: Number(row[amount]),
    }));
  } catch {
    return [];
  }
};

export default readAdditionalExpensesTab;
