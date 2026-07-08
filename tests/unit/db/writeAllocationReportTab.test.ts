import { describe, it, expect, vi } from 'vitest';

vi.mock('#db/adapter/createTabIfNotExists.js', () => ({ default: vi.fn().mockResolvedValue(undefined) }));
vi.mock('#db/adapter/clearTabContent.js', () => ({ default: vi.fn().mockResolvedValue(undefined) }));
vi.mock('#db/adapter/writeValues.js', () => ({ default: vi.fn().mockResolvedValue(undefined) }));
vi.mock('#db/adapter/listTabNames.js', () => ({ default: vi.fn().mockResolvedValue([]) }));
vi.mock('#db/adapter/reorderTabs.js', () => ({ default: vi.fn().mockResolvedValue(undefined) }));

import writeAllocationReportTab from '#db/payrollReport/writeAllocationReportTab.js';
import allocationReportCache from '#utils/caches/allocationReportCache.js';

describe('writeAllocationReportTab', () => {
  it('invalidates the cache entry for the written workbook', async () => {
    allocationReportCache.set('workbook-allocation-1', [
      { fundingSourceName: 'Stale Grant', wagesAllocation: 1, additionalExpenses: 0, total: 1 },
    ]);

    await writeAllocationReportTab('workbook-allocation-1', []);

    expect(allocationReportCache.get('workbook-allocation-1')).toBeNull();
  });

  it('does not affect the cache entry for a different workbook', async () => {
    allocationReportCache.set('workbook-allocation-2', [
      { fundingSourceName: 'Untouched Grant', wagesAllocation: 5, additionalExpenses: 0, total: 5 },
    ]);

    await writeAllocationReportTab('workbook-allocation-1', []);

    expect(allocationReportCache.get('workbook-allocation-2')).toEqual([
      { fundingSourceName: 'Untouched Grant', wagesAllocation: 5, additionalExpenses: 0, total: 5 },
    ]);
  });
});
