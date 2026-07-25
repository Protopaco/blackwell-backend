import { describe, it, expect, vi, beforeEach } from 'vitest';
import PayPeriod from '#models/PayPeriod.js';
import PayPeriodConfigSnapshot from '#models/PayPeriodConfigSnapshot.js';

const { payPeriod, snapshot } = vi.hoisted(() => ({
  payPeriod: {
    payPeriodId: 'p1',
    payPeriodName: '06/01 - 06/14',
    status: 'Pending',
    startDate: '2026-06-01',
    endDate: '2026-06-14',
    createdDate: '2026-05-28',
    payrollReportFileId: 'report-1',
  } as PayPeriod,
  snapshot: {
    employees: [],
    activities: [],
    fundingSources: [],
    holidays: [],
    settings: { timeInputMethod: 'TotalHours', payPeriodInterval: 'Bi-Weekly', payPeriodStartDate: '2026-06-01' },
  } as PayPeriodConfigSnapshot,
}));

vi.mock('#services/payPeriod/getPayPeriodById.js', () => ({ default: vi.fn().mockResolvedValue(payPeriod) }));
vi.mock('#db/payrollReport/readPayPeriodConfigSnapshot.js', () => ({ default: vi.fn().mockResolvedValue(snapshot) }));

import getPayPeriodConfig from '#services/payPeriod/getPayPeriodConfig.js';
import getPayPeriodById from '#services/payPeriod/getPayPeriodById.js';
import readPayPeriodConfigSnapshot from '#db/payrollReport/readPayPeriodConfigSnapshot.js';

describe('getPayPeriodConfig', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getPayPeriodById).mockResolvedValue(payPeriod);
    vi.mocked(readPayPeriodConfigSnapshot).mockResolvedValue(snapshot);
  });

  it('resolves the pay period, then reads its config snapshot by report file ID', async () => {
    const result = await getPayPeriodConfig('c1', 'p1');

    expect(getPayPeriodById).toHaveBeenCalledWith('c1', 'p1');
    expect(readPayPeriodConfigSnapshot).toHaveBeenCalledWith('report-1');
    expect(result).toBe(snapshot);
  });
});
