import { createCache } from '#utils/cache.js';
import { CACHE_TTL_MEDIUM_MS } from '#config/constants.js';
import EmployeeExpense from '#models/EmployeeExpense.js';

// Shared cache instance for readEmployeeExpensesTab, keyed by workbookId. Invalidated by writeEmployeeExpensesTab after a successful write.
const employeeExpensesCache = createCache<EmployeeExpense[]>(CACHE_TTL_MEDIUM_MS);

export default employeeExpensesCache;
