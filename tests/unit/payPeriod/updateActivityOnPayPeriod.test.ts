import { describe, it, expect, vi, beforeEach } from 'vitest';
import PayPeriod from '#models/PayPeriod.js';
import Activity from '#models/Activity.js';
import FundingSource from '#models/FundingSource.js';

const { pendingPayPeriod, openPayPeriod, processedPayPeriod, allocatedPayPeriod, existingActivity, snapshotFundingSources } = vi.hoisted(() => {
  const basePayPeriod = {
    payPeriodId: 'p1',
    payPeriodName: '06/01 - 06/14',
    startDate: '2026-06-01',
    endDate: '2026-06-14',
    createdDate: '2026-05-28',
    payrollReportFileId: 'report-1',
  };
  return {
    pendingPayPeriod: { ...basePayPeriod, status: 'Pending' } as PayPeriod,
    openPayPeriod: { ...basePayPeriod, status: 'Open' } as PayPeriod,
    processedPayPeriod: { ...basePayPeriod, status: 'Processed' } as PayPeriod,
    allocatedPayPeriod: { ...basePayPeriod, status: 'Allocated' } as PayPeriod,
    existingActivity: {
      activityId: 'a1',
      activityName: 'Job Coaching',
      trackSeparately: false,
      payrollCategory: 'Regular',
      fundingSources: [{ fundingSourceName: 'Federal Grant', percentage: 100 }],
      payRate: 'HourlyPayRate1',
      flatRateAmount: 0,
    } as Activity,
    snapshotFundingSources: [
      { fundingSourceId: 'fs1', fundingSourceName: 'Federal Grant' },
      { fundingSourceId: 'fs2', fundingSourceName: 'State Grant' },
    ] as FundingSource[],
  };
});

vi.mock('#services/payPeriod/getPayPeriodById.js', () => ({ default: vi.fn() }));
vi.mock('#db/activity/readActivityById.js', () => ({ default: vi.fn().mockResolvedValue(existingActivity) }));
vi.mock('#db/activity/writeActivities.js', () => ({ default: vi.fn().mockResolvedValue(undefined) }));
vi.mock('#db/fundingSource/readFundingSources.js', () => ({ default: vi.fn().mockResolvedValue(snapshotFundingSources) }));
vi.mock('#utils/caches/payPeriodConfigSnapshotCache.js', () => ({ default: { delete: vi.fn() } }));

import updateActivityOnPayPeriod from '#services/payPeriod/updateActivityOnPayPeriod.js';
import getPayPeriodById from '#services/payPeriod/getPayPeriodById.js';
import readActivityById from '#db/activity/readActivityById.js';
import writeActivities from '#db/activity/writeActivities.js';
import payPeriodConfigSnapshotCache from '#utils/caches/payPeriodConfigSnapshotCache.js';

describe('updateActivityOnPayPeriod', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getPayPeriodById).mockResolvedValue(pendingPayPeriod);
    vi.mocked(readActivityById).mockResolvedValue(existingActivity);
  });

  it('allows a structural field change while the pay period is still Pending', async () => {
    const updated = { ...existingActivity, activityName: 'Job Coaching (Renamed)' };

    await updateActivityOnPayPeriod('c1', 'p1', updated);

    expect(writeActivities).toHaveBeenCalledWith('report-1', updated);
    expect(payPeriodConfigSnapshotCache.delete).toHaveBeenCalledWith('report-1');
  });

  it('throws on a structural field change once a timesheet has been generated (status Open)', async () => {
    vi.mocked(getPayPeriodById).mockResolvedValue(openPayPeriod);
    const updated = { ...existingActivity, activityName: 'Job Coaching (Renamed)' };

    await expect(updateActivityOnPayPeriod('c1', 'p1', updated)).rejects.toThrow('already been generated');
    expect(writeActivities).not.toHaveBeenCalled();
  });

  it('allows a funding source percentage change while status is Processed', async () => {
    vi.mocked(getPayPeriodById).mockResolvedValue(processedPayPeriod);
    const updated = {
      ...existingActivity,
      fundingSources: [
        { fundingSourceName: 'Federal Grant', percentage: 50 },
        { fundingSourceName: 'State Grant', percentage: 50 },
      ],
    };

    await updateActivityOnPayPeriod('c1', 'p1', updated);

    expect(writeActivities).toHaveBeenCalled();
  });

  it('throws on a funding source percentage change once status is Allocated', async () => {
    vi.mocked(getPayPeriodById).mockResolvedValue(allocatedPayPeriod);
    const updated = {
      ...existingActivity,
      fundingSources: [
        { fundingSourceName: 'Federal Grant', percentage: 50 },
        { fundingSourceName: 'State Grant', percentage: 50 },
      ],
    };

    await expect(updateActivityOnPayPeriod('c1', 'p1', updated)).rejects.toThrow('allocation report has already been generated');
    expect(writeActivities).not.toHaveBeenCalled();
  });

  it('allows an unrelated no-op update once status is Allocated', async () => {
    vi.mocked(getPayPeriodById).mockResolvedValue(allocatedPayPeriod);

    await updateActivityOnPayPeriod('c1', 'p1', { ...existingActivity });

    expect(writeActivities).toHaveBeenCalled();
  });

  it('throws when the activity is not found on this pay period', async () => {
    vi.mocked(readActivityById).mockResolvedValueOnce(null);

    await expect(updateActivityOnPayPeriod('c1', 'p1', existingActivity)).rejects.toThrow('Activity not found on this pay period: a1');
  });

  it('throws when more than 3 funding sources are provided', async () => {
    const updated = {
      ...existingActivity,
      fundingSources: [
        { fundingSourceName: 'Federal Grant', percentage: 25 },
        { fundingSourceName: 'State Grant', percentage: 25 },
        { fundingSourceName: 'County Grant', percentage: 25 },
        { fundingSourceName: 'City Grant', percentage: 25 },
      ],
    };

    await expect(updateActivityOnPayPeriod('c1', 'p1', updated)).rejects.toThrow('cannot have more than 3 funding sources');
    expect(writeActivities).not.toHaveBeenCalled();
  });

  it('throws when a referenced funding source is missing from the snapshot', async () => {
    const updated = {
      ...existingActivity,
      fundingSources: [{ fundingSourceName: 'Unknown Grant', percentage: 100 }],
    };

    await expect(updateActivityOnPayPeriod('c1', 'p1', updated)).rejects.toThrow('Activity funding source not found');
    expect(writeActivities).not.toHaveBeenCalled();
  });
});
