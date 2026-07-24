import { describe, it, expect, vi, beforeEach } from 'vitest';
import PayPeriod from '#models/PayPeriod.js';
import Activity from '#models/Activity.js';

const { pendingPayPeriod, openPayPeriod, snapshotActivity } = vi.hoisted(() => ({
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
  snapshotActivity: {
    activityId: 'a1',
    activityName: 'Job Coaching',
    trackSeparately: false,
    payrollCategory: 'Regular',
    fundingSources: [{ fundingSourceName: 'Federal Grant', percentage: 100 }],
    payRate: 'HourlyPayRate1',
    flatRateAmount: 0,
  } as Activity,
}));

vi.mock('#services/payPeriod/getPayPeriodById.js', () => ({ default: vi.fn() }));
vi.mock('#db/activity/readActivityById.js', () => ({ default: vi.fn().mockResolvedValue(snapshotActivity) }));
vi.mock('#db/activity/deleteActivityRow.js', () => ({ default: vi.fn().mockResolvedValue(undefined) }));
vi.mock('#utils/caches/payPeriodConfigSnapshotCache.js', () => ({ default: { delete: vi.fn() } }));

import removeActivityFromPayPeriod from '#services/payPeriod/removeActivityFromPayPeriod.js';
import getPayPeriodById from '#services/payPeriod/getPayPeriodById.js';
import readActivityById from '#db/activity/readActivityById.js';
import deleteActivityRow from '#db/activity/deleteActivityRow.js';
import payPeriodConfigSnapshotCache from '#utils/caches/payPeriodConfigSnapshotCache.js';

describe('removeActivityFromPayPeriod', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getPayPeriodById).mockResolvedValue(pendingPayPeriod);
    vi.mocked(readActivityById).mockResolvedValue(snapshotActivity);
  });

  it('deletes the activity row and invalidates the cache when the pay period is still Pending', async () => {
    await removeActivityFromPayPeriod('c1', 'p1', 'a1');

    expect(deleteActivityRow).toHaveBeenCalledWith('report-1', 'a1');
    expect(payPeriodConfigSnapshotCache.delete).toHaveBeenCalledWith('report-1');
  });

  it('throws and does not delete when a timesheet has already been generated', async () => {
    vi.mocked(getPayPeriodById).mockResolvedValue(openPayPeriod);

    await expect(removeActivityFromPayPeriod('c1', 'p1', 'a1')).rejects.toThrow('already been generated');
    expect(deleteActivityRow).not.toHaveBeenCalled();
  });

  it('throws when the activity is not found on this pay period', async () => {
    vi.mocked(readActivityById).mockResolvedValueOnce(null);

    await expect(removeActivityFromPayPeriod('c1', 'p1', 'unknown')).rejects.toThrow('Activity not found on this pay period: unknown');
  });
});
