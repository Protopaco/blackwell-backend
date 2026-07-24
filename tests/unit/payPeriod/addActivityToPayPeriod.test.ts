import { describe, it, expect, vi, beforeEach } from 'vitest';
import Client from '#models/Client.js';
import PayPeriod from '#models/PayPeriod.js';
import Activity from '#models/Activity.js';
import FundingSource from '#models/FundingSource.js';

const { client, pendingPayPeriod, openPayPeriod, sourceActivity, snapshotFundingSources } = vi.hoisted(() => ({
  client: {
    clientId: 'c1',
    clientName: 'Acme Co',
    clientCode: 'ACME',
    status: 'Active',
    employeePayrollFolderId: 'epf-1',
    payrollConfigFolderId: 'pcf-1',
    payrollReportFolderId: 'prf-1',
    payrollConfigFileId: 'config-1',
    payPeriodRegistryFileId: 'registry-1',
  } as Client,
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
  sourceActivity: {
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
  ] as FundingSource[],
}));

vi.mock('#services/payPeriod/getClientAndPayPeriod.js', () => ({ default: vi.fn() }));
vi.mock('#db/activity/readActivityById.js', () => ({ default: vi.fn() }));
vi.mock('#db/activity/appendActivity.js', () => ({ default: vi.fn().mockResolvedValue(undefined) }));
vi.mock('#db/fundingSource/readFundingSources.js', () => ({ default: vi.fn().mockResolvedValue(snapshotFundingSources) }));
vi.mock('#utils/caches/payPeriodConfigSnapshotCache.js', () => ({ default: { delete: vi.fn() } }));

import addActivityToPayPeriod from '#services/payPeriod/addActivityToPayPeriod.js';
import getClientAndPayPeriod from '#services/payPeriod/getClientAndPayPeriod.js';
import readActivityById from '#db/activity/readActivityById.js';
import appendActivity from '#db/activity/appendActivity.js';
import payPeriodConfigSnapshotCache from '#utils/caches/payPeriodConfigSnapshotCache.js';

describe('addActivityToPayPeriod', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getClientAndPayPeriod).mockResolvedValue({ client, payPeriod: pendingPayPeriod });
  });

  it('appends the PayrollConfig activity to the snapshot and invalidates the cache', async () => {
    vi.mocked(readActivityById)
      .mockResolvedValueOnce(sourceActivity) // PayrollConfig lookup
      .mockResolvedValueOnce(null); // snapshot lookup

    await addActivityToPayPeriod('c1', 'p1', 'a1');

    expect(readActivityById).toHaveBeenNthCalledWith(1, 'config-1', 'a1');
    expect(readActivityById).toHaveBeenNthCalledWith(2, 'report-1', 'a1');
    expect(appendActivity).toHaveBeenCalledWith('report-1', sourceActivity);
    expect(payPeriodConfigSnapshotCache.delete).toHaveBeenCalledWith('report-1');
  });

  it('throws when a timesheet has already been generated for this pay period', async () => {
    vi.mocked(getClientAndPayPeriod).mockResolvedValue({ client, payPeriod: openPayPeriod });

    await expect(addActivityToPayPeriod('c1', 'p1', 'a1')).rejects.toThrow('already been generated');
    expect(appendActivity).not.toHaveBeenCalled();
  });

  it('throws when the activity is already on this pay period', async () => {
    vi.mocked(readActivityById)
      .mockResolvedValueOnce(sourceActivity)
      .mockResolvedValueOnce(sourceActivity);

    await expect(addActivityToPayPeriod('c1', 'p1', 'a1')).rejects.toThrow('already on this pay period');
    expect(appendActivity).not.toHaveBeenCalled();
  });

  it('throws when the activity is not found in PayrollConfig', async () => {
    vi.mocked(readActivityById).mockResolvedValueOnce(null);

    await expect(addActivityToPayPeriod('c1', 'p1', 'unknown')).rejects.toThrow('Activity not found: unknown');
  });

  it('throws when a referenced funding source is missing from the snapshot', async () => {
    vi.mocked(readActivityById)
      .mockResolvedValueOnce({
        ...sourceActivity,
        fundingSources: [{ fundingSourceName: 'State Grant', percentage: 100 }],
      })
      .mockResolvedValueOnce(null);

    await expect(addActivityToPayPeriod('c1', 'p1', 'a1')).rejects.toThrow('Activity funding source not found');
    expect(appendActivity).not.toHaveBeenCalled();
  });
});
