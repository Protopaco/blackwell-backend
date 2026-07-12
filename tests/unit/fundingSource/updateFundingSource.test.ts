import { describe, it, expect, vi } from 'vitest';
import FundingSource from '#models/FundingSource.js';

const { testClient } = vi.hoisted(() => ({
  testClient: { payrollConfigFileId: 'config-1' } as any,
}));

vi.mock('#services/client/getClientById.js', () => ({ default: vi.fn().mockResolvedValue(testClient) }));
vi.mock('#db/fundingSource/writeFundingSources.js', () => ({ default: vi.fn().mockResolvedValue(undefined) }));

import updateFundingSource from '#services/fundingSource/updateFundingSource.js';
import getClientById from '#services/client/getClientById.js';
import writeFundingSources from '#db/fundingSource/writeFundingSources.js';
import payrollConfigCache from '#utils/caches/payrollConfigCache.js';

const fundingSource: FundingSource = { fundingSourceId: 'fs1', fundingSourceName: 'Federal Grant' };

describe('updateFundingSource', () => {
  it('writes the updated funding source and invalidates the cache', async () => {
    payrollConfigCache.set('config-1', { fundingSources: [] } as any);

    await updateFundingSource('client-1', fundingSource);

    expect(writeFundingSources).toHaveBeenCalledWith('config-1', fundingSource);
    expect(payrollConfigCache.get('config-1')).toBeNull();
  });

  it('throws NotFoundError when the client does not exist', async () => {
    vi.mocked(getClientById).mockResolvedValueOnce(null);

    await expect(updateFundingSource('unknown-client', fundingSource)).rejects.toThrow(
      'Client not found: unknown-client',
    );
  });
});
