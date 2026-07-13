import { describe, it, expect, vi } from 'vitest';

const { testClient, baseActivity } = vi.hoisted(() => ({
  testClient: { payrollConfigFileId: 'config-1' } as any,
  baseActivity: {
    activityName: 'Job Coaching',
    trackSeparately: false,
    payrollCategory: 'Regular',
    fundingSources: [{ fundingSourceName: 'Federal Grant', percentage: 100 }],
    payRate: 'HourlyPayRate1',
    flatRateAmount: 0,
  },
}));

vi.mock('#services/client/getClientById.js', () => ({ default: vi.fn().mockResolvedValue(testClient) }));
vi.mock('#db/activity/appendActivity.js', () => ({ default: vi.fn().mockResolvedValue(undefined) }));

import createActivity from '#services/activity/createActivity.js';
import getClientById from '#services/client/getClientById.js';
import appendActivity from '#db/activity/appendActivity.js';
import payrollConfigCache from '#utils/caches/payrollConfigCache.js';

describe('createActivity', () => {
  it('appends the activity with a generated activityId and invalidates the cache', async () => {
    payrollConfigCache.set('config-1', { activities: [] } as any);

    await createActivity('client-1', baseActivity as any);

    expect(appendActivity).toHaveBeenCalledWith(
      'config-1',
      expect.objectContaining({ ...baseActivity, activityId: expect.any(String) }),
    );
    expect(payrollConfigCache.get('config-1')).toBeNull();
  });

  it('throws NotFoundError when the client does not exist', async () => {
    vi.mocked(getClientById).mockResolvedValueOnce(null);

    await expect(createActivity('unknown-client', baseActivity as any)).rejects.toThrow(
      'Client not found: unknown-client',
    );
  });

  it('throws UnprocessableError when more than 3 funding sources are provided', async () => {
    vi.mocked(appendActivity).mockClear();
    const tooManyFundingSources = {
      ...baseActivity,
      fundingSources: [
        { fundingSourceName: 'A', percentage: 25 },
        { fundingSourceName: 'B', percentage: 25 },
        { fundingSourceName: 'C', percentage: 25 },
        { fundingSourceName: 'D', percentage: 25 },
      ],
    };

    await expect(createActivity('client-1', tooManyFundingSources as any)).rejects.toThrow(
      'An activity cannot have more than 3 funding sources',
    );
    expect(appendActivity).not.toHaveBeenCalled();
  });

  it('overwrites the last funding source with the remainder before appending', async () => {
    vi.mocked(appendActivity).mockClear();

    await createActivity('client-1', {
      ...baseActivity,
      fundingSources: [
        { fundingSourceName: 'A', percentage: 60 },
        { fundingSourceName: 'B', percentage: 999 },
      ],
    } as any);

    expect(appendActivity).toHaveBeenCalledWith(
      'config-1',
      expect.objectContaining({
        fundingSources: [
          { fundingSourceName: 'A', percentage: 60 },
          { fundingSourceName: 'B', percentage: 40 },
        ],
      }),
    );
  });
});
