import { describe, it, expect, vi } from 'vitest';
import PayPeriod from '#models/PayPeriod.js';

const { existingPayPeriod } = vi.hoisted(() => ({
  existingPayPeriod: {
    payPeriodId: 'p1',
    payPeriodName: '06/01 - 06/14',
    status: 'Open',
    startDate: '2026-06-01',
    endDate: '2026-06-14',
    createdDate: '2026-05-28',
    payrollReportFileId: '',
  } as PayPeriod,
}));

vi.mock('#db/adapter/writeTab.js', () => ({ default: vi.fn().mockResolvedValue(undefined) }));
vi.mock('#db/payPeriod/readPayPeriods.js', () => ({ default: vi.fn().mockResolvedValue([existingPayPeriod]) }));

import writePayPeriod from '#db/payPeriod/writePayPeriod.js';
import payPeriodsCache from '#utils/caches/payPeriodsCache.js';

describe('writePayPeriod', () => {
  it('invalidates the cache entry for the written registry', async () => {
    payPeriodsCache.set('registry-1', [existingPayPeriod]);

    await writePayPeriod('registry-1', { ...existingPayPeriod, status: 'Processed' });

    expect(payPeriodsCache.get('registry-1')).toBeNull();
  });

  it('does not affect the cache entry for a different registry', async () => {
    payPeriodsCache.set('registry-2', [existingPayPeriod]);

    await writePayPeriod('registry-1', { ...existingPayPeriod, status: 'Processed' });

    expect(payPeriodsCache.get('registry-2')).toEqual([existingPayPeriod]);
  });
});
