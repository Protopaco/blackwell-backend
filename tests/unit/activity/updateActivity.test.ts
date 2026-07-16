import { describe, it, expect, vi } from 'vitest';
import Activity from '#models/Activity.js';

const { testClient, activity } = vi.hoisted(() => ({
  testClient: { payrollConfigFileId: 'config-1' } as any,
  activity: {
    activityId: 'a1',
    activityName: 'Job Coaching',
    trackSeparately: false,
    payrollCategory: 'Regular',
    fundingSources: [{ fundingSourceName: 'Federal Grant', percentage: 100 }],
    payRate: 'HourlyPayRate1',
    flatRateAmount: 0,
  } as Activity,
}));

vi.mock('#services/client/getClientById.js', () => ({ default: vi.fn().mockResolvedValue(testClient) }));
vi.mock('#db/activity/writeActivities.js', () => ({ default: vi.fn().mockResolvedValue(undefined) }));
vi.mock('#db/payrollConfig/readPayrollConfig.js', () => ({
  default: vi.fn().mockResolvedValue({
    fundingSources: [
      { fundingSourceId: 'fs-1', fundingSourceName: 'Federal Grant', fundingSourceCode: 'FED' },
      { fundingSourceId: 'fs-2', fundingSourceName: 'A', fundingSourceCode: 'A' },
      { fundingSourceId: 'fs-3', fundingSourceName: 'B', fundingSourceCode: 'B' },
    ],
  }),
}));

import updateActivity from '#services/activity/updateActivity.js';
import getClientById from '#services/client/getClientById.js';
import writeActivities from '#db/activity/writeActivities.js';
import payrollConfigCache from '#utils/caches/payrollConfigCache.js';

describe('updateActivity', () => {
  it('writes the updated activity and invalidates the cache', async () => {
    payrollConfigCache.set('config-1', { activities: [] } as any);

    await updateActivity('client-1', activity);

    expect(writeActivities).toHaveBeenCalledWith('config-1', activity);
    expect(payrollConfigCache.get('config-1')).toBeNull();
  });

  it('throws NotFoundError when the client does not exist', async () => {
    vi.mocked(getClientById).mockResolvedValueOnce(null);

    await expect(updateActivity('unknown-client', activity)).rejects.toThrow('Client not found: unknown-client');
  });

  it('throws UnprocessableError when more than 3 funding sources are provided', async () => {
    vi.mocked(writeActivities).mockClear();

    await expect(
      updateActivity('client-1', {
        ...activity,
        fundingSources: [
          { fundingSourceName: 'A', percentage: 25 },
          { fundingSourceName: 'B', percentage: 25 },
          { fundingSourceName: 'C', percentage: 25 },
          { fundingSourceName: 'D', percentage: 25 },
        ],
      }),
    ).rejects.toThrow('An activity cannot have more than 3 funding sources');
    expect(writeActivities).not.toHaveBeenCalled();
  });

  it('throws UnprocessableError when a funding source is not configured for the client', async () => {
    vi.mocked(writeActivities).mockClear();

    await expect(
      updateActivity('client-1', {
        ...activity,
        fundingSources: [{ fundingSourceName: 'Unknown Grant', percentage: 100 }],
      }),
    ).rejects.toThrow('Activity funding source not found: Unknown Grant');
    expect(writeActivities).not.toHaveBeenCalled();
  });

  it('overwrites the last funding source with the remainder before writing', async () => {
    vi.mocked(writeActivities).mockClear();

    await updateActivity('client-1', {
      ...activity,
      fundingSources: [
        { fundingSourceName: 'A', percentage: 60 },
        { fundingSourceName: 'B', percentage: 999 },
      ],
    });

    expect(writeActivities).toHaveBeenCalledWith(
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
