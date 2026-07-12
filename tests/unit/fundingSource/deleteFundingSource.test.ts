import { describe, it, expect, vi } from 'vitest';

const { testClient, payrollConfig } = vi.hoisted(() => ({
  testClient: { payrollConfigFileId: 'config-1' } as any,
  payrollConfig: {
    fundingSources: [
      { fundingSourceId: 'fs1', fundingSourceName: 'Federal Grant' },
      { fundingSourceId: 'fs2', fundingSourceName: 'State Grant' },
    ],
    activities: [
      {
        activityId: 'a1',
        activityName: 'Job Coaching',
        fundingSources: [{ fundingSourceName: 'Federal Grant', percentage: 100 }],
      },
    ],
  } as any,
}));

vi.mock('#services/client/getClientById.js', () => ({ default: vi.fn().mockResolvedValue(testClient) }));
vi.mock('#db/payrollConfig/readPayrollConfig.js', () => ({ default: vi.fn().mockResolvedValue(payrollConfig) }));
vi.mock('#db/fundingSource/deleteFundingSourceRow.js', () => ({ default: vi.fn().mockResolvedValue(undefined) }));

import deleteFundingSource from '#services/fundingSource/deleteFundingSource.js';
import getClientById from '#services/client/getClientById.js';
import deleteFundingSourceRow from '#db/fundingSource/deleteFundingSourceRow.js';
import payrollConfigCache from '#utils/caches/payrollConfigCache.js';

describe('deleteFundingSource', () => {
  it('deletes an unreferenced funding source and invalidates the cache', async () => {
    payrollConfigCache.set('config-1', { fundingSources: [] } as any);

    await deleteFundingSource('client-1', 'fs2');

    expect(deleteFundingSourceRow).toHaveBeenCalledWith('config-1', 'fs2');
    expect(payrollConfigCache.get('config-1')).toBeNull();
  });

  it('throws UnprocessableError when an activity still references the funding source, and does not delete', async () => {
    await expect(deleteFundingSource('client-1', 'fs1')).rejects.toThrow(
      'Funding source "Federal Grant" is still referenced by one or more activities and cannot be deleted',
    );
    expect(deleteFundingSourceRow).not.toHaveBeenCalledWith('config-1', 'fs1');
  });

  it('throws NotFoundError when the funding source does not exist', async () => {
    await expect(deleteFundingSource('client-1', 'unknown')).rejects.toThrow(
      'Funding source not found: unknown',
    );
  });

  it('throws NotFoundError when the client does not exist', async () => {
    vi.mocked(getClientById).mockResolvedValueOnce(null);

    await expect(deleteFundingSource('unknown-client', 'fs2')).rejects.toThrow(
      'Client not found: unknown-client',
    );
  });
});
