import { describe, it, expect, vi } from 'vitest';

const { testClient } = vi.hoisted(() => ({
  testClient: { payrollConfigFileId: 'config-1' } as any,
}));

vi.mock('#services/client/getClientById.js', () => ({ default: vi.fn().mockResolvedValue(testClient) }));
vi.mock('#db/supervisor/deleteSupervisorRow.js', () => ({ default: vi.fn().mockResolvedValue(undefined) }));

import deleteSupervisor from '#services/supervisor/deleteSupervisor.js';
import getClientById from '#services/client/getClientById.js';
import deleteSupervisorRow from '#db/supervisor/deleteSupervisorRow.js';
import payrollConfigCache from '#utils/caches/payrollConfigCache.js';

describe('deleteSupervisor', () => {
  it('deletes the supervisor and invalidates the cache', async () => {
    payrollConfigCache.set('config-1', { supervisors: [] } as any);

    await deleteSupervisor('client-1', 's1');

    expect(deleteSupervisorRow).toHaveBeenCalledWith('config-1', 's1');
    expect(payrollConfigCache.get('config-1')).toBeNull();
  });

  it('throws NotFoundError when the client does not exist', async () => {
    vi.mocked(getClientById).mockResolvedValueOnce(null);

    await expect(deleteSupervisor('unknown-client', 's1')).rejects.toThrow('Client not found: unknown-client');
  });
});
