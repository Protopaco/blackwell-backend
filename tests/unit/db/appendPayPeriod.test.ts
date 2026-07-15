import { describe, it, expect, vi } from 'vitest';
import PayPeriod from '#models/PayPeriod.js';

const payPeriod: PayPeriod = {
  payPeriodId: 'p1',
  payPeriodName: '06/01 - 06/14',
  status: 'Pending',
  startDate: '2026-06-01',
  endDate: '2026-06-14',
  createdDate: '2026-05-28',
  payrollReportFileId: '',
};

vi.mock('#db/adapter/appendRow.js', () => ({ default: vi.fn().mockResolvedValue(undefined) }));
vi.mock('#db/adapter/createTabIfNotExists.js', () => ({ default: vi.fn().mockResolvedValue(undefined) }));
vi.mock('#db/adapter/writeHeaderRow.js', () => ({ default: vi.fn().mockResolvedValue(undefined) }));

import appendPayPeriod from '#db/payPeriod/appendPayPeriod.js';
import payPeriodsCache from '#utils/caches/payPeriodsCache.js';

describe('appendPayPeriod', () => {
  it('invalidates the cache entry for the written registry', async () => {
    payPeriodsCache.set('registry-1', [payPeriod]);

    await appendPayPeriod('registry-1', payPeriod);

    expect(payPeriodsCache.get('registry-1')).toBeNull();
  });

  it('does not affect the cache entry for a different registry', async () => {
    payPeriodsCache.set('registry-2', [payPeriod]);

    await appendPayPeriod('registry-1', payPeriod);

    expect(payPeriodsCache.get('registry-2')).toEqual([payPeriod]);
  });
});
