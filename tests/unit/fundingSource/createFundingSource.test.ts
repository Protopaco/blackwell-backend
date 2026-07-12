import { describe, it, expect, vi } from 'vitest';

const { testClient } = vi.hoisted(() => ({
  testClient: { payrollConfigFileId: 'config-1' } as any,
}));

vi.mock('#services/client/getClientById.js', () => ({ default: vi.fn().mockResolvedValue(testClient) }));
vi.mock('#db/fundingSource/appendFundingSource.js', () => ({ default: vi.fn().mockResolvedValue(undefined) }));

import createFundingSource from '#services/fundingSource/createFundingSource.js';
import getClientById from '#services/client/getClientById.js';
import appendFundingSource from '#db/fundingSource/appendFundingSource.js';
import payrollConfigCache from '#utils/caches/payrollConfigCache.js';

describe('createFundingSource', () => {
  it('appends the funding source with a generated fundingSourceId and invalidates the cache', async () => {
    payrollConfigCache.set('config-1', { fundingSources: [] } as any);

    await createFundingSource('client-1', { fundingSourceName: 'Federal Grant' });

    expect(appendFundingSource).toHaveBeenCalledWith(
      'config-1',
      expect.objectContaining({
        fundingSourceName: 'Federal Grant',
        fundingSourceId: expect.any(String),
      }),
    );
    expect(payrollConfigCache.get('config-1')).toBeNull();
  });

  it('throws NotFoundError when the client does not exist', async () => {
    vi.mocked(getClientById).mockResolvedValueOnce(null);

    await expect(
      createFundingSource('unknown-client', { fundingSourceName: 'Federal Grant' }),
    ).rejects.toThrow('Client not found: unknown-client');
  });
});
