import { describe, it, expect, vi, beforeEach } from 'vitest';
import Client from '#models/Client.js';
import PayPeriod from '#models/PayPeriod.js';
import FundingSource from '#models/FundingSource.js';

const { client, pendingPayPeriod, openPayPeriod, sourceFundingSource } = vi.hoisted(() => ({
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
  sourceFundingSource: {
    fundingSourceId: 'fs1',
    fundingSourceName: 'Federal Grant',
    fundingSourceCode: 'FG-100',
  } as FundingSource,
}));

vi.mock('#services/payPeriod/getClientAndPayPeriod.js', () => ({ default: vi.fn() }));
vi.mock('#db/fundingSource/readFundingSourceById.js', () => ({ default: vi.fn() }));
vi.mock('#db/fundingSource/appendFundingSource.js', () => ({ default: vi.fn().mockResolvedValue(undefined) }));
vi.mock('#utils/caches/payPeriodConfigSnapshotCache.js', () => ({ default: { delete: vi.fn() } }));

import addFundingSourceToPayPeriod from '#services/payPeriod/addFundingSourceToPayPeriod.js';
import getClientAndPayPeriod from '#services/payPeriod/getClientAndPayPeriod.js';
import readFundingSourceById from '#db/fundingSource/readFundingSourceById.js';
import appendFundingSource from '#db/fundingSource/appendFundingSource.js';
import payPeriodConfigSnapshotCache from '#utils/caches/payPeriodConfigSnapshotCache.js';

describe('addFundingSourceToPayPeriod', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getClientAndPayPeriod).mockResolvedValue({ client, payPeriod: pendingPayPeriod });
  });

  it('appends the PayrollConfig funding source to the snapshot and invalidates the cache', async () => {
    vi.mocked(readFundingSourceById)
      .mockResolvedValueOnce(sourceFundingSource) // PayrollConfig lookup
      .mockResolvedValueOnce(null); // snapshot lookup

    await addFundingSourceToPayPeriod('c1', 'p1', 'fs1');

    expect(readFundingSourceById).toHaveBeenNthCalledWith(1, 'config-1', 'fs1');
    expect(readFundingSourceById).toHaveBeenNthCalledWith(2, 'report-1', 'fs1');
    expect(appendFundingSource).toHaveBeenCalledWith('report-1', sourceFundingSource);
    expect(payPeriodConfigSnapshotCache.delete).toHaveBeenCalledWith('report-1');
  });

  it('throws when a timesheet has already been generated for this pay period', async () => {
    vi.mocked(getClientAndPayPeriod).mockResolvedValue({ client, payPeriod: openPayPeriod });

    await expect(addFundingSourceToPayPeriod('c1', 'p1', 'fs1')).rejects.toThrow('already been generated');
    expect(appendFundingSource).not.toHaveBeenCalled();
  });

  it('throws when the funding source is already on this pay period', async () => {
    vi.mocked(readFundingSourceById)
      .mockResolvedValueOnce(sourceFundingSource)
      .mockResolvedValueOnce(sourceFundingSource);

    await expect(addFundingSourceToPayPeriod('c1', 'p1', 'fs1')).rejects.toThrow('already on this pay period');
    expect(appendFundingSource).not.toHaveBeenCalled();
  });

  it('throws when the funding source is not found in PayrollConfig', async () => {
    vi.mocked(readFundingSourceById).mockResolvedValueOnce(null);

    await expect(addFundingSourceToPayPeriod('c1', 'p1', 'unknown')).rejects.toThrow('Funding source not found: unknown');
  });
});
