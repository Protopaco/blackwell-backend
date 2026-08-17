import { describe, it, expect, vi, beforeEach } from 'vitest';

const { testClient } = vi.hoisted(() => ({
  testClient: { payrollConfigFileId: 'config-1' } as any,
}));

vi.mock('#services/client/getClientById.js', () => ({ default: vi.fn().mockResolvedValue(testClient) }));
vi.mock('#db/activity/writeActivitiesBulk.js', () => ({ default: vi.fn().mockResolvedValue(undefined) }));

import updateActivitiesBatch from '#services/activity/updateActivitiesBatch.js';
import getClientById from '#services/client/getClientById.js';
import writeActivitiesBulk from '#db/activity/writeActivitiesBulk.js';
import payrollConfigCache from '#utils/caches/payrollConfigCache.js';

const activityA = { activityId: 'a1', activityName: 'Admin', groupLabel: null, sortOrder: 0 };
const activityB = { activityId: 'a2', activityName: 'Programs', groupLabel: 'VT Grows', sortOrder: 1 };

describe('updateActivitiesBatch', () => {
  beforeEach(() => {
    vi.mocked(getClientById).mockResolvedValue(testClient);
    vi.mocked(writeActivitiesBulk).mockClear();
    payrollConfigCache.set('config-1', {
      activities: [{ ...activityA }, { ...activityB }],
    } as any);
  });

  it('overlays groupLabel/sortOrder onto a matching activity, leaving the rest untouched', async () => {
    await updateActivitiesBatch('client-1', [{ activityId: 'a1', groupLabel: 'Outreach', sortOrder: 2 }]);

    expect(writeActivitiesBulk).toHaveBeenCalledWith('config-1', [
      { ...activityA, groupLabel: 'Outreach', sortOrder: 2 },
      activityB,
    ]);
  });

  it('overlays multiple activities in one write', async () => {
    await updateActivitiesBatch('client-1', [
      { activityId: 'a1', groupLabel: 'Outreach', sortOrder: 2 },
      { activityId: 'a2', groupLabel: null, sortOrder: 0 },
    ]);

    expect(writeActivitiesBulk).toHaveBeenCalledWith('config-1', [
      { ...activityA, groupLabel: 'Outreach', sortOrder: 2 },
      { ...activityB, groupLabel: null, sortOrder: 0 },
    ]);
  });

  it('rejects the whole batch with a 422-mapped error when an activityId is unknown to PayrollConfig', async () => {
    await expect(
      updateActivitiesBatch('client-1', [{ activityId: 'unknown', groupLabel: null, sortOrder: 0 }]),
    ).rejects.toThrow('Unknown activityId(s) in activity batch: unknown');

    expect(writeActivitiesBulk).not.toHaveBeenCalled();
  });

  it('names every offending id when multiple activityIds are unknown', async () => {
    await expect(
      updateActivitiesBatch('client-1', [
        { activityId: 'unknown-1', groupLabel: null, sortOrder: 0 },
        { activityId: 'unknown-2', groupLabel: null, sortOrder: 1 },
      ]),
    ).rejects.toThrow('Unknown activityId(s) in activity batch: unknown-1, unknown-2');
  });

  it('rejects the whole batch when the update list mixes a known and an unknown activityId', async () => {
    await expect(
      updateActivitiesBatch('client-1', [
        { activityId: 'a1', groupLabel: 'Outreach', sortOrder: 2 },
        { activityId: 'unknown', groupLabel: null, sortOrder: 0 },
      ]),
    ).rejects.toThrow('Unknown activityId(s) in activity batch: unknown');

    expect(writeActivitiesBulk).not.toHaveBeenCalled();
  });

  it('throws NotFoundError when the client does not exist', async () => {
    vi.mocked(getClientById).mockResolvedValueOnce(null);

    await expect(
      updateActivitiesBatch('client-1', [{ activityId: 'a1', groupLabel: null, sortOrder: 0 }]),
    ).rejects.toThrow('Client not found: client-1');
  });
});
