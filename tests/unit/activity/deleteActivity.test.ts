import { describe, it, expect, vi } from 'vitest';

const { testClient } = vi.hoisted(() => ({
  testClient: { payrollConfigFileId: 'config-1' } as any,
}));

vi.mock('#services/client/getClientById.js', () => ({ default: vi.fn().mockResolvedValue(testClient) }));
vi.mock('#db/activity/deleteActivityRow.js', () => ({ default: vi.fn().mockResolvedValue(undefined) }));

import deleteActivity from '#services/activity/deleteActivity.js';
import getClientById from '#services/client/getClientById.js';
import deleteActivityRow from '#db/activity/deleteActivityRow.js';
import payrollConfigCache from '#utils/caches/payrollConfigCache.js';

describe('deleteActivity', () => {
  it('deletes the activity and invalidates the cache', async () => {
    payrollConfigCache.set('config-1', { activities: [] } as any);

    await deleteActivity('client-1', 'a1');

    expect(deleteActivityRow).toHaveBeenCalledWith('config-1', 'a1');
    expect(payrollConfigCache.get('config-1')).toBeNull();
  });

  it('throws NotFoundError when the client does not exist', async () => {
    vi.mocked(getClientById).mockResolvedValueOnce(null);

    await expect(deleteActivity('unknown-client', 'a1')).rejects.toThrow('Client not found: unknown-client');
  });
});
