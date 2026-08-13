import { describe, it, expect, vi } from 'vitest';

vi.mock('#db/adapter/createTabIfNotExists.js', () => ({ default: vi.fn().mockResolvedValue(undefined) }));
vi.mock('#db/adapter/clearTabContent.js', () => ({ default: vi.fn().mockResolvedValue(undefined) }));
vi.mock('#db/adapter/writeValues.js', () => ({ default: vi.fn().mockResolvedValue(undefined) }));
vi.mock('#db/adapter/listTabNames.js', () => ({ default: vi.fn().mockResolvedValue([]) }));
vi.mock('#db/adapter/reorderTabs.js', () => ({ default: vi.fn().mockResolvedValue(undefined) }));

import writeEmployeeExpensesTab from '#db/payrollReport/writeEmployeeExpensesTab.js';
import employeeExpensesCache from '#utils/caches/employeeExpensesCache.js';

describe('writeEmployeeExpensesTab', () => {
  it('invalidates the cache entry for the written workbook', async () => {
    employeeExpensesCache.set('workbook-employee-1', [
      { employeeId: 'e1', employeeName: 'Stale', wageExpense: 1, taxExpense: null },
    ]);

    await writeEmployeeExpensesTab('workbook-employee-1', []);

    expect(employeeExpensesCache.get('workbook-employee-1')).toBeNull();
  });

  it('does not affect the cache entry for a different workbook', async () => {
    employeeExpensesCache.set('workbook-employee-2', [
      { employeeId: 'e2', employeeName: 'Untouched', wageExpense: 5, taxExpense: null },
    ]);

    await writeEmployeeExpensesTab('workbook-employee-1', []);

    expect(employeeExpensesCache.get('workbook-employee-2')).toEqual([
      { employeeId: 'e2', employeeName: 'Untouched', wageExpense: 5, taxExpense: null },
    ]);
  });
});
