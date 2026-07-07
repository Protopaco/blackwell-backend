import { createCache } from '#utils/cache.js';
import { CACHE_TTL_MEDIUM_MS } from '#config/constants.js';
import AdditionalExpense from '#models/AdditionalExpense.js';

// Shared cache instance for readAdditionalExpensesTab, keyed by workbookId. Invalidated by writeAdditionalExpensesTab after a successful write.
const additionalExpensesCache = createCache<AdditionalExpense[]>(CACHE_TTL_MEDIUM_MS);

export default additionalExpensesCache;
