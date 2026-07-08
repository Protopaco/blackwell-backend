import { describe, it, expect, vi } from 'vitest';

vi.mock('#db/adapter/createTabIfNotExists.js', () => ({ default: vi.fn().mockResolvedValue(undefined) }));
vi.mock('#db/adapter/clearTabContent.js', () => ({ default: vi.fn().mockResolvedValue(undefined) }));
vi.mock('#db/adapter/writeValues.js', () => ({ default: vi.fn().mockResolvedValue(undefined) }));
vi.mock('#db/adapter/listTabNames.js', () => ({ default: vi.fn().mockResolvedValue([]) }));
vi.mock('#db/adapter/reorderTabs.js', () => ({ default: vi.fn().mockResolvedValue(undefined) }));

import writeAdditionalExpensesTab from '#db/payrollReport/writeAdditionalExpensesTab.js';
import additionalExpensesCache from '#utils/caches/additionalExpensesCache.js';

describe('writeAdditionalExpensesTab', () => {
  it('invalidates the cache entry for the written workbook', async () => {
    additionalExpensesCache.set('workbook-additional-1', [{ expenseName: 'Stale', amount: 1 }]);

    await writeAdditionalExpensesTab('workbook-additional-1', []);

    expect(additionalExpensesCache.get('workbook-additional-1')).toBeNull();
  });

  it('does not affect the cache entry for a different workbook', async () => {
    additionalExpensesCache.set('workbook-additional-2', [{ expenseName: 'Untouched', amount: 5 }]);

    await writeAdditionalExpensesTab('workbook-additional-1', []);

    expect(additionalExpensesCache.get('workbook-additional-2')).toEqual([{ expenseName: 'Untouched', amount: 5 }]);
  });
});
