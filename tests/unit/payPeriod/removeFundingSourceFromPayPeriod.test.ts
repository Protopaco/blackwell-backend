import { describe, it, expect, vi, beforeEach } from 'vitest';
import PayPeriod from '#models/PayPeriod.js';
import FundingSource from '#models/FundingSource.js';
import Activity from '#models/Activity.js';

const { pendingPayPeriod, openPayPeriod, snapshotFundingSource } = vi.hoisted(() => ({
  pendingPayPeriod: {
    payPeriodId: 'p1',
    payPeriodName: '06/01 - 06/14',
    status: 'Pending',
    startDate: '2026-06-01',
    endDate: '2026-06-14',
    createdDate: '2026-05-28',
    payrollReportFileId: 'report-1',
  } as PayPeriod,
  openPayPeriod: {
    payPeriodId: 'p1',
    payPeriodName: '06/01 - 06/14',
    status: 'Open',
    startDate: '2026-06-01',
    endDate: '2026-06-14',
    createdDate: '2026-05-28',
    payrollReportFileId: 'report-1',
  } as PayPeriod,
  snapshotFundingSource: {
    fundingSourceId: 'fs1',
    fundingSourceName: 'Federal Grant',
    fundingSourceCode: 'FG-100',
  } as FundingSource,
}));

vi.mock('#services/payPeriod/getPayPeriodById.js', () => ({ default: vi.fn() }));
vi.mock('#db/fundingSource/readFundingSourceById.js', () => ({ default: vi.fn().mockResolvedValue(snapshotFundingSource) }));
vi.mock('#db/fundingSource/deleteFundingSourceRow.js', () => ({ default: vi.fn().mockResolvedValue(undefined) }));
vi.mock('#db/activity/readActivities.js', () => ({ default: vi.fn().mockResolvedValue([]) }));
vi.mock('#utils/caches/payPeriodConfigSnapshotCache.js', () => ({ default: { delete: vi.fn() } }));

import removeFundingSourceFromPayPeriod from '#services/payPeriod/removeFundingSourceFromPayPeriod.js';
import getPayPeriodById from '#services/payPeriod/getPayPeriodById.js';
import readFundingSourceById from '#db/fundingSource/readFundingSourceById.js';
import deleteFundingSourceRow from '#db/fundingSource/deleteFundingSourceRow.js';
import readActivities from '#db/activity/readActivities.js';
import payPeriodConfigSnapshotCache from '#utils/caches/payPeriodConfigSnapshotCache.js';

describe('removeFundingSourceFromPayPeriod', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getPayPeriodById).mockResolvedValue(pendingPayPeriod);
    vi.mocked(readFundingSourceById).mockResolvedValue(snapshotFundingSource);
    vi.mocked(readActivities).mockResolvedValue([]);
  });

  it('deletes the funding source row and invalidates the cache when unreferenced', async () => {
    await removeFundingSourceFromPayPeriod('c1', 'p1', 'fs1');

    expect(deleteFundingSourceRow).toHaveBeenCalledWith('report-1', 'fs1');
    expect(payPeriodConfigSnapshotCache.delete).toHaveBeenCalledWith('report-1');
  });

  it('throws and does not delete when a timesheet has already been generated', async () => {
    vi.mocked(getPayPeriodById).mockResolvedValue(openPayPeriod);

    await expect(removeFundingSourceFromPayPeriod('c1', 'p1', 'fs1')).rejects.toThrow('already been generated');
    expect(deleteFundingSourceRow).not.toHaveBeenCalled();
  });

  it('throws when the funding source is not found on this pay period', async () => {
    vi.mocked(readFundingSourceById).mockResolvedValueOnce(null);

    await expect(removeFundingSourceFromPayPeriod('c1', 'p1', 'unknown')).rejects.toThrow('Funding source not found on this pay period: unknown');
  });

  it('throws when still referenced by an activity on this pay period', async () => {
    vi.mocked(readActivities).mockResolvedValueOnce([
      {
        activityId: 'a1',
        activityName: 'Job Coaching',
        trackSeparately: false,
        payrollCategory: 'Regular',
        fundingSources: [{ fundingSourceName: 'Federal Grant', percentage: 100 }],
        payRate: 'HourlyPayRate1',
        flatRateAmount: 0,
      } as Activity,
    ]);

    await expect(removeFundingSourceFromPayPeriod('c1', 'p1', 'fs1')).rejects.toThrow('still referenced by activities');
    expect(deleteFundingSourceRow).not.toHaveBeenCalled();
  });
});
